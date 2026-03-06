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
  LiveAgentSessionsResponse,
  RunListRow,
  TimeSeriesPoint,
  SeedData,
  RunAnomaly,
  KeyValueMetric,
  ProviderCostRow,
  ModelProvider,
  LiveAgentSession,
  SeatUserUsageRow,
  SearchSuggestionsRequest,
  SearchSuggestionsResponse,
  SearchSuggestion,
  SearchSuggestionGroup,
  SearchEntityType,
  AgentDetailResponse,
  ProjectDetailResponse,
  TeamDetailResponse,
  HumanDetailResponse,
  RunDetailResponse,
  CreateComplianceRuleRequest,
  CreateComplianceRuleResponse,
  CreateSeatRequest,
  CreateSeatResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  CreateTeamRequest,
  CreateTeamResponse,
  PolicyViolationRow,
} from "@/features/analytics/types";
import { round2, round4 } from "../../utils/metricFormulas";
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
}

// ─── Stub Implementation ─────────────────────────────────

export class StubAnalyticsApi implements IAnalyticsApi {
  private seed: SeedData;
  private latencyMin: number;
  private latencyMax: number;
  private failureRate: number;
  private createdViolations: PolicyViolationRow[] = [];
  private createdUsers: Array<{ id: string; name: string; email: string; teamId: string }> = [];

  constructor(seedData: SeedData, config: StubConfig = {}) {
    this.seed = seedData;
    this.latencyMin = config.latencyMinMs ?? 250;
    this.latencyMax = config.latencyMaxMs ?? 900;
    this.failureRate = config.debugFailureRate ?? 0;
  }

  // ── Network simulation ─────────────────────────────────

  private async simulate(): Promise<void> {
    if (this.failureRate > 0 && Math.random() < this.failureRate) {
      throw new Error("StubAnalyticsApi: simulated failure");
    }
    const ms = this.latencyMin + Math.random() * (this.latencyMax - this.latencyMin);
    await new Promise((r) => setTimeout(r, ms));
  }

  // ── Shared data helpers ────────────────────────────────

  private filterRuns(filters: AnalyticsFilters): RunListRow[] {
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

  private costTrendFromRuns(runs: RunListRow[]): TimeSeriesPoint[] {
    return this.bucketByDay(runs, (d) => round2(sumField(d, "costUsd")));
  }

  private reliabilityTrendFromRuns(runs: RunListRow[]): TimeSeriesPoint[] {
    return this.bucketByDay(runs, (d) => safeRate(countSucceeded(d), d.length));
  }

  // ── API Methods ────────────────────────────────────────

  async getOverview(filters: AnalyticsFilters): Promise<OverviewResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);
    const total = runs.length || 1;
    const succeeded = countSucceeded(runs);
    const totalCost = sumField(runs, "costUsd");
    const codexCount = runs.filter((r) => r.provider === "codex").length;
    const claudeCount = runs.filter((r) => r.provider === "claude").length;

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
        label: `$${byCost[0].costUsd.toFixed(2)}`,
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
        providerShareCodex: codexCount / total,
        providerShareClaude: claudeCount / total,
        policyViolationCount: violations.length,
      },
      deltas,
      runsTrend: this.bucketByDay(runs, (d) => d.length),
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
      activeUsersTrend: this.bucketByDay(runs, (d) => new Set(d.map((r) => r.userId)).size),
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
      outcomesTrend: this.bucketByDay(succeeded, (d) => d.filter((r) => r.prMerged).length),
      leaderboard,
    };
  }

  async getCost(filters: AnalyticsFilters): Promise<CostResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);
    const totalCost = sumField(runs, "costUsd");
    const succeededCount = countSucceeded(runs);

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

    // Provider breakdown
    const providerMap = new Map<ModelProvider, { cost: number; count: number; tokens: number }>();
    for (const run of runs) {
      const entry = providerMap.get(run.provider) ?? { cost: 0, count: 0, tokens: 0 };
      entry.cost += run.costUsd;
      entry.count++;
      entry.tokens += run.totalTokens;
      providerMap.set(run.provider, entry);
    }
    const providerBreakdown: ProviderCostRow[] = (["codex", "claude", "other"] as ModelProvider[])
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
    const forecastMonthEndUsd = dailySpend * 30;

    return {
      totalCostUsd: round2(totalCost),
      averageCostPerRunUsd: round4(totalCost / (runs.length || 1)),
      costPerSuccessfulRunUsd: round4(totalCost / (succeededCount || 1)),
      costTrend: this.costTrendFromRuns(runs),
      costBreakdown,
      providerBreakdown,
      budget: {
        budgetUsd,
        spentUsd: round2(totalCost),
        remainingUsd: round2(budgetUsd - totalCost),
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
      failureCategoryBreakdown: buildFailureCategoryBreakdown(runs),
      reliabilityTrend: this.reliabilityTrendFromRuns(runs),
      agentBreakdown: buildAgentBreakdown(runs, this.seed.agents, this.seed.projects),
    };
  }

  async getGovernance(filters: AnalyticsFilters): Promise<GovernanceResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);
    const { fromIso, toIso } = filters.timeRange;

    const violations = [
      ...filterByTimeRange(this.seed.policyViolations, fromIso, toIso),
      ...filterByTimeRange(this.createdViolations, fromIso, toIso),
    ];
    const secEvents = filterByTimeRange(this.seed.securityEvents, fromIso, toIso);
    const changes = filterByTimeRange(this.seed.policyChanges, fromIso, toIso);

    // Violations by team (via agentId -> projectId -> teamId)
    const teamViolMap = new Map<string, number>();
    for (const v of violations) {
      const agent = this.seed.agents.find((a) => a.id === v.agentId);
      if (agent) {
        const project = this.seed.projects.find((p) => p.id === agent.projectId);
        if (project) {
          const team = this.seed.teams.find((t) => t.id === project.teamId);
          const name = team?.name ?? project.teamId;
          teamViolMap.set(name, (teamViolMap.get(name) ?? 0) + 1);
        }
      }
    }
    const violationsByTeam: KeyValueMetric[] = Array.from(teamViolMap.entries()).map(
      ([key, value]) => ({ key, value }),
    );

    const blockedNetworkAttempts = violations.filter((v) =>
      v.reason.toLowerCase().includes("unauthorized"),
    ).length;

    // Seat user usage
    const teamNameById = new Map(this.seed.teams.map((team) => [team.id, team.name]));
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

    return {
      policyViolationCount: violations.length,
      policyViolationRate: safeRate(violations.length, runs.length),
      blockedNetworkAttempts,
      auditEventsCount: changes.length + violations.length,
      violationsByTeam,
      recentViolations: sortByTimestampDesc(violations).slice(0, 20),
      securityEvents: sortByTimestampDesc(secEvents).slice(0, 20),
      complianceItems: this.seed.complianceItems,
      policyChanges: sortByTimestampDesc(changes).slice(0, 20),
      seatUserUsage,
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

    // Recent runs (latest 25)
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
      failureCategoryBreakdown: buildFailureCategoryBreakdown(runs),
      reliabilityTrend: this.reliabilityTrendFromRuns(runs),
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

  async getLiveAgentSessions(
    filters: AnalyticsFilters,
  ): Promise<LiveAgentSessionsResponse> {
    await this.simulate();
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
        const user = findEntity(this.seed.users, run.userId);
        const taskIndex = hashString(run.id + run.agentId) % LIVE_TASKS.length;

        return {
          sessionId: `seed_${run.id}`,
          runId: run.id,
          agentId: run.agentId,
          agentName: agent?.name ?? run.agentId,
          projectName: project?.name ?? run.projectId,
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
        const user = findEntity(this.seed.users, run.userId) ?? this.seed.users[0]!;
        const taskIndex = (window + index) % LIVE_TASKS.length;
        const startedAgoMs = 40_000 + index * 55_000 + ((window + index) % 5) * 10_000;

        return {
          sessionId: `live_${window}_${index}_${agent.id}`,
          runId: `live_run_${window}_${index}`,
          agentId: agent.id,
          agentName: agent.name,
          projectName: project.name,
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

    const query = request.query.trim().toLowerCase();
    const perGroupLimit = request.limit ?? 5;

    if (query.length === 0) {
      return { groups: [], totalCount: 0 };
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
        .slice(0, perGroupLimit)
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

    const groups: SearchSuggestionGroup[] = [];
    let totalCount = 0;
    for (const [entityType, label, candidates] of groupDefs) {
      const group = buildGroup(entityType, label, candidates);
      if (group) {
        groups.push(group);
        totalCount += group.suggestions.length;
      }
    }

    return { groups, totalCount };
  }

  async getAgentDetail(_orgId: string, agentId: string): Promise<AgentDetailResponse> {
    await this.simulate();
    const agent = this.seed.agents.find((a) => a.id === agentId);
    if (!agent) throw new Error(`Agent not found: ${agentId}`);
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
    };
  }

  async getProjectDetail(_orgId: string, projectId: string): Promise<ProjectDetailResponse> {
    await this.simulate();
    const project = this.seed.projects.find((p) => p.id === projectId);
    if (!project) throw new Error(`Project not found: ${projectId}`);
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

  async getTeamDetail(_orgId: string, teamId: string): Promise<TeamDetailResponse> {
    await this.simulate();
    const team = this.seed.teams.find((t) => t.id === teamId);
    if (!team) throw new Error(`Team not found: ${teamId}`);
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

  async getHumanDetail(_orgId: string, humanId: string): Promise<HumanDetailResponse> {
    await this.simulate();
    const user = this.seed.users.find((u) => u.id === humanId);
    if (!user) throw new Error(`Human not found: ${humanId}`);
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

  async getRunDetail(_orgId: string, runId: string): Promise<RunDetailResponse> {
    await this.simulate();
    const run = this.seed.runs.find((r) => r.id === runId);
    if (!run) throw new Error(`Run not found: ${runId}`);
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

  private nextId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  async createComplianceRule(request: CreateComplianceRuleRequest): Promise<CreateComplianceRuleResponse> {
    await this.simulate();
    const ruleId = this.nextId("rule");
    const createdAtIso = new Date().toISOString();

    // Evaluate existing runs — generate synthetic violations for runs that
    // "break" this new rule. We match deterministically: pick up to 3 recent
    // failed runs as simulated violators.
    const failedRuns = this.seed.runs
      .filter((r) => r.status === "failed")
      .sort((a, b) => b.startedAtIso.localeCompare(a.startedAtIso))
      .slice(0, 3);

    for (const run of failedRuns) {
      const agent = this.seed.agents.find((a) => a.id === run.agentId);
      this.createdViolations.push({
        id: `${ruleId}_viol_${run.id}`,
        timestampIso: run.startedAtIso,
        agentId: run.agentId,
        agentName: agent?.name ?? run.agentId,
        reason: `Rule "${request.name}": ${request.description}`,
        severity: request.severity,
      });
    }

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

    // Reject duplicate email
    const allEmails = [
      ...this.seed.users.map((u) => u.email),
      ...this.createdUsers.map((u) => u.email),
    ];
    if (allEmails.includes(request.email)) {
      throw new Error(`A user with email "${request.email}" already exists`);
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
    const id = this.nextId("proj");
    return {
      project: { id, name: request.name, teamId: request.teamId },
      createdAtIso: new Date().toISOString(),
    };
  }

  async createTeam(request: CreateTeamRequest): Promise<CreateTeamResponse> {
    await this.simulate();
    const id = this.nextId("team");
    return {
      team: { id, name: request.name },
      createdAtIso: new Date().toISOString(),
    };
  }
}
