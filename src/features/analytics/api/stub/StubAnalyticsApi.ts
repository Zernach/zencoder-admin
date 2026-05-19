import type { IAnalyticsApi } from "../IAnalyticsApi";
import type {
  AnalyticsFilters,
  OverviewResponse,
  OverviewDeltas,
  UsageResponse,
  OutcomesResponse,
  CostResponse,
  ReliabilityResponse,
  GovernanceResponse,
  AgentsHubResponse,
  MachineLearningResponse,
  MlModelRow,
  MlModelType,
  MlTrainingRunRow,
  LiveAgentSessionsResponse,
  LiveAgentSessionsSocket,
  LiveAgentSessionsSocketMessage,
  LiveAgentSessionsSocketReadyState,
  RunListRow,
  TimeSeriesPoint,
  SeedData,
  RunAnomaly,
  KeyValueMetric,
  ProviderCostRow,
  ProviderShareRow,
  ModelProvider,
  LiveAgentSession,
  SeatUserUsageRow,
  TeamPerformanceComparisonRow,
  SearchSuggestionsRequest,
  SearchSuggestionsResponse,
  SearchSuggestion,
  SearchSuggestionGroup,
  SearchEntityType,
  GetAgentDetailRequest,
  GetProjectDetailRequest,
  GetTeamDetailRequest,
  GetHumanDetailRequest,
  GetRunDetailRequest,
  GetRuleDetailRequest,
  GetGoldenQuestionDetailRequest,
  AgentDetailResponse,
  ProjectDetailResponse,
  TeamDetailResponse,
  HumanDetailResponse,
  RunDetailResponse,
  RuleDetailResponse,
  GoldenQuestionDetailResponse,
  EvaluationRunRow,
  EvaluationCriteriaScore,
  UpdateRuleRequest,
  UpdateRuleResponse,
  CreateComplianceRuleRequest,
  CreateComplianceRuleResponse,
  GovernanceRuleRow,
  CreateSeatRequest,
  CreateSeatResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  CreateTeamRequest,
  CreateTeamResponse,
  CreateAgentRequest,
  CreateAgentResponse,
  CreateEvaluationRequest,
  CreateEvaluationResponse,
  UpdateAgentDescriptionRequest,
  UpdateAgentDescriptionResponse,
  PolicyViolationRow,
  TeamViolationMetric,
  CostPerTeamRow,
  ProjectBreakdownRow,
  ProjectEvaluationSection,
  GoldenQuestionEvaluation,
} from "@/features/analytics/types";
import { EVALUATION_CRITERIA_OPTIONS, getCriteriaPromptById } from "@/features/analytics/constants/evaluationCriteria";
import { PROVIDER_VALUES } from "@/features/analytics/constants/providers";
import {
  conflictError,
  internalError,
  notFoundError,
  validationError,
} from "@/contracts/http/errors";
import { round1, round2, round4 } from "../../utils/metricFormulas";
import {
  percentile,
  hashString,
  groupBy,
  countBy,
  sumField,
  filterByTimeRange,
  sortByTimestampDesc,
  safeRate,
  countSucceeded,
  countFailed,
  LIVE_TASKS,
} from "./helpers";
import {
  buildAgentBreakdown,
  buildProjectBreakdown,
  buildFailureCategoryBreakdown,
  computePeakConcurrency,
} from "./builders";

// ─── Stub Configuration ──────────────────────────────────

interface StubConfig {
  latencyMinMs?: number;
  latencyMaxMs?: number;
  debugFailureRate?: number;
  liveStreamTickMs?: number;
}

const BASE_RULE_DESCRIPTIONS: Record<string, string> = {
  "Sensitive Data Redaction":
    "Blocks agent operations that surface customer PII, secrets, or credentials beyond minimum-necessary scope and redacts them from logs and analytics feeds.",
  "Production Access Control":
    "Requires every agent action against production systems to run with scoped, approved credentials and full chain-of-custody capture.",
  "Agent Action Audit Trail":
    "Enforces complete, tamper-evident logging of every agent action so the team can review, replay, and trace exceptions end to end.",
  "Code Change Approval":
    "Prevents agents from merging code changes that lack human review or that bypass required CI checks and approvals.",
  "Approved Model Usage":
    "Limits agent runs to the organization's approved model list, blocking unvetted or out-of-policy models.",
  "Brand & Content Safety":
    "Blocks agent-generated content that violates brand voice, tone, or content-safety guidelines before it is published.",
};

type EvaluationArchetype =
  | "strongImproving"
  | "softImproving"
  | "flat"
  | "softRegressing"
  | "strongRegressing"
  | "recovering"
  | "degrading"
  | "volatile";

const EVALUATION_PROJECT_ARCHETYPES: readonly EvaluationArchetype[] = [
  "strongImproving",
  "softImproving",
  "flat",
  "softRegressing",
  "strongRegressing",
  "recovering",
  "degrading",
  "volatile",
];

const EVALUATION_QUESTION_LIBRARY = {
  engineering: [
    "Did the agent's code change pass all existing tests without introducing regressions?",
    "Was the change scoped to the requested files without unrelated edits?",
    "Did the agent add or update tests covering the new behavior?",
    "Were security and secret-handling checks respected in the diff?",
    "Did the pull request include a clear, accurate summary of the change?",
    "Did the agent follow the repository's lint and style conventions?",
  ],
  product: [
    "Did the output accurately reflect the feature spec and acceptance criteria?",
    "Were edge cases and error states for the feature addressed?",
    "Did the agent ground recommendations in real cellar and usage data?",
    "Was the response scoped to the user's plan and permissions?",
    "Did the agent cite the data sources behind its recommendations?",
    "Were follow-up actions tied to specific owners or work items?",
  ],
  design: [
    "Did the generated asset match the design brief and brand guidelines?",
    "Was the output consistent with the CellarTracker design system?",
    "Did the asset meet resolution and export-format requirements?",
    "Were color contrast and accessibility guidelines respected?",
    "Did the agent produce usable variants without manual rework?",
    "Was the asset free of visual artifacts and layout defects?",
  ],
  marketing: [
    "Did the copy stay on-brand in tone, voice, and style?",
    "Were claims about wine and product features accurate and substantiated?",
    "Did the content meet the channel's format and length constraints?",
    "Was the messaging targeted to the intended audience segment?",
    "Did the agent include accurate calls to action and links?",
    "Was the content free of factual, spelling, and compliance errors?",
  ],
  generic: [
    "Did the response answer the request without skipping required constraints?",
    "Was the agent's output grounded in the available project context?",
    "Did the result include verifiable evidence for the claims it made?",
    "Were failure modes detected and surfaced before finalizing the output?",
    "Did the workflow finish within expected latency targets?",
    "Did the output remain consistent across repeated runs for the same scenario?",
  ],
} as const;

// ─── Machine Learning Systems fixtures ───────────────────
// Trained (non-agentic) ML models that power CellarTracker. These are kept
// separate from the agentic-LLM data so the Systems screen can present every
// intelligent system, not just agents.

function mlModelTypeLabel(type: MlModelType): string {
  switch (type) {
    case "classification": return "Classification";
    case "regression": return "Regression";
    case "forecasting": return "Forecasting";
    case "recommendation": return "Recommendation";
    case "anomaly_detection": return "Anomaly Detection";
  }
}

const ML_MODEL_CATALOG: readonly MlModelRow[] = [
  {
    id: "ml_demand_forecaster", name: "Demand Forecaster",
    modelType: "forecasting", stage: "production", version: "v4.2.0",
    metricLabel: "Forecast Accuracy", metricValue: 0.912, driftStatus: "stable",
    predictionsServed: 1_284_500, p95LatencyMs: 78,
    lastTrainedIso: "2026-05-12T06:00:00.000Z",
  },
  {
    id: "ml_bottle_recommender", name: "Bottle Recommender",
    modelType: "recommendation", stage: "production", version: "v3.1.4",
    metricLabel: "MAP@10", metricValue: 0.781, driftStatus: "drifting",
    predictionsServed: 980_240, p95LatencyMs: 112,
    lastTrainedIso: "2026-05-04T06:00:00.000Z",
  },
  {
    id: "ml_price_optimizer", name: "Cellar Price Optimizer",
    modelType: "regression", stage: "production", version: "v2.7.1",
    metricLabel: "R² Score", metricValue: 0.864, driftStatus: "stable",
    predictionsServed: 412_800, p95LatencyMs: 54,
    lastTrainedIso: "2026-05-09T06:00:00.000Z",
  },
  {
    id: "ml_spoilage_detector", name: "Spoilage Anomaly Detector",
    modelType: "anomaly_detection", stage: "staging", version: "v1.4.0",
    metricLabel: "Precision", metricValue: 0.833, driftStatus: "stable",
    predictionsServed: 76_400, p95LatencyMs: 41,
    lastTrainedIso: "2026-05-15T06:00:00.000Z",
  },
  {
    id: "ml_tasting_classifier", name: "Tasting Note Classifier",
    modelType: "classification", stage: "production", version: "v5.0.2",
    metricLabel: "F1 Score", metricValue: 0.938, driftStatus: "stable",
    predictionsServed: 643_120, p95LatencyMs: 63,
    lastTrainedIso: "2026-05-11T06:00:00.000Z",
  },
  {
    id: "ml_vintage_scorer", name: "Vintage Quality Scorer",
    modelType: "regression", stage: "training", version: "v0.9.0",
    metricLabel: "R² Score", metricValue: 0.704, driftStatus: "critical",
    predictionsServed: 0, p95LatencyMs: 0,
    lastTrainedIso: "2026-05-18T06:00:00.000Z",
  },
];

const ML_TRAINING_RUNS: readonly MlTrainingRunRow[] = [
  {
    id: "mltr_5012", modelId: "ml_vintage_scorer", modelName: "Vintage Quality Scorer",
    status: "running", startedAtIso: "2026-05-19T08:15:00.000Z",
    durationMs: 0, datasetSize: 184_320, metricValue: 0, epochs: 0,
  },
  {
    id: "mltr_5008", modelId: "ml_spoilage_detector", modelName: "Spoilage Anomaly Detector",
    status: "succeeded", startedAtIso: "2026-05-15T02:00:00.000Z",
    durationMs: 4_920_000, datasetSize: 96_200, metricValue: 0.833, epochs: 40,
  },
  {
    id: "mltr_5003", modelId: "ml_tasting_classifier", modelName: "Tasting Note Classifier",
    status: "succeeded", startedAtIso: "2026-05-11T01:30:00.000Z",
    durationMs: 9_240_000, datasetSize: 312_000, metricValue: 0.938, epochs: 60,
  },
  {
    id: "mltr_4998", modelId: "ml_demand_forecaster", modelName: "Demand Forecaster",
    status: "succeeded", startedAtIso: "2026-05-12T03:00:00.000Z",
    durationMs: 6_600_000, datasetSize: 248_000, metricValue: 0.912, epochs: 50,
  },
  {
    id: "mltr_4990", modelId: "ml_price_optimizer", modelName: "Cellar Price Optimizer",
    status: "succeeded", startedAtIso: "2026-05-09T04:00:00.000Z",
    durationMs: 3_180_000, datasetSize: 132_400, metricValue: 0.864, epochs: 35,
  },
  {
    id: "mltr_4982", modelId: "ml_bottle_recommender", modelName: "Bottle Recommender",
    status: "failed", startedAtIso: "2026-05-06T05:00:00.000Z",
    durationMs: 1_020_000, datasetSize: 488_000, metricValue: 0, epochs: 8,
  },
  {
    id: "mltr_4979", modelId: "ml_bottle_recommender", modelName: "Bottle Recommender",
    status: "succeeded", startedAtIso: "2026-05-04T05:00:00.000Z",
    durationMs: 7_860_000, datasetSize: 488_000, metricValue: 0.781, epochs: 45,
  },
];

class StubLiveAgentSessionsSocket implements LiveAgentSessionsSocket {
  public readonly protocol = "ws" as const;
  public onopen: ((event: { protocol: "ws" }) => void) | null = null;
  public onmessage: ((event: { data: string }) => void) | null = null;
  public onerror: ((event: { message: string }) => void) | null = null;
  public onclose: ((event: { code: number; reason: string; wasClean: boolean }) => void) | null = null;
  public readyState: LiveAgentSessionsSocketReadyState = 0;
  private readonly connectTimer: ReturnType<typeof setTimeout>;
  private streamTimer: ReturnType<typeof setInterval> | null = null;
  private closed = false;

  constructor(
    private readonly buildSnapshot: () => LiveAgentSessionsResponse,
    private readonly tickMs: number,
  ) {
    this.connectTimer = setTimeout(() => {
      if (this.closed) return;
      this.readyState = 1;
      this.onopen?.({ protocol: "ws" });
      this.emitSnapshot();
      this.streamTimer = setInterval(() => this.emitSnapshot(), this.tickMs);
    }, 0);
  }

  close(code = 1000, reason = "Normal closure"): void {
    if (this.closed) return;
    this.closed = true;
    this.readyState = 2;
    clearTimeout(this.connectTimer);
    if (this.streamTimer) clearInterval(this.streamTimer);
    this.readyState = 3;
    this.onclose?.({
      code,
      reason,
      wasClean: code === 1000,
    });
  }

  private emitSnapshot(): void {
    if (this.closed || this.readyState !== 1) {
      return;
    }

    try {
      const message: LiveAgentSessionsSocketMessage = {
        channel: "analytics.liveAgentSessions",
        type: "snapshot",
        data: this.buildSnapshot(),
      };
      this.onmessage?.({ data: JSON.stringify(message) });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.onerror?.({ message });
      this.close(1011, "Stub stream error");
    }
  }
}

// ─── Stub Implementation ─────────────────────────────────

export class StubAnalyticsApi implements IAnalyticsApi {
  private seed: SeedData;
  private latencyMin: number;
  private latencyMax: number;
  private failureRate: number;
  private liveStreamTickMs: number;
  private createdViolations: PolicyViolationRow[] = [];
  private createdComplianceRules: Array<{
    id: string;
    title: string;
    description: string;
    createdAtIso: string;
    editedAtIso: string;
    affectedTeamIds: string[];
  }> = [];
  private createdUsers: Array<{ id: string; name: string; email: string; teamId: string }> = [];
  private createdProjects: Array<{ id: string; name: string; teamId: string }> = [];
  private createdTeams: Array<{ id: string; name: string }> = [];
  private createdAgents: Array<{ id: string; name: string; projectId: string; description: string }> = [];
  private createdEvaluations: Array<{
    id: string;
    projectId: string;
    question: string;
    createdAtIso: string;
  }> = [];
  private ruleAssignments: Map<string, { agentIds: string[]; projectIds: string[] }> = new Map();

  constructor(seedData: SeedData, config: StubConfig = {}) {
    this.seed = seedData;
    this.latencyMin = config.latencyMinMs ?? 250;
    this.latencyMax = config.latencyMaxMs ?? 900;
    this.failureRate = config.debugFailureRate ?? 0;
    this.liveStreamTickMs = config.liveStreamTickMs ?? 1_500;
  }

  // ── Network simulation ─────────────────────────────────

  private async simulate(): Promise<void> {
    if (this.failureRate > 0 && Math.random() < this.failureRate) {
      throw internalError("StubAnalyticsApi: simulated failure");
    }
    const ms = this.latencyMin + Math.random() * (this.latencyMax - this.latencyMin);
    if (ms <= 0) return;
    await new Promise((r) => setTimeout(r, ms));
  }

  private assertOrgId(orgId: string): void {
    if (orgId.trim().length === 0) {
      throw validationError("orgId is required", [
        { field: "orgId", code: "required", message: "Provide a non-empty orgId." },
      ]);
    }
  }

  // ── Shared data helpers ────────────────────────────────

  private filterRuns(filters: AnalyticsFilters): RunListRow[] {
    this.assertOrgId(filters.orgId);
    return this.seed.runs.filter((run) => {
      if (run.startedAtIso < filters.timeRange.fromIso) return false;
      if (run.startedAtIso > filters.timeRange.toIso) return false;
      if (filters.teamIds?.length && !filters.teamIds.includes(run.teamId)) return false;
      if (filters.userIds?.length && !filters.userIds.includes(run.userId)) return false;
      if (filters.projectIds?.length && !filters.projectIds.includes(run.projectId)) return false;
      if (filters.providers?.length && !filters.providers.includes(run.provider)) return false;
      if (filters.modelIds?.length && !filters.modelIds.includes(run.modelId)) return false;
      if (filters.statuses?.length && !filters.statuses.includes(run.status)) return false;
      return true;
    });
  }

  private bucketByDay(
    runs: RunListRow[],
    valueFn: (dayRuns: RunListRow[]) => number,
  ): TimeSeriesPoint[] {
    const dayGroups = groupBy(runs, (r) => r.startedAtIso.slice(0, 10));
    return Array.from(dayGroups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, dayRuns]) => ({
        tsIso: `${day}T00:00:00.000Z`,
        value: valueFn(dayRuns),
      }));
  }

  private previousPeriodFilters(filters: AnalyticsFilters): AnalyticsFilters {
    const fromMs = new Date(filters.timeRange.fromIso).getTime();
    const toMs = new Date(filters.timeRange.toIso).getTime();
    const duration = toMs - fromMs;
    return {
      ...filters,
      timeRange: {
        fromIso: new Date(fromMs - duration).toISOString(),
        toIso: new Date(fromMs).toISOString(),
      },
    };
  }

  private pctChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  }

  private clampScore(value: number): number {
    return Math.max(0.55, Math.min(0.99, value));
  }

  private resolveEvaluationQuestionSet(teamName: string): readonly string[] {
    switch (teamName) {
      case "Engineering":
        return EVALUATION_QUESTION_LIBRARY.engineering;
      case "Product":
        return EVALUATION_QUESTION_LIBRARY.product;
      case "Design":
        return EVALUATION_QUESTION_LIBRARY.design;
      case "Marketing":
        return EVALUATION_QUESTION_LIBRARY.marketing;
      default:
        return EVALUATION_QUESTION_LIBRARY.generic;
    }
  }

  /**
   * Returns the archetype's expected score at a normalized timeline
   * position [0..1]. Each archetype produces a distinct shape so projects
   * (and questions within them) trend differently across the same window.
   */
  private archetypeValueAt(archetype: EvaluationArchetype, position: number): number {
    switch (archetype) {
      case "strongImproving":
        return 0.68 + 0.26 * position;
      case "softImproving":
        return 0.79 + 0.10 * position;
      case "flat":
        return 0.84 + Math.sin(position * Math.PI * 3) * 0.012;
      case "softRegressing":
        return 0.89 - 0.10 * position;
      case "strongRegressing":
        return 0.93 - 0.23 * position;
      case "recovering": {
        const trough = 0.40;
        return position <= trough
          ? 0.88 - 0.21 * (position / trough)
          : 0.67 + 0.25 * ((position - trough) / (1 - trough));
      }
      case "degrading": {
        const peak = 0.45;
        return position <= peak
          ? 0.79 + 0.15 * (position / peak)
          : 0.94 - 0.22 * ((position - peak) / (1 - peak));
      }
      case "volatile": {
        const wave1 = Math.sin(position * Math.PI * 4.3) * 0.06;
        const wave2 = Math.cos(position * Math.PI * 7.1) * 0.03;
        return 0.80 + wave1 + wave2;
      }
    }
  }

  private buildProjectEvaluations(
    projectBreakdown: ProjectBreakdownRow[],
    runs: RunListRow[],
  ): ProjectEvaluationSection[] {
    const fallbackTimeline = this.bucketByDay(runs, () => 0).map((p) => p.tsIso);

    return projectBreakdown.map((project) => {
      const projectRuns = runs.filter((run) => run.projectId === project.projectId);
      const projectTimelineSource = this.bucketByDay(projectRuns, () => 0).map((p) => p.tsIso);
      const timeline = projectTimelineSource.length > 0 ? projectTimelineSource : fallbackTimeline;

      const projectHash = hashString(project.projectId);
      const projectArchetype = EVALUATION_PROJECT_ARCHETYPES[
        projectHash % EVALUATION_PROJECT_ARCHETYPES.length
      ]!;

      const questions = this.resolveEvaluationQuestionSet(project.teamName);
      const questionCount = 4 + (projectHash % 3);
      const questionOffset = hashString(`${project.projectId}:questions`) % questions.length;

      const goldenQuestions = Array.from({ length: questionCount }, (_unused, questionIndex) => {
        const prompt = questions[(questionOffset + questionIndex) % questions.length]!;
        const id = `${project.projectId}_q_${questionIndex + 1}`;
        const questionHash = hashString(id);

        // ~70% of questions follow the project archetype; the rest diverge so
        // each project's table mixes improving and regressing rows.
        const followsProject = questionHash % 10 < 7;
        const questionArchetype: EvaluationArchetype = followsProject
          ? projectArchetype
          : EVALUATION_PROJECT_ARCHETYPES[
              (questionHash >>> 3) % EVALUATION_PROJECT_ARCHETYPES.length
            ]!;

        // Per-question baseline offset so two questions in the same project
        // sit at different score levels even with the same archetype.
        const baseOffset = ((questionHash % 17) - 8) / 200; // ~±0.04

        const trendLength = timeline.length;
        const questionTrend = timeline.map((tsIso, idx) => {
          const position = trendLength > 1 ? idx / (trendLength - 1) : 1;
          const archetypeValue = this.archetypeValueAt(questionArchetype, position);
          const noiseSeed = hashString(`${id}:${tsIso}`) % 31;
          const noise = ((noiseSeed - 15) / 1000) * 1.4; // ~±0.021
          const value = this.clampScore(archetypeValue + baseOffset + noise);
          return { tsIso, value: Math.round(value * 1000) / 1000 };
        });

        const latestScore = questionTrend[questionTrend.length - 1]?.value ?? project.successRate;
        // Delta against ~14 days ago — single-day diffs are dominated by
        // noise and misclassify trends as "flat".
        const comparisonIdx = Math.max(0, questionTrend.length - 15);
        const earlierScore = questionTrend[comparisonIdx]?.value ?? latestScore;
        const baseEvaluations = Math.max(12, Math.round(project.totalRuns * 0.08));
        const evaluationCount = baseEvaluations + questionIndex * 3;

        return {
          id,
          question: prompt,
          latestScore,
          scoreDelta: Math.round((latestScore - earlierScore) * 1000) / 1000,
          evaluationCount,
          trend: questionTrend,
        };
      });

      const userCreated = this.buildUserCreatedEvaluationsForProject(project.projectId, timeline);
      const merged = [...goldenQuestions, ...userCreated];

      return {
        projectId: project.projectId,
        projectName: project.projectName,
        goldenQuestions: merged.sort((a, b) => b.latestScore - a.latestScore),
      };
    });
  }

  private buildUserCreatedEvaluationsForProject(
    projectId: string,
    timeline: string[],
  ): GoldenQuestionEvaluation[] {
    const created = this.createdEvaluations.filter((entry) => entry.projectId === projectId);
    if (created.length === 0 || timeline.length === 0) return [];

    return created.map((entry) => {
      const baseHash = hashString(entry.id);
      const baseScore = 0.74 + (baseHash % 18) / 100; // 0.74 - 0.91
      const trend = timeline.map((tsIso, idx) => {
        const position = timeline.length > 1 ? idx / (timeline.length - 1) : 1;
        const trendValue = baseScore + position * 0.04;
        const noiseSeed = hashString(`${entry.id}:${tsIso}`) % 21;
        const noise = ((noiseSeed - 10) / 1000) * 1.2;
        const value = this.clampScore(trendValue + noise);
        return { tsIso, value: Math.round(value * 1000) / 1000 };
      });

      const latestScore = trend[trend.length - 1]?.value ?? baseScore;
      const comparisonIdx = Math.max(0, trend.length - 15);
      const earlierScore = trend[comparisonIdx]?.value ?? latestScore;

      return {
        id: entry.id,
        question: entry.question,
        latestScore,
        scoreDelta: Math.round((latestScore - earlierScore) * 1000) / 1000,
        evaluationCount: 6 + (baseHash % 8),
        trend,
      };
    });
  }

  /**
   * Shape a raw daily series into a gently upward trend with realistic
   * variance (bumps/divots) so charts feel natural in demo data.
   */
  private naturalUpwardTrend(
    points: TimeSeriesPoint[],
    options: {
      minGrowthPct: number;
      volatilityRatio: number;
      baselineBlend: number;
      round?: (value: number) => number;
      maxValue?: number;
      longWaveCycles?: number;
      shortWaveCycles?: number;
      phaseShift?: number;
      bumpCenter?: number;
      divotCenter?: number;
      jitterSalt?: string;
    },
  ): TimeSeriesPoint[] {
    if (points.length <= 2) {
      return points.map((point) => ({
        tsIso: point.tsIso,
        value: options.round ? options.round(point.value) : point.value,
      }));
    }

    const smoothed = points.map((point, index, allPoints) => {
      const windowStart = Math.max(0, index - 5);
      const window = allPoints.slice(windowStart, index + 1);
      const avg =
        window.reduce((sum, samplePoint) => sum + samplePoint.value, 0) / window.length;
      return { tsIso: point.tsIso, value: avg };
    });

    const startValue = smoothed[0]!.value;
    const rawEndValue = smoothed[smoothed.length - 1]!.value;
    const targetEndValue = Math.max(
      rawEndValue,
      startValue * (1 + options.minGrowthPct),
      startValue + 1,
    );
    const span = smoothed.length - 1;

    const longWaveCycles = options.longWaveCycles ?? 3;
    const shortWaveCycles = options.shortWaveCycles ?? 9;
    const phaseShift = options.phaseShift ?? 0.8;
    const bumpCenter = options.bumpCenter ?? 0.33;
    const divotCenter = options.divotCenter ?? 0.7;
    const jitterSalt = options.jitterSalt ?? "default";

    let shaped = smoothed.map((point, index) => {
      const progress = span > 0 ? index / span : 0;
      const baseline = startValue + (targetEndValue - startValue) * progress;
      const amplitude = Math.max(1, baseline * options.volatilityRatio);

      const longWave = Math.sin(progress * Math.PI * longWaveCycles) * amplitude;
      const shortWave =
        Math.sin(progress * Math.PI * shortWaveCycles + phaseShift) * amplitude * 0.45;
      const bump = Math.exp(-Math.pow((progress - bumpCenter) / 0.13, 2)) * amplitude * 0.55;
      const divot = -Math.exp(-Math.pow((progress - divotCenter) / 0.11, 2)) * amplitude * 0.6;
      const jitterSeed = hashString(`${jitterSalt}:${point.tsIso}`) % 13;
      const jitter = ((jitterSeed - 6) / 6) * amplitude * 0.18;

      const blend = baseline * options.baselineBlend + point.value * (1 - options.baselineBlend);
      const nextValue = blend + longWave + shortWave + bump + divot + jitter;
      const clamped =
        options.maxValue != null
          ? Math.max(0, Math.min(options.maxValue, nextValue))
          : Math.max(0, nextValue);
      return { tsIso: point.tsIso, value: clamped };
    });

    const firstValue = shaped[0]!.value;
    const lastValue = shaped[shaped.length - 1]!.value;
    if (lastValue < firstValue) {
      const uplift = firstValue - lastValue + 1;
      shaped = shaped.map((point, index) => {
        const progress = span > 0 ? index / span : 0;
        const raisedValue = point.value + uplift * progress;
        const clamped =
          options.maxValue != null
            ? Math.max(0, Math.min(options.maxValue, raisedValue))
            : Math.max(0, raisedValue);
        return { tsIso: point.tsIso, value: clamped };
      });
    }

    const midpoint = Math.floor(shaped.length / 2);
    const firstHalf = shaped.slice(0, midpoint);
    const secondHalf = shaped.slice(midpoint);
    const avg = (series: TimeSeriesPoint[]): number =>
      series.reduce((sum, point) => sum + point.value, 0) / series.length;
    const firstHalfAvg = avg(firstHalf);
    const secondHalfAvg = avg(secondHalf);
    if (secondHalfAvg <= firstHalfAvg) {
      const uplift = firstHalfAvg - secondHalfAvg + 1;
      shaped = shaped.map((point, index) => {
        const progress = span > 0 ? index / span : 0;
        const tailBias = Math.max(0, (progress - 0.45) / 0.55);
        const raisedValue = point.value + uplift * tailBias;
        const clamped =
          options.maxValue != null
            ? Math.max(0, Math.min(options.maxValue, raisedValue))
            : Math.max(0, raisedValue);
        return { tsIso: point.tsIso, value: clamped };
      });
    }

    return shaped.map((point) => {
      const clamped =
        options.maxValue != null
          ? Math.max(0, Math.min(options.maxValue, point.value))
          : Math.max(0, point.value);
      return {
        tsIso: point.tsIso,
        value: options.round ? options.round(clamped) : clamped,
      };
    });
  }

  /**
   * Apply a logarithmic-exponential rise curve and guarantee one visible
   * high spike and one low spike while preserving an overall upward trend.
   */
  private logarithmicExponentialTrend(
    points: TimeSeriesPoint[],
    options: {
      minGrowthPct: number;
      exponentialWeight: number;
      expIntensity: number;
      logScale: number;
      preserveShape: number;
      highSpikeAt: number;
      lowSpikeAt: number;
      highSpikeLift: number;
      lowSpikeDrop: number;
      maxValue?: number;
      round?: (value: number) => number;
    },
  ): TimeSeriesPoint[] {
    const clampValue = (value: number): number =>
      options.maxValue != null
        ? Math.max(0, Math.min(options.maxValue, value))
        : Math.max(0, value);

    if (points.length <= 2) {
      return points.map((point) => ({
        tsIso: point.tsIso,
        value: options.round ? options.round(clampValue(point.value)) : clampValue(point.value),
      }));
    }

    const span = points.length - 1;
    const startValue = Math.max(points[0]!.value, 1);
    const rawEndValue = points[points.length - 1]!.value;
    const targetEndValue = Math.max(
      rawEndValue,
      startValue * (1 + options.minGrowthPct),
      startValue + 1,
    );
    const expDenominator = Math.exp(options.expIntensity) - 1;
    const logDenominator = Math.log1p(options.logScale);

    let shaped = points.map((point, index) => {
      const progress = span > 0 ? index / span : 0;
      const exponentialProgress =
        expDenominator > 0
          ? (Math.exp(progress * options.expIntensity) - 1) / expDenominator
          : progress;
      const logarithmicProgress =
        logDenominator > 0 ? Math.log1p(progress * options.logScale) / logDenominator : progress;
      const curveProgress =
        exponentialProgress * options.exponentialWeight +
        logarithmicProgress * (1 - options.exponentialWeight);

      const curvedBaseline = startValue + (targetEndValue - startValue) * curveProgress;
      const blended =
        curvedBaseline * (1 - options.preserveShape) + point.value * options.preserveShape;

      return { tsIso: point.tsIso, value: clampValue(blended) };
    });

    const firstValue = shaped[0]!.value;
    const lastValue = shaped[shaped.length - 1]!.value;
    if (lastValue < firstValue) {
      const uplift = firstValue - lastValue + 1;
      shaped = shaped.map((point, index) => {
        const progress = span > 0 ? index / span : 0;
        return {
          tsIso: point.tsIso,
          value: clampValue(point.value + uplift * progress),
        };
      });
    }

    const midpoint = Math.floor(shaped.length / 2);
    const firstHalf = shaped.slice(0, midpoint);
    const secondHalf = shaped.slice(midpoint);
    const avg = (series: TimeSeriesPoint[]): number =>
      series.reduce((sum, point) => sum + point.value, 0) / series.length;

    if (secondHalf.length > 0 && firstHalf.length > 0 && avg(secondHalf) <= avg(firstHalf)) {
      const uplift = avg(firstHalf) - avg(secondHalf) + 1;
      shaped = shaped.map((point, index) => {
        const progress = span > 0 ? index / span : 0;
        const tailBias = Math.max(0, (progress - 0.42) / 0.58);
        return {
          tsIso: point.tsIso,
          value: clampValue(point.value + uplift * tailBias),
        };
      });
    }

    if (shaped.length >= 5) {
      const maxInternalIndex = shaped.length - 2;
      const clampIndex = (index: number): number => Math.max(1, Math.min(maxInternalIndex, index));

      const highIndex = clampIndex(Math.round(span * options.highSpikeAt));
      let lowIndex = clampIndex(Math.round(span * options.lowSpikeAt));
      if (lowIndex === highIndex) {
        lowIndex = clampIndex(lowIndex < highIndex ? lowIndex - 1 : lowIndex + 1);
        if (lowIndex === highIndex) {
          lowIndex = clampIndex(highIndex <= 2 ? highIndex + 1 : highIndex - 1);
        }
      }

      const highNeighborMax = Math.max(
        shaped[highIndex - 1]!.value,
        shaped[highIndex + 1]!.value,
      );
      const forcedHighValue = Math.max(
        shaped[highIndex]!.value,
        highNeighborMax * (1 + options.highSpikeLift),
      );
      shaped[highIndex] = {
        tsIso: shaped[highIndex]!.tsIso,
        value: clampValue(forcedHighValue),
      };

      const lowNeighborMin = Math.min(shaped[lowIndex - 1]!.value, shaped[lowIndex + 1]!.value);
      const lowMultiplier = Math.max(0.15, 1 - options.lowSpikeDrop);
      const forcedLowValue = Math.min(shaped[lowIndex]!.value, lowNeighborMin * lowMultiplier);
      shaped[lowIndex] = {
        tsIso: shaped[lowIndex]!.tsIso,
        value: clampValue(forcedLowValue),
      };
    }

    return shaped.map((point) => {
      const clamped = clampValue(point.value);
      return {
        tsIso: point.tsIso,
        value: options.round ? options.round(clamped) : clamped,
      };
    });
  }

  private costTrendFromRuns(runs: RunListRow[]): TimeSeriesPoint[] {
    const daily = this.bucketByDay(runs, (d) => sumField(d, "costUsd"));
    return this.naturalUpwardTrend(daily, {
      minGrowthPct: 0.2,
      volatilityRatio: 0.12,
      baselineBlend: 0.6,
      round: round2,
      longWaveCycles: 2.8,
      shortWaveCycles: 7.2,
      phaseShift: 1.6,
      bumpCenter: 0.42,
      divotCenter: 0.77,
      jitterSalt: "cost",
    });
  }

  private runsTrendFromRuns(runs: RunListRow[]): TimeSeriesPoint[] {
    const daily = this.bucketByDay(runs, (d) => d.length);
    const naturalTrend = this.naturalUpwardTrend(daily, {
      minGrowthPct: 0.18,
      volatilityRatio: 0.16,
      baselineBlend: 0.58,
      longWaveCycles: 3.6,
      shortWaveCycles: 10.4,
      phaseShift: 0.3,
      bumpCenter: 0.28,
      divotCenter: 0.64,
      jitterSalt: "runs",
    });
    return this.logarithmicExponentialTrend(naturalTrend, {
      minGrowthPct: 0.32,
      exponentialWeight: 0.72,
      expIntensity: 2.6,
      logScale: 12,
      preserveShape: 0.4,
      highSpikeAt: 0.74,
      lowSpikeAt: 0.41,
      highSpikeLift: 0.45,
      lowSpikeDrop: 0.5,
      round: (value) => Math.round(value),
    });
  }

  private reliabilityTrendFromRuns(runs: RunListRow[]): TimeSeriesPoint[] {
    const dailyBuckets = this.bucketByDay(runs, (dayRuns) =>
      safeRate(countSucceeded(dayRuns), dayRuns.length),
    );
    if (dailyBuckets.length <= 2) return dailyBuckets;

    const startValue = 0.40;
    const endValue = 0.78;
    const span = dailyBuckets.length - 1;
    const dipCenter = 0.45;
    const dipDepth = 0.10;
    const dipWidth = 0.12;
    const spikeCenter = 0.72;
    const spikeHeight = 0.09;
    const spikeWidth = 0.08;

    return dailyBuckets.map((point, index) => {
      const progress = span > 0 ? index / span : 0;
      const baseline = startValue + (endValue - startValue) * progress;
      const dipOffset = -dipDepth * Math.exp(-((progress - dipCenter) ** 2) / (2 * dipWidth ** 2));
      const spikeOffset = spikeHeight * Math.exp(-((progress - spikeCenter) ** 2) / (2 * spikeWidth ** 2));
      const wave = Math.sin(progress * Math.PI * 5.4) * 0.018
        + Math.sin(progress * Math.PI * 11.3 + 1.2) * 0.008;
      const jitterSeed = hashString(`reliability:${point.tsIso}`) % 9;
      const jitter = ((jitterSeed - 4) / 4) * 0.006;
      const value = Math.max(0, Math.min(1, baseline + dipOffset + spikeOffset + wave + jitter));
      return { tsIso: point.tsIso, value: Math.round(value * 10000) / 10000 };
    });
  }

  /**
   * Build a gently increasing active-user trend.
   * We smooth day-level variance, preserve gradual growth, and inject one
   * high/low spike pair so the chart has realistic diversity.
   */
  private activeUsersTrendFromRuns(runs: RunListRow[]): TimeSeriesPoint[] {
    const activeUsersByDay = this.bucketByDay(
      runs,
      (dayRuns) => new Set(dayRuns.map((run) => run.userId)).size,
    );
    const maxUsers = this.seed.users.length + this.createdUsers.length;
    // Seed data now produces realistic daily active user counts with
    // natural growth (staggered onboarding) and weekend dips, so no
    // artificial scaling is needed.  Light shaping smooths noise while
    // preserving the organic curve.
    const ceiling = Math.round(maxUsers * 0.75);
    const naturalTrend = this.naturalUpwardTrend(activeUsersByDay, {
      minGrowthPct: 0.15,
      volatilityRatio: 0.12,
      baselineBlend: 0.35,
      longWaveCycles: 2.5,
      shortWaveCycles: 6.0,
      phaseShift: 0.95,
      bumpCenter: 0.40,
      divotCenter: 0.63,
      jitterSalt: "active-users",
      round: (value) => Math.round(value),
      maxValue: ceiling,
    });
    return this.logarithmicExponentialTrend(naturalTrend, {
      minGrowthPct: 0.12,
      exponentialWeight: 0.40,
      expIntensity: 1.6,
      logScale: 5,
      preserveShape: 0.60,
      highSpikeAt: 0.72,
      lowSpikeAt: 0.35,
      highSpikeLift: 0.20,
      lowSpikeDrop: 0.20,
      maxValue: ceiling,
      round: (value) => Math.round(value),
    });
  }

  /**
   * Build a rolling-window active users trend (e.g. 7-day WAU or 30-day MAU).
   * For each day in the dataset, count distinct users in the preceding `windowDays`.
   */
  private rollingActiveUsersTrend(
    runs: RunListRow[],
    windowDays: number,
    salt: string,
  ): TimeSeriesPoint[] {
    const dayGroups = groupBy(runs, (r) => r.startedAtIso.slice(0, 10));
    const sortedDays = Array.from(dayGroups.keys()).sort();
    if (sortedDays.length === 0) return [];

    const rawPoints: TimeSeriesPoint[] = sortedDays.map((day) => {
      const cutoff = new Date(
        new Date(`${day}T00:00:00.000Z`).getTime() - windowDays * 86_400_000,
      ).toISOString().slice(0, 10);
      let uniqueUsers = new Set<string>();
      for (const [d, dayRuns] of dayGroups.entries()) {
        if (d > cutoff && d <= day) {
          for (const run of dayRuns) uniqueUsers.add(run.userId);
        }
      }
      return { tsIso: `${day}T00:00:00.000Z`, value: uniqueUsers.size };
    });

    const maxUsers = this.seed.users.length + this.createdUsers.length;
    // MAU (30-day) is the highest line, WAU (7-day) sits in between DAU and MAU.
    // Higher ceilings since seed data now produces realistic rolling counts.
    const ceilingRatio = windowDays >= 30 ? 0.97 : 0.85;
    const ceiling = Math.round(maxUsers * ceilingRatio);

    return this.naturalUpwardTrend(rawPoints, {
      minGrowthPct: 0.10,
      volatilityRatio: 0.06,
      baselineBlend: 0.40,
      longWaveCycles: 2.0,
      shortWaveCycles: 5.0,
      phaseShift: windowDays === 7 ? 0.3 : 0.7,
      bumpCenter: 0.45,
      divotCenter: 0.6,
      jitterSalt: salt,
      round: (value) => Math.round(value),
      maxValue: ceiling,
    });
  }

  /**
   * Build a logarithmic-exponential PR-merge trend for the outcomes chart.
   * The shape rises over time while keeping one clear high spike and one
   * low spike so the demo visualization feels realistic.
   */
  private outcomesTrendFromRuns(runs: RunListRow[]): TimeSeriesPoint[] {
    const mergedByDay = this.bucketByDay(runs, (dayRuns) =>
      dayRuns.filter((run) => run.prMerged).length,
    );
    const naturalTrend = this.naturalUpwardTrend(mergedByDay, {
      minGrowthPct: 0.16,
      volatilityRatio: 0.17,
      baselineBlend: 0.6,
      longWaveCycles: 2.9,
      shortWaveCycles: 8.7,
      phaseShift: 1.2,
      bumpCenter: 0.34,
      divotCenter: 0.69,
      jitterSalt: "outcomes",
    });
    return this.logarithmicExponentialTrend(naturalTrend, {
      minGrowthPct: 0.3,
      exponentialWeight: 0.68,
      expIntensity: 2.3,
      logScale: 10,
      preserveShape: 0.44,
      highSpikeAt: 0.69,
      lowSpikeAt: 0.35,
      highSpikeLift: 0.38,
      lowSpikeDrop: 0.48,
      round: (value) => Math.round(value),
    });
  }

  // ── API Methods ────────────────────────────────────────

  async getOverview(filters: AnalyticsFilters): Promise<OverviewResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);
    const total = runs.length || 1;
    const succeeded = countSucceeded(runs);
    const totalCost = sumField(runs, "costUsd");
    const providerShares: ProviderShareRow[] = PROVIDER_VALUES
      .map((provider) => ({
        provider,
        share: runs.filter((r) => r.provider === provider).length / total,
      }))
      .filter((entry) => entry.share > 0)
      .sort((a, b) => b.share - a.share);

    const uniqueUsers = new Set(runs.map((r) => r.userId)).size;
    const seatAdoptionRate = safeRate(uniqueUsers, this.seed.users.length);

    const violations = filterByTimeRange(
      this.seed.policyViolations,
      filters.timeRange.fromIso,
      filters.timeRange.toIso,
    );

    // Previous-period KPIs for delta calculations
    const prevFilters = this.previousPeriodFilters(filters);
    const prevRuns = this.filterRuns(prevFilters);
    const prevTotal = prevRuns.length || 1;
    const prevSucceeded = countSucceeded(prevRuns);
    const prevTotalCost = sumField(prevRuns, "costUsd");
    const prevUniqueUsers = new Set(prevRuns.map((r) => r.userId)).size;
    const prevSeatAdoption = safeRate(prevUniqueUsers, this.seed.users.length);
    const prevViolations = filterByTimeRange(
      this.seed.policyViolations,
      prevFilters.timeRange.fromIso,
      prevFilters.timeRange.toIso,
    );

    const deltas: OverviewDeltas = {
      seatAdoptionRate: this.pctChange(seatAdoptionRate, prevSeatAdoption),
      runSuccessRate: this.pctChange(succeeded / total, prevSucceeded / prevTotal),
      totalCostUsd: this.pctChange(totalCost, prevTotalCost),
      policyViolationCount: this.pctChange(violations.length, prevViolations.length),
    };

    // Anomalies: top by cost, duration, tokens
    const byCost = [...runs].sort((a, b) => b.costUsd - a.costUsd);
    const byDuration = [...runs].sort((a, b) => b.durationMs - a.durationMs);
    const byTokens = [...runs].sort((a, b) => b.totalTokens - a.totalTokens);

    const anomalies: RunAnomaly[] = [];
    if (byCost[0])
      anomalies.push({
        runId: byCost[0].id,
        type: "highest_cost",
        label: byCost[0].costUsd.toFixed(2),
        value: byCost[0].costUsd,
      });
    if (byDuration[0])
      anomalies.push({
        runId: byDuration[0].id,
        type: "longest_duration",
        label: `${(byDuration[0].durationMs / 1000).toFixed(1)}s`,
        value: byDuration[0].durationMs,
      });
    if (byTokens[0])
      anomalies.push({
        runId: byTokens[0].id,
        type: "highest_tokens",
        label: `${byTokens[0].totalTokens.toLocaleString()} tokens`,
        value: byTokens[0].totalTokens,
      });

    return {
      kpis: {
        seatAdoptionRate,
        runSuccessRate: succeeded / total,
        totalCostUsd: round2(totalCost),
        providerShares,
        policyViolationCount: violations.length,
      },
      deltas,
      runsTrend: this.runsTrendFromRuns(runs),
      costTrend: this.costTrendFromRuns(runs),
      anomalies,
    };
  }

  async getUsage(filters: AnalyticsFilters): Promise<UsageResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);
    const toDate = new Date(filters.timeRange.toIso);
    const d7 = new Date(toDate.getTime() - 7 * 86_400_000).toISOString();
    const d30 = new Date(toDate.getTime() - 30 * 86_400_000).toISOString();

    const usersLast7d = new Set(runs.filter((r) => r.startedAtIso >= d7).map((r) => r.userId));
    const usersLast30d = new Set(runs.filter((r) => r.startedAtIso >= d30).map((r) => r.userId));
    const seatAdoptionRate = safeRate(usersLast30d.size, this.seed.users.length);

    // Runs per user distribution
    const userRunCounts = countBy(runs, (r) => r.userId);
    const buckets: Record<string, number> = {
      "1-10": 0,
      "11-50": 0,
      "51-100": 0,
      "101-500": 0,
      "500+": 0,
    };
    for (const count of userRunCounts.values()) {
      if (count <= 10) buckets["1-10"]!++;
      else if (count <= 50) buckets["11-50"]!++;
      else if (count <= 100) buckets["51-100"]!++;
      else if (count <= 500) buckets["101-500"]!++;
      else buckets["500+"]!++;
    }
    const runsPerUserDistribution: KeyValueMetric[] = Object.entries(buckets).map(
      ([key, value]) => ({ key, value }),
    );

    // Breakdown by team
    const runsByTeam = groupBy(runs, (r) => r.teamId);
    const breakdownByTeam = this.seed.teams.map((team) => {
      const teamRuns = runsByTeam.get(team.id) ?? [];
      return {
        teamId: team.id,
        teamName: team.name,
        activeUsers: new Set(teamRuns.map((r) => r.userId)).size,
        runsStarted: teamRuns.length,
        runSuccessRate: safeRate(countSucceeded(teamRuns), teamRuns.length),
      };
    });

    return {
      wau: usersLast7d.size,
      mau: usersLast30d.size,
      activeSeats30d: usersLast30d.size,
      seatAdoptionRate,
      activeUsersTrend: this.activeUsersTrendFromRuns(runs),
      wauTrend: this.rollingActiveUsersTrend(runs, 7, "wau"),
      mauTrend: this.rollingActiveUsersTrend(runs, 30, "mau"),
      runsPerUserDistribution,
      breakdownByTeam,
    };
  }

  async getOutcomes(filters: AnalyticsFilters): Promise<OutcomesResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);
    const succeeded = runs.filter((r) => r.status === "succeeded");

    const prsCreated = succeeded.filter((r) => r.prCreated).length;
    const prsMerged = succeeded.filter((r) => r.prMerged).length;
    const prMergeRate = safeRate(prsMerged, prsCreated);

    const withTests = succeeded.filter((r) => r.testsExecuted != null && r.testsExecuted > 0);
    const testsPassRate = withTests.length
      ? withTests.reduce((s, r) => s + (r.testsPassed ?? 0) / (r.testsExecuted ?? 1), 0) /
        withTests.length
      : 0;

    const codeAcceptanceRate = prMergeRate;
    const reworkRate = Math.max(0, 1 - codeAcceptanceRate) * 0.3;

    // Leaderboard: top 5 teams by PRs merged
    const teamMerges = countBy(succeeded, (r) => (r.prMerged ? r.teamId : undefined));
    const leaderboard = Array.from(teamMerges.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([teamId, merged]) => {
        const team = this.seed.teams.find((t) => t.id === teamId);
        const teamSucceeded = succeeded.filter((r) => r.teamId === teamId);
        const teamWithTests = teamSucceeded.filter(
          (r) => r.testsExecuted != null && r.testsExecuted > 0,
        );
        const teamPrsCreated = teamSucceeded.filter((r) => r.prCreated).length;
        return {
          key: team?.name ?? teamId,
          prsMerged: merged,
          testsPassRate: teamWithTests.length
            ? teamWithTests.reduce(
                (s, r) => s + (r.testsPassed ?? 0) / (r.testsExecuted ?? 1),
                0,
              ) / teamWithTests.length
            : 0,
          codeAcceptanceRate: safeRate(merged, teamPrsCreated),
        };
      });

    return {
      prsCreated,
      prsMerged,
      prMergeRate,
      medianTimeToMergeHours: 4.2,
      testsPassRate,
      codeAcceptanceRate,
      reworkRate,
      outcomesTrend: this.outcomesTrendFromRuns(succeeded),
      leaderboard,
    };
  }

  async getCost(filters: AnalyticsFilters): Promise<CostResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);
    const totalCost = sumField(runs, "costUsd");
    const succeededCount = countSucceeded(runs);
    const allTeams = [...this.seed.teams, ...this.createdTeams];

    // Breakdown by project
    const runsByProject = groupBy(runs, (r) => r.projectId);
    const costBreakdown = Array.from(runsByProject.entries())
      .map(([projId, projRuns]) => {
        const projCost = sumField(projRuns, "costUsd");
        const proj = this.seed.projects.find((p) => p.id === projId);
        return {
          key: proj?.name ?? projId,
          totalCostUsd: round2(projCost),
          runsStarted: projRuns.length,
          averageCostPerRunUsd: round4(projCost / (projRuns.length || 1)),
          percentOfTotal: safeRate(projCost, totalCost),
        };
      })
      .sort((a, b) => b.totalCostUsd - a.totalCostUsd);

    const runsByTeam = groupBy(runs, (r) => r.teamId);
    const costPerTeam: CostPerTeamRow[] = Array.from(runsByTeam.entries())
      .map(([teamId, teamRuns]) => {
        const teamCost = sumField(teamRuns, "costUsd");
        const team = allTeams.find((entry) => entry.id === teamId);
        return {
          teamId,
          teamName: team?.name ?? teamId,
          totalCostUsd: round2(teamCost),
          runsStarted: teamRuns.length,
          averageCostPerRunUsd: round4(teamCost / (teamRuns.length || 1)),
          percentOfTotal: safeRate(teamCost, totalCost),
        };
      })
      .sort((a, b) => b.totalCostUsd - a.totalCostUsd);

    // Provider breakdown
    const providerMap = new Map<ModelProvider, { cost: number; count: number; tokens: number }>();
    for (const run of runs) {
      const entry = providerMap.get(run.provider) ?? { cost: 0, count: 0, tokens: 0 };
      entry.cost += run.costUsd;
      entry.count++;
      entry.tokens += run.totalTokens;
      providerMap.set(run.provider, entry);
    }
    const providerBreakdown: ProviderCostRow[] = PROVIDER_VALUES
      .filter((p) => providerMap.has(p))
      .map((provider) => {
        const entry = providerMap.get(provider)!;
        return {
          provider,
          totalCostUsd: round2(entry.cost),
          runCount: entry.count,
          totalTokens: entry.tokens,
          percentOfTotal: safeRate(entry.cost, totalCost),
        };
      });

    // Budget
    const dayCount = this.bucketByDay(runs, () => 0).length || 1;
    const dailySpend = totalCost / dayCount;
    const budgetUsd = 60000;
    const budgetSpent = budgetUsd * 0.55;
    const forecastMonthEndUsd = budgetUsd * 0.78;

    return {
      totalCostUsd: round2(totalCost),
      averageCostPerRunUsd: round4(totalCost / (runs.length || 1)),
      costPerSuccessfulRunUsd: round4(totalCost / (succeededCount || 1)),
      costTrend: this.costTrendFromRuns(runs),
      costBreakdown,
      costPerTeam,
      providerBreakdown,
      budget: {
        budgetUsd,
        spentUsd: round2(budgetSpent),
        remainingUsd: round2(budgetUsd - budgetSpent),
        forecastMonthEndUsd: round2(forecastMonthEndUsd),
      },
    };
  }

  async getReliability(filters: AnalyticsFilters): Promise<ReliabilityResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);
    const total = runs.length || 1;

    const durations = runs.map((r) => r.durationMs).sort((a, b) => a - b);
    const queueWaits = runs.map((r) => r.queueWaitMs).sort((a, b) => a - b);

    return {
      runSuccessRate: countSucceeded(runs) / total,
      errorRate: countFailed(runs) / total,
      p50RunDurationMs: percentile(durations, 50),
      p95RunDurationMs: percentile(durations, 95),
      p95QueueWaitMs: percentile(queueWaits, 95),
      peakConcurrency: computePeakConcurrency(runs),
      failureCategoryBreakdown: buildFailureCategoryBreakdown(runs, this.seed.agents),
      reliabilityTrend: this.reliabilityTrendFromRuns(runs),
      agentBreakdown: buildAgentBreakdown(runs, this.seed.agents, this.seed.projects),
    };
  }

  async getGovernance(filters: AnalyticsFilters): Promise<GovernanceResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);
    const { fromIso, toIso } = filters.timeRange;
    const allTeams = [...this.seed.teams, ...this.createdTeams];
    const allProjects = [...this.seed.projects, ...this.createdProjects];

    const violations = [
      ...filterByTimeRange(this.seed.policyViolations, fromIso, toIso),
      ...filterByTimeRange(this.createdViolations, fromIso, toIso),
    ];
    const secEvents = filterByTimeRange(this.seed.securityEvents, fromIso, toIso);
    const changes = filterByTimeRange(this.seed.policyChanges, fromIso, toIso);
    const createdRulesInRange = this.createdComplianceRules.filter(
      (rule) => rule.createdAtIso >= fromIso && rule.createdAtIso <= toIso,
    );

    // Violations by team (via agentId -> projectId -> teamId) with reason breakdown
    const teamViolationCountById = new Map<string, number>();
    const teamReasonCountById = new Map<string, Map<string, number>>();
    for (const v of violations) {
      const agent = this.seed.agents.find((a) => a.id === v.agentId);
      if (agent) {
        const project = allProjects.find((p) => p.id === agent.projectId);
        if (project) {
          teamViolationCountById.set(
            project.teamId,
            (teamViolationCountById.get(project.teamId) ?? 0) + 1,
          );
          const reasonMap = teamReasonCountById.get(project.teamId) ?? new Map<string, number>();
          reasonMap.set(v.reason, (reasonMap.get(v.reason) ?? 0) + 1);
          teamReasonCountById.set(project.teamId, reasonMap);
        }
      }
    }
    const teamNameById = new Map(allTeams.map((team) => [team.id, team.name]));
    const teamRuleCountById = new Map<string, number>();

    for (const change of changes) {
      teamRuleCountById.set(
        change.targetTeamId,
        (teamRuleCountById.get(change.targetTeamId) ?? 0) + 1,
      );
    }

    for (const rule of createdRulesInRange) {
      for (const teamId of rule.affectedTeamIds) {
        teamRuleCountById.set(teamId, (teamRuleCountById.get(teamId) ?? 0) + 1);
      }
    }

    const violationsByTeam: TeamViolationMetric[] = Array.from(teamViolationCountById.entries())
      .map(([teamId, total]) => ({
        teamName: teamNameById.get(teamId) ?? teamId,
        totalViolations: total,
        reasonBreakdown: Array.from(teamReasonCountById.get(teamId)?.entries() ?? [])
          .map(([reason, count]) => ({ key: reason, value: count }))
          .sort((a, b) => b.value - a.value || a.key.localeCompare(b.key)),
      }))
      .sort((a, b) => b.totalViolations - a.totalViolations || a.teamName.localeCompare(b.teamName));

    // Seat user usage
    const userUsageMap = new Map<
      string,
      { runsCount: number; totalTokens: number; totalCostUsd: number }
    >();
    for (const run of runs) {
      const usage = userUsageMap.get(run.userId) ?? {
        runsCount: 0,
        totalTokens: 0,
        totalCostUsd: 0,
      };
      usage.runsCount += 1;
      usage.totalTokens += run.totalTokens;
      usage.totalCostUsd += run.costUsd;
      userUsageMap.set(run.userId, usage);
    }

    const allUsers = [...this.seed.users, ...this.createdUsers];
    const seatUserUsage: SeatUserUsageRow[] = Array.from(userUsageMap.entries())
      .map(([userId, usage]) => {
        const user = allUsers.find((u) => u.id === userId);
        if (!user) return null;
        return {
          userId,
          fullName: user.name,
          teamId: user.teamId,
          teamName: teamNameById.get(user.teamId) ?? user.teamId,
          runsCount: usage.runsCount,
          totalTokens: usage.totalTokens,
          totalCostUsd: round2(usage.totalCostUsd),
        };
      })
      .filter((row): row is SeatUserUsageRow => row !== null);

    // Include created users with no runs (0 usage)
    for (const created of this.createdUsers) {
      if (!seatUserUsage.some((s) => s.userId === created.id)) {
        seatUserUsage.push({
          userId: created.id,
          fullName: created.name,
          teamId: created.teamId,
          teamName: teamNameById.get(created.teamId) ?? created.teamId,
          runsCount: 0,
          totalTokens: 0,
          totalCostUsd: 0,
        });
      }
    }

    seatUserUsage.sort((a, b) => {
      if (b.runsCount !== a.runsCount) return b.runsCount - a.runsCount;
      if (b.totalTokens !== a.totalTokens) return b.totalTokens - a.totalTokens;
      if (b.totalCostUsd !== a.totalCostUsd) return b.totalCostUsd - a.totalCostUsd;
      return a.fullName.localeCompare(b.fullName);
    });

    const runsByTeam = groupBy(runs, (run) => run.teamId);
    const teamPerformanceComparison: TeamPerformanceComparisonRow[] = allTeams
      .map((team) => {
        const teamRuns = runsByTeam.get(team.id) ?? [];
        const succeeded = countSucceeded(teamRuns);
        const policyViolationCount = teamViolationCountById.get(team.id) ?? 0;
        return {
          teamId: team.id,
          teamName: team.name,
          runsCount: teamRuns.length,
          successRate: safeRate(succeeded, teamRuns.length),
          policyViolationCount,
          rulesCount: teamRuleCountById.get(team.id) ?? 0,
          policyViolationRate: safeRate(policyViolationCount, teamRuns.length),
          totalCostUsd: round2(sumField(teamRuns, "costUsd")),
        };
      })
      .sort((a, b) => {
        if (b.runsCount !== a.runsCount) return b.runsCount - a.runsCount;
        if (b.successRate !== a.successRate) return b.successRate - a.successRate;
        if (a.policyViolationCount !== b.policyViolationCount) {
          return a.policyViolationCount - b.policyViolationCount;
        }
        return a.teamName.localeCompare(b.teamName);
      });

    const sortedSeedPolicyChanges = [...this.seed.policyChanges].sort((a, b) =>
      a.timestampIso.localeCompare(b.timestampIso),
    );
    const seedPolicyChangeCount = sortedSeedPolicyChanges.length || 1;
    const defaultCreatedIso = sortedSeedPolicyChanges[0]?.timestampIso ?? fromIso;
    const defaultEditedIso =
      sortedSeedPolicyChanges[sortedSeedPolicyChanges.length - 1]?.timestampIso ?? toIso;
    const complianceItemCount = this.seed.complianceItems.length || 1;

    const baseRules: GovernanceRuleRow[] = this.seed.complianceItems.map((item, index) => {
      const createdAtIso =
        sortedSeedPolicyChanges[index % seedPolicyChangeCount]?.timestampIso ??
        defaultCreatedIso;
      const editedAtIso =
        sortedSeedPolicyChanges[
          sortedSeedPolicyChanges.length - 1 - (index % seedPolicyChangeCount)
        ]?.timestampIso ?? defaultEditedIso;
      const earliestIso = createdAtIso <= editedAtIso ? createdAtIso : editedAtIso;
      const latestIso = editedAtIso >= createdAtIso ? editedAtIso : createdAtIso;
      const runsCheckedCount = Math.max(
        1,
        Math.round(((index + 1) / complianceItemCount) * runs.length),
      );

      return {
        id: `rule_seed_${index + 1}`,
        title: item.label,
        description:
          BASE_RULE_DESCRIPTIONS[item.label] ??
          `${item.label} guardrail for policy-safe execution across projects and teams.`,
        createdAtIso: earliestIso,
        editedAtIso: latestIso,
        runsCheckedCount,
      };
    });

    const createdRules: GovernanceRuleRow[] = this.createdComplianceRules.map((rule) => {
      const runsCheckedCount =
        rule.affectedTeamIds.length === 0
          ? runs.length
          : runs.filter((run) => rule.affectedTeamIds.includes(run.teamId)).length;
      const latestRelatedViolationIso = this.createdViolations
        .filter((violation) => violation.id.startsWith(`${rule.id}_viol_`))
        .map((violation) => violation.timestampIso)
        .sort((a, b) => b.localeCompare(a))[0];
      const editedAtIso =
        latestRelatedViolationIso != null && latestRelatedViolationIso > rule.editedAtIso
          ? latestRelatedViolationIso
          : rule.editedAtIso;

      return {
        id: rule.id,
        title: rule.title,
        description: rule.description,
        createdAtIso: rule.createdAtIso,
        editedAtIso,
        runsCheckedCount,
      };
    });

    const rules = [...baseRules, ...createdRules];

    return {
      policyViolationCount: violations.length,
      violationsByTeam,
      recentViolations: sortByTimestampDesc(violations).slice(0, 20),
      securityEvents: sortByTimestampDesc(secEvents).slice(0, 20),
      rules,
      complianceItems: this.seed.complianceItems,
      policyChanges: sortByTimestampDesc(changes).slice(0, 20),
      seatUserUsage,
      teamPerformanceComparison,
    };
  }

  async getAgentsHub(filters: AnalyticsFilters): Promise<AgentsHubResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);
    const total = runs.length || 1;
    const succeeded = countSucceeded(runs);
    const totalCost = sumField(runs, "costUsd");

    const durations = runs.map((r) => r.durationMs).sort((a, b) => a - b);
    const queueWaits = runs.map((r) => r.queueWaitMs).sort((a, b) => a - b);

    const projectBreakdown = buildProjectBreakdown(runs, this.seed.projects, this.seed.teams);
    const projectEvaluations = this.buildProjectEvaluations(projectBreakdown, runs);

    const recentRuns = [...runs]
      .sort((a, b) => b.startedAtIso.localeCompare(a.startedAtIso))
      .slice(0, 25);

    return {
      runSuccessRate: succeeded / total,
      errorRate: countFailed(runs) / total,
      p50RunDurationMs: percentile(durations, 50),
      p95RunDurationMs: percentile(durations, 95),
      p95QueueWaitMs: percentile(queueWaits, 95),
      peakConcurrency: computePeakConcurrency(runs),
      failureCategoryBreakdown: buildFailureCategoryBreakdown(runs, this.seed.agents),
      reliabilityTrend: this.reliabilityTrendFromRuns(runs),
      p50DurationTrend: this.bucketByDay(runs, (d) => percentile(d.map((r) => r.durationMs).sort((a, b) => a - b), 50)),
      p95DurationTrend: this.bucketByDay(runs, (d) => percentile(d.map((r) => r.durationMs).sort((a, b) => a - b), 95)),
      p95QueueWaitTrend: this.bucketByDay(runs, (d) => percentile(d.map((r) => r.queueWaitMs).sort((a, b) => a - b), 95)),
      peakConcurrencyTrend: this.bucketByDay(runs, (d) => computePeakConcurrency(d)),
      projectEvaluations,
      agentBreakdown: buildAgentBreakdown(runs, this.seed.agents, this.seed.projects),
      totalProjects: this.seed.projects.length,
      activeProjects: projectBreakdown.length,
      totalRuns: runs.length,
      overallSuccessRate: safeRate(succeeded, runs.length),
      totalCostUsd: round2(totalCost),
      projectBreakdown,
      recentRuns,
    };
  }

  /**
   * Builds a deterministic daily time series spanning the filter's time range.
   * Used for ML model trends, which are catalog-driven rather than run-derived.
   */
  private buildMlDailyTrend(
    filters: AnalyticsFilters,
    baseValue: number,
    amplitude: number,
    seedOffset: number,
    integer: boolean,
  ): TimeSeriesPoint[] {
    const dayMs = 86_400_000;
    const fromMs = new Date(filters.timeRange.fromIso).getTime();
    const toMs = new Date(filters.timeRange.toIso).getTime();
    const dayCount = Math.max(1, Math.min(90, Math.round((toMs - fromMs) / dayMs)));
    const points: TimeSeriesPoint[] = [];
    for (let i = 0; i < dayCount; i++) {
      const ts = new Date(fromMs + i * dayMs);
      const wave = Math.sin((i + seedOffset) / 3.3) * amplitude;
      const noise = ((hashString(`ml-${seedOffset}-${i}`) % 100) / 100 - 0.5) * amplitude * 0.4;
      const raw = baseValue + wave + noise;
      points.push({
        tsIso: `${ts.toISOString().slice(0, 10)}T00:00:00.000Z`,
        value: integer ? Math.max(0, Math.round(raw)) : round1(raw),
      });
    }
    return points;
  }

  async getMachineLearning(filters: AnalyticsFilters): Promise<MachineLearningResponse> {
    await this.simulate();
    this.assertOrgId(filters.orgId);

    const models = ML_MODEL_CATALOG.map((m) => ({ ...m }));
    const trainingRuns = ML_TRAINING_RUNS.map((r) => ({ ...r }));
    const production = models.filter((m) => m.stage === "production");

    const typeCounts = countBy(models, (m) => mlModelTypeLabel(m.modelType));
    const modelTypeBreakdown = Array.from(typeCounts.entries())
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalModels: models.length,
      modelsInProduction: production.length,
      predictionsServed24h: models.reduce(
        (sum, m) => sum + Math.round(m.predictionsServed * 0.018),
        0,
      ),
      avgModelAccuracy: safeRate(
        production.reduce((sum, m) => sum + m.metricValue, 0),
        production.length,
      ),
      driftAlerts: models.filter((m) => m.driftStatus !== "stable").length,
      accuracyTrend: this.buildMlDailyTrend(filters, 90.5, 2.4, 7, false),
      predictionVolumeTrend: this.buildMlDailyTrend(filters, 44_000, 8_200, 19, true),
      modelTypeBreakdown,
      models,
      trainingRuns,
    };
  }

  connectLiveAgentSessionsSocket(filters: AnalyticsFilters): LiveAgentSessionsSocket {
    this.assertOrgId(filters.orgId);
    return new StubLiveAgentSessionsSocket(
      () => this.buildLiveAgentSessionsSnapshot(filters),
      this.liveStreamTickMs,
    );
  }

  private buildLiveAgentSessionsSnapshot(filters: AnalyticsFilters): LiveAgentSessionsResponse {
    const filteredRuns = this.filterRuns({ ...filters, statuses: ["queued", "running"] });
    const orgWideActive = this.seed.runs.filter(
      (run) => run.status === "queued" || run.status === "running",
    );
    const sourcePool = filteredRuns.length > 0 ? filteredRuns : orgWideActive;
    const safePool = sourcePool.length > 0 ? sourcePool : this.seed.runs;
    if (safePool.length === 0) {
      return { activeSessions: [], lastUpdatedIso: new Date().toISOString() };
    }

    const findEntity = <T extends { id: string }>(list: T[], id: string): T | undefined =>
      list.find((item) => item.id === id);

    const baseSessions: LiveAgentSession[] = safePool
      .sort((a, b) => b.startedAtIso.localeCompare(a.startedAtIso))
      .slice(0, 10)
      .map((run) => {
        const agent = findEntity(this.seed.agents, run.agentId);
        const project = findEntity(this.seed.projects, run.projectId);
        const team = findEntity(this.seed.teams, run.teamId);
        const user = findEntity(this.seed.users, run.userId);
        const taskIndex = hashString(run.id + run.agentId) % LIVE_TASKS.length;

        return {
          sessionId: `seed_${run.id}`,
          runId: run.id,
          agentId: run.agentId,
          agentName: agent?.name ?? run.agentId,
          projectName: project?.name ?? run.projectId,
          teamId: run.teamId,
          teamName: team?.name ?? run.teamId,
          userName: user?.name ?? run.userId,
          status: run.status === "queued" ? "queued" : "running",
          startedAtIso: run.startedAtIso,
          currentTask: LIVE_TASKS[taskIndex]!,
        };
      });

    const nowMs = Date.now();
    const window = Math.floor(nowMs / 12_000);
    const syntheticCount = 6 + (window % 5);
    const fallbackRun = safePool[0]!;
    const syntheticSessions: LiveAgentSession[] = Array.from({ length: syntheticCount }).map(
      (_, index) => {
        const run = safePool[(window + index) % safePool.length] ?? fallbackRun;
        const agent = findEntity(this.seed.agents, run.agentId) ?? this.seed.agents[0]!;
        const project = findEntity(this.seed.projects, run.projectId) ?? this.seed.projects[0]!;
        const team = findEntity(this.seed.teams, run.teamId);
        const user = findEntity(this.seed.users, run.userId) ?? this.seed.users[0]!;
        const taskIndex = (window + index) % LIVE_TASKS.length;
        const startedAgoMs = 40_000 + index * 55_000 + ((window + index) % 5) * 10_000;

        return {
          sessionId: `live_${window}_${index}_${agent.id}`,
          runId: `live_run_${window}_${index}`,
          agentId: agent.id,
          agentName: agent.name,
          projectName: project.name,
          teamId: run.teamId,
          teamName: team?.name ?? run.teamId,
          userName: user.name,
          status: (window + index) % 4 === 0 ? "queued" : "running",
          startedAtIso: new Date(nowMs - startedAgoMs).toISOString(),
          currentTask: LIVE_TASKS[taskIndex]!,
        };
      },
    );

    const sessionsById = new Map<string, LiveAgentSession>();
    for (const session of [...syntheticSessions, ...baseSessions]) {
      sessionsById.set(session.sessionId, session);
    }
    const sessions = Array.from(sessionsById.values())
      .sort((a, b) => b.startedAtIso.localeCompare(a.startedAtIso))
      .slice(0, 18);

    return { activeSessions: sessions, lastUpdatedIso: new Date().toISOString() };
  }

  async getSearchSuggestions(
    request: SearchSuggestionsRequest,
  ): Promise<SearchSuggestionsResponse> {
    await this.simulate();
    this.assertOrgId(request.orgId);

    const query = request.query.trim().toLowerCase();
    const totalLimit = Math.max(1, request.limit ?? 25);
    const offset = request.cursor ? Number.parseInt(request.cursor, 10) : 0;
    if (offset < 0 || Number.isNaN(offset)) {
      throw validationError("cursor must be a non-negative integer string", [
        {
          field: "cursor",
          code: "invalid_format",
          message: "Expected cursor to be an encoded numeric offset.",
        },
      ]);
    }

    if (query.length === 0) {
      return { groups: [], totalCount: 0, nextCursor: undefined };
    }

    const matchAndScore = (text: string): number => {
      const lower = text.toLowerCase();
      if (lower === query) return 3;
      if (lower.startsWith(query)) return 2;
      if (lower.includes(query)) return 1;
      return 0;
    };

    const buildGroup = (
      entityType: SearchEntityType,
      label: string,
      candidates: SearchSuggestion[],
    ): SearchSuggestionGroup | null => {
      const scored = candidates
        .map((s) => ({ suggestion: s, score: Math.max(matchAndScore(s.title), matchAndScore(s.subtitle ?? "")) }))
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score || a.suggestion.title.localeCompare(b.suggestion.title))
        .map((s) => s.suggestion);

      if (scored.length === 0) return null;
      return { entityType, label, suggestions: scored };
    };

    const teamNameById = new Map(this.seed.teams.map((t) => [t.id, t.name]));
    const projectNameById = new Map(this.seed.projects.map((p) => [p.id, p.name]));

    const agentCandidates: SearchSuggestion[] = this.seed.agents.map((a) => ({
      id: a.id,
      entityType: "agent" as const,
      title: a.name,
      subtitle: projectNameById.get(a.projectId) ?? a.projectId,
    }));

    const projectCandidates: SearchSuggestion[] = this.seed.projects.map((p) => {
      const team = this.seed.teams.find((t) => t.id === p.teamId);
      return {
        id: p.id,
        entityType: "project" as const,
        title: p.name,
        subtitle: team?.name ?? p.teamId,
      };
    });

    const teamCandidates: SearchSuggestion[] = this.seed.teams.map((t) => ({
      id: t.id,
      entityType: "team" as const,
      title: t.name,
    }));

    const humanCandidates: SearchSuggestion[] = this.seed.users.map((u) => ({
      id: u.id,
      entityType: "human" as const,
      title: u.name,
      subtitle: teamNameById.get(u.teamId) ?? u.teamId,
    }));

    const runCandidates: SearchSuggestion[] = this.seed.runs.slice(0, 200).map((r) => ({
      id: r.id,
      entityType: "run" as const,
      title: r.id,
      subtitle: `${r.status} — ${r.provider}`,
    }));

    const groupDefs: [SearchEntityType, string, SearchSuggestion[]][] = [
      ["agent", "Agents", agentCandidates],
      ["project", "Projects", projectCandidates],
      ["team", "Teams", teamCandidates],
      ["human", "Humans", humanCandidates],
      ["run", "Runs", runCandidates],
    ];

    const fullGroups: SearchSuggestionGroup[] = [];
    for (const [entityType, label, candidates] of groupDefs) {
      const group = buildGroup(entityType, label, candidates);
      if (group) {
        fullGroups.push(group);
      }
    }

    const flattened = fullGroups.flatMap((group) =>
      group.suggestions.map((suggestion) => ({
        entityType: group.entityType,
        label: group.label,
        suggestion,
      })),
    );

    const paged = flattened.slice(offset, offset + totalLimit);
    const nextCursor =
      offset + totalLimit < flattened.length ? String(offset + totalLimit) : undefined;

    const pagedGroupsByType = new Map<SearchEntityType, SearchSuggestionGroup>();
    for (const item of paged) {
      const existing = pagedGroupsByType.get(item.entityType);
      if (existing) {
        existing.suggestions.push(item.suggestion);
      } else {
        pagedGroupsByType.set(item.entityType, {
          entityType: item.entityType,
          label: item.label,
          suggestions: [item.suggestion],
        });
      }
    }

    const groups = groupDefs
      .map(([entityType]) => pagedGroupsByType.get(entityType))
      .filter((group): group is SearchSuggestionGroup => group != null);

    return {
      groups,
      totalCount: flattened.length,
      nextCursor,
    };
  }

  async getAgentDetail(request: GetAgentDetailRequest): Promise<AgentDetailResponse> {
    await this.simulate();
    this.assertOrgId(request.orgId);
    const { agentId } = request;
    const agent = this.seed.agents.find((a) => a.id === agentId);
    if (!agent) throw notFoundError("Agent", agentId);
    const project = this.seed.projects.find((p) => p.id === agent.projectId);
    const team = project ? this.seed.teams.find((t) => t.id === project.teamId) : undefined;
    const agentRuns = this.seed.runs.filter((r) => r.agentId === agentId);
    const succeeded = agentRuns.filter((r) => r.status === "succeeded").length;
    return {
      agent,
      projectName: project?.name ?? agent.projectId,
      teamName: team?.name ?? "Unknown",
      totalRuns: agentRuns.length,
      successRate: safeRate(succeeded, agentRuns.length),
      avgDurationMs: agentRuns.length > 0 ? Math.round(sumField(agentRuns, "durationMs") / agentRuns.length) : 0,
      totalCostUsd: round2(sumField(agentRuns, "costUsd")),
      recentRuns: agentRuns.sort((a, b) => b.startedAtIso.localeCompare(a.startedAtIso)).slice(0, 10),
      userMap: Object.fromEntries(
        [...new Set(agentRuns.map((r) => r.userId))].map((uid) => {
          const user = this.seed.users.find((u) => u.id === uid);
          return [uid, user?.name ?? uid];
        }),
      ),
    };
  }

  async getProjectDetail(request: GetProjectDetailRequest): Promise<ProjectDetailResponse> {
    await this.simulate();
    this.assertOrgId(request.orgId);
    const { projectId } = request;
    const project = this.seed.projects.find((p) => p.id === projectId);
    if (!project) throw notFoundError("Project", projectId);
    const team = this.seed.teams.find((t) => t.id === project.teamId);
    const projectAgents = this.seed.agents.filter((a) => a.projectId === projectId);
    const projectRuns = this.seed.runs.filter((r) => r.projectId === projectId);
    const succeeded = projectRuns.filter((r) => r.status === "succeeded").length;
    const totalCost = sumField(projectRuns, "costUsd");
    return {
      project,
      teamName: team?.name ?? project.teamId,
      agentCount: projectAgents.length,
      totalRuns: projectRuns.length,
      successRate: safeRate(succeeded, projectRuns.length),
      totalCostUsd: round2(totalCost),
      avgCostPerRunUsd: round2(safeRate(totalCost, projectRuns.length)),
      agents: projectAgents,
      recentRuns: projectRuns.sort((a, b) => b.startedAtIso.localeCompare(a.startedAtIso)).slice(0, 10),
    };
  }

  async getTeamDetail(request: GetTeamDetailRequest): Promise<TeamDetailResponse> {
    await this.simulate();
    this.assertOrgId(request.orgId);
    const { teamId } = request;
    const team = this.seed.teams.find((t) => t.id === teamId);
    if (!team) throw notFoundError("Team", teamId);
    const members = this.seed.users.filter((u) => u.teamId === teamId);
    const projects = this.seed.projects.filter((p) => p.teamId === teamId);
    const teamRuns = this.seed.runs.filter((r) => r.teamId === teamId);
    const succeeded = teamRuns.filter((r) => r.status === "succeeded").length;
    return {
      team,
      memberCount: members.length,
      projectCount: projects.length,
      totalRuns: teamRuns.length,
      successRate: safeRate(succeeded, teamRuns.length),
      totalCostUsd: round2(sumField(teamRuns, "costUsd")),
      members,
      projects,
    };
  }

  async getHumanDetail(request: GetHumanDetailRequest): Promise<HumanDetailResponse> {
    await this.simulate();
    this.assertOrgId(request.orgId);
    const { humanId } = request;
    const user = this.seed.users.find((u) => u.id === humanId);
    if (!user) throw notFoundError("Human", humanId);
    const team = this.seed.teams.find((t) => t.id === user.teamId);
    const userRuns = this.seed.runs.filter((r) => r.userId === humanId);
    return {
      user,
      teamName: team?.name ?? user.teamId,
      totalRuns: userRuns.length,
      totalTokens: userRuns.reduce((s, r) => s + r.totalTokens, 0),
      totalCostUsd: round2(sumField(userRuns, "costUsd")),
      recentRuns: userRuns.sort((a, b) => b.startedAtIso.localeCompare(a.startedAtIso)).slice(0, 10),
    };
  }

  async getRunDetail(request: GetRunDetailRequest): Promise<RunDetailResponse> {
    await this.simulate();
    this.assertOrgId(request.orgId);
    const { runId } = request;
    const run = this.seed.runs.find((r) => r.id === runId);
    if (!run) throw notFoundError("Run", runId);
    const agent = this.seed.agents.find((a) => a.id === run.agentId);
    const project = this.seed.projects.find((p) => p.id === run.projectId);
    const team = project ? this.seed.teams.find((t) => t.id === project.teamId) : undefined;
    const user = this.seed.users.find((u) => u.id === run.userId);
    return {
      run,
      agentName: agent?.name ?? run.agentId,
      projectName: project?.name ?? run.projectId,
      teamName: team?.name ?? "Unknown",
      userName: user?.name ?? run.userId,
    };
  }

  async getRuleDetail(request: GetRuleDetailRequest): Promise<RuleDetailResponse> {
    await this.simulate();
    this.assertOrgId(request.orgId);
    const { ruleId } = request;
    // Build the same rules list that getGovernance produces so we can look up by id
    const baseRules: GovernanceRuleRow[] = this.seed.complianceItems.map((item, index) => {
      const sortedChanges = [...this.seed.policyChanges].sort((a, b) =>
        a.timestampIso.localeCompare(b.timestampIso),
      );
      const changeCount = sortedChanges.length || 1;
      const createdAtIso = sortedChanges[index % changeCount]?.timestampIso ?? new Date().toISOString();
      const editedAtIso = sortedChanges[sortedChanges.length - 1 - (index % changeCount)]?.timestampIso ?? new Date().toISOString();
      const earliestIso = createdAtIso <= editedAtIso ? createdAtIso : editedAtIso;
      const latestIso = editedAtIso >= createdAtIso ? editedAtIso : createdAtIso;
      return {
        id: `rule_seed_${index + 1}`,
        title: item.label,
        description:
          BASE_RULE_DESCRIPTIONS[item.label] ??
          `${item.label} guardrail for policy-safe execution across projects and teams.`,
        createdAtIso: earliestIso,
        editedAtIso: latestIso,
        runsCheckedCount: Math.max(1, Math.round(((index + 1) / (this.seed.complianceItems.length || 1)) * this.seed.runs.length)),
      };
    });

    const createdRules: GovernanceRuleRow[] = this.createdComplianceRules.map((rule) => ({
      id: rule.id,
      title: rule.title,
      description: rule.description,
      createdAtIso: rule.createdAtIso,
      editedAtIso: rule.editedAtIso,
      runsCheckedCount: this.seed.runs.length,
    }));

    const allRules = [...baseRules, ...createdRules];
    const rule = allRules.find((r) => r.id === ruleId);
    if (!rule) throw notFoundError("Rule", ruleId);

    // Get stored assignments or default: seed rules start with first 3 agents / 2 projects
    const assignments = this.ruleAssignments.get(ruleId) ?? {
      agentIds: this.seed.agents.slice(0, 3).map((a) => a.id),
      projectIds: this.seed.projects.slice(0, 2).map((p) => p.id),
    };

    const recentViolations = [...this.seed.policyViolations]
      .sort((a, b) => b.timestampIso.localeCompare(a.timestampIso))
      .slice(0, 5);

    // Runs from assigned agents, sorted newest-first
    const assignedAgentSet = new Set(assignments.agentIds);
    const recentRuns = [...this.seed.runs]
      .filter((r) => assignedAgentSet.has(r.agentId))
      .sort((a, b) => b.startedAtIso.localeCompare(a.startedAtIso))
      .slice(0, 15);

    return {
      rule,
      assignedAgentIds: assignments.agentIds,
      assignedProjectIds: assignments.projectIds,
      allAgents: this.seed.agents,
      allProjects: this.seed.projects,
      recentViolations,
      recentRuns,
    };
  }

  async getGoldenQuestionDetail(
    request: GetGoldenQuestionDetailRequest,
  ): Promise<GoldenQuestionDetailResponse> {
    await this.simulate();
    this.assertOrgId(request.orgId);
    const { questionId } = request;

    const allRuns = this.seed.runs;
    const projectBreakdown = buildProjectBreakdown(allRuns, this.seed.projects, this.seed.teams);
    const projectEvaluations = this.buildProjectEvaluations(projectBreakdown, allRuns);

    let questionSection: ProjectEvaluationSection | undefined;
    let question: GoldenQuestionEvaluation | undefined;
    for (const section of projectEvaluations) {
      const match = section.goldenQuestions.find((q) => q.id === questionId);
      if (match) {
        question = match;
        questionSection = section;
        break;
      }
    }

    if (!question || !questionSection) {
      throw notFoundError("GoldenQuestion", questionId);
    }

    const project = [...this.seed.projects, ...this.createdProjects].find(
      (p) => p.id === questionSection!.projectId,
    );
    const team = project ? this.seed.teams.find((t) => t.id === project.teamId) : undefined;

    const projectRuns = allRuns.filter((r) => r.projectId === questionSection.projectId);
    const providerPool: ModelProvider[] = projectRuns.length > 0
      ? Array.from(new Set(projectRuns.map((r) => r.provider)))
      : ["anthropic", "openai"];
    const modelPool: string[] = projectRuns.length > 0
      ? Array.from(new Set(projectRuns.map((r) => r.modelId)))
      : ["claude-sonnet-4", "gpt-4o"];

    const criteriaPool = EVALUATION_CRITERIA_OPTIONS;
    const evaluationRuns: EvaluationRunRow[] = [];

    question.trend.forEach((point, dayIdx) => {
      const dayHash = hashString(`${questionId}:${point.tsIso}`);
      const runsThisDay = 2 + (dayHash % 2); // 2 or 3
      for (let i = 0; i < runsThisDay; i++) {
        const runHash = hashString(`${questionId}:${point.tsIso}:${i}`);
        // Spread across the day in hours.
        const hour = (runHash % 22) + 1;
        const minute = (runHash >>> 5) % 60;
        const second = (runHash >>> 11) % 60;
        const datePart = point.tsIso.slice(0, 10);
        const scoredAtIso = `${datePart}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}.000Z`;

        // Score = day value + small noise
        const noise = (((runHash >>> 17) % 41) - 20) / 1000; // ~±0.02
        const score = this.clampScore(point.value + noise);
        const passed = score >= 0.7;

        const provider = providerPool[runHash % providerPool.length]!;
        const modelId = modelPool[(runHash >>> 3) % modelPool.length]!;

        const criteriaCount = 3 + (runHash % 2);
        const criteriaOffset = (runHash >>> 7) % criteriaPool.length;
        const criteriaScores: EvaluationCriteriaScore[] = Array.from(
          { length: criteriaCount },
          (_, ci) => {
            const opt = criteriaPool[(criteriaOffset + ci) % criteriaPool.length]!;
            const critNoise = (((runHash >>> (ci * 3 + 19)) % 51) - 25) / 1000;
            const critScore = this.clampScore(score + critNoise);
            return {
              criteriaId: opt.id,
              label: opt.label,
              score: Math.round(critScore * 1000) / 1000,
            };
          },
        );

        const durationMs = 1800 + (runHash % 5400);
        const costUsd = round4(0.012 + ((runHash >>> 13) % 80) / 1000);

        const relatedRunIdx = projectRuns.length > 0
          ? (dayIdx * runsThisDay + i) % projectRuns.length
          : -1;
        const relatedRun = relatedRunIdx >= 0 ? projectRuns[relatedRunIdx] : undefined;

        evaluationRuns.push({
          id: `${questionId}_run_${dayIdx + 1}_${i + 1}`,
          questionId,
          scoredAtIso,
          score: Math.round(score * 1000) / 1000,
          passed,
          modelId,
          provider,
          criteriaScores,
          durationMs,
          costUsd,
          runId: relatedRun?.id,
        });
      }
    });

    evaluationRuns.sort((a, b) => b.scoredAtIso.localeCompare(a.scoredAtIso));

    const totalEvaluations = evaluationRuns.length;
    const averageScore = totalEvaluations === 0
      ? 0
      : Math.round(
        (evaluationRuns.reduce((sum, r) => sum + r.score, 0) / totalEvaluations) * 1000,
      ) / 1000;
    const passCount = evaluationRuns.filter((r) => r.passed).length;
    const passRate = totalEvaluations === 0 ? 0 : safeRate(passCount, totalEvaluations);

    return {
      question,
      projectId: questionSection.projectId,
      projectName: questionSection.projectName,
      teamName: team?.name ?? "Unknown",
      evaluationRuns,
      scoreTrend: question.trend,
      averageScore,
      totalEvaluations,
      passRate,
    };
  }

  async updateRule(request: UpdateRuleRequest): Promise<UpdateRuleResponse> {
    await this.simulate();
    this.assertOrgId(request.orgId);

    // Try to find and update in createdComplianceRules first
    const created = this.createdComplianceRules.find((r) => r.id === request.ruleId);
    if (created) {
      created.title = request.title;
      created.description = request.description;
      created.editedAtIso = new Date().toISOString();
    }

    // Store the assignments
    this.ruleAssignments.set(request.ruleId, {
      agentIds: request.assignedAgentIds,
      projectIds: request.assignedProjectIds,
    });

    // Return updated rule
    const detail = await this.getRuleDetail({
      orgId: request.orgId,
      ruleId: request.ruleId,
    });
    return { rule: { ...detail.rule, title: request.title, description: request.description, editedAtIso: new Date().toISOString() } };
  }

  private nextId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  async createComplianceRule(request: CreateComplianceRuleRequest): Promise<CreateComplianceRuleResponse> {
    await this.simulate();
    this.assertOrgId(request.orgId);
    const ruleId = this.nextId("rule");
    const createdAtIso = new Date().toISOString();

    // Evaluate existing runs — generate synthetic violations for runs that
    // "break" this new rule. We match deterministically: pick up to 3 recent
    // failed runs as simulated violators.
    const failedRuns = this.seed.runs
      .filter((r) => r.status === "failed")
      .sort((a, b) => b.startedAtIso.localeCompare(a.startedAtIso))
      .slice(0, 3);
    const affectedTeamIds = [...new Set(failedRuns.map((run) => run.teamId))];

    for (const run of failedRuns) {
      const agent = this.seed.agents.find((a) => a.id === run.agentId);
      this.createdViolations.push({
        id: `${ruleId}_viol_${run.id}`,
        timestampIso: run.startedAtIso,
        agentId: run.agentId,
        agentName: agent?.name ?? run.agentId,
        ruleId,
        ruleTitle: request.name,
        reason: `Rule "${request.name}": ${request.description}`,
        severity: request.severity,
      });
    }

    this.createdComplianceRules.push({
      id: ruleId,
      title: request.name,
      description: request.description,
      createdAtIso,
      editedAtIso: createdAtIso,
      affectedTeamIds,
    });

    return {
      id: ruleId,
      name: request.name,
      description: request.description,
      severity: request.severity,
      createdAtIso,
    };
  }

  async createSeat(request: CreateSeatRequest): Promise<CreateSeatResponse> {
    await this.simulate();
    this.assertOrgId(request.orgId);

    // Reject duplicate email
    const allEmails = [
      ...this.seed.users.map((u) => u.email),
      ...this.createdUsers.map((u) => u.email),
    ];
    if (allEmails.includes(request.email)) {
      throw conflictError(`A user with email "${request.email}" already exists`);
    }

    const id = this.nextId("user");
    const user = { id, name: request.name, email: request.email, teamId: request.teamId };
    this.createdUsers.push(user);
    return {
      user,
      createdAtIso: new Date().toISOString(),
    };
  }

  async createProject(request: CreateProjectRequest): Promise<CreateProjectResponse> {
    await this.simulate();
    this.assertOrgId(request.orgId);

    // Reject duplicate project name within same team
    const allProjects = [...this.seed.projects, ...this.createdProjects];
    const duplicate = allProjects.find(
      (p) => p.name === request.name && p.teamId === request.teamId,
    );
    if (duplicate) {
      throw conflictError(`A project named "${request.name}" already exists in this team`);
    }

    const id = this.nextId("proj");
    const project = { id, name: request.name, teamId: request.teamId };
    this.createdProjects.push(project);
    return {
      project,
      createdAtIso: new Date().toISOString(),
    };
  }

  async createTeam(request: CreateTeamRequest): Promise<CreateTeamResponse> {
    await this.simulate();
    this.assertOrgId(request.orgId);

    // Reject duplicate team name
    const allTeams = [...this.seed.teams, ...this.createdTeams];
    if (allTeams.some((t) => t.name === request.name)) {
      throw conflictError(`A team named "${request.name}" already exists`);
    }

    const id = this.nextId("team");
    const team = { id, name: request.name };
    this.createdTeams.push(team);
    return {
      team,
      createdAtIso: new Date().toISOString(),
    };
  }

  async createAgent(request: CreateAgentRequest): Promise<CreateAgentResponse> {
    await this.simulate();
    this.assertOrgId(request.orgId);

    // Reject duplicate agent name within same project
    const allAgents = [...this.seed.agents, ...this.createdAgents];
    const duplicate = allAgents.find(
      (a) => a.name === request.name && a.projectId === request.projectId,
    );
    if (duplicate) {
      throw conflictError(`An agent named "${request.name}" already exists in this project`);
    }

    const id = this.nextId("agent");
    const agent = { id, name: request.name, projectId: request.projectId, description: "" };
    this.createdAgents.push(agent);
    return {
      agent,
      createdAtIso: new Date().toISOString(),
    };
  }

  async createEvaluation(request: CreateEvaluationRequest): Promise<CreateEvaluationResponse> {
    await this.simulate();
    this.assertOrgId(request.orgId);

    const projectId = request.projectId.trim();
    if (!projectId) {
      throw validationError("projectId is required", [
        { field: "projectId", code: "required", message: "Provide a projectId." },
      ]);
    }

    const allProjects = [...this.seed.projects, ...this.createdProjects];
    const project = allProjects.find((p) => p.id === projectId);
    if (!project) {
      throw notFoundError("Project", projectId);
    }

    const criteriaIds = Array.from(new Set(request.criteriaIds.filter((id) => id.trim().length > 0)));
    if (criteriaIds.length === 0) {
      throw validationError("Select at least one evaluation criterion", [
        { field: "criteriaIds", code: "required", message: "Select at least one criterion." },
      ]);
    }

    const validIds = new Set(EVALUATION_CRITERIA_OPTIONS.map((option) => option.id));
    for (const id of criteriaIds) {
      if (!validIds.has(id)) {
        throw validationError(`Unknown criterion id "${id}"`, [
          { field: "criteriaIds", code: "invalid", message: `Unknown criterion id "${id}".` },
        ]);
      }
    }

    const createdAtIso = new Date().toISOString();
    const evaluations: GoldenQuestionEvaluation[] = criteriaIds.map((criterionId) => {
      const prompt = getCriteriaPromptById(criterionId)!;
      const id = this.nextId(`eval_${projectId}_${criterionId}`);
      this.createdEvaluations.push({ id, projectId, question: prompt, createdAtIso });
      const baseHash = hashString(id);
      const latestScore = this.clampScore(0.74 + (baseHash % 18) / 100);
      return {
        id,
        question: prompt,
        latestScore,
        scoreDelta: 0,
        evaluationCount: 0,
        trend: [{ tsIso: createdAtIso, value: latestScore }],
      };
    });

    return { projectId, evaluations, createdAtIso };
  }

  async updateAgentDescription(request: UpdateAgentDescriptionRequest): Promise<UpdateAgentDescriptionResponse> {
    await this.simulate();
    this.assertOrgId(request.orgId);
    const agent =
      this.seed.agents.find((a) => a.id === request.agentId) ??
      this.createdAgents.find((a) => a.id === request.agentId);
    if (!agent) throw notFoundError("Agent", request.agentId);
    agent.description = request.description;
    return { agent };
  }
}
