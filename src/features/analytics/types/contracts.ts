// ─── Domain Enums ────────────────────────────────────────
export type ModelProvider = "codex" | "claude" | "other";
export type RunStatus = "queued" | "running" | "succeeded" | "failed" | "canceled";
export type RunFailureCategory =
  | "timeout" | "tool_error" | "model_error"
  | "policy_block" | "infra_error" | "unknown";

// ─── Filter & Time ──────────────────────────────────────
export interface TimeRange { fromIso: string; toIso: string; }
export type TimeRangePreset = "24h" | "7d" | "30d" | "90d" | "custom";
export interface AnalyticsFilters {
  orgId: string;
  timeRange: TimeRange;
  teamIds?: string[];
  userIds?: string[];
  projectIds?: string[];
  providers?: ModelProvider[];
  modelIds?: string[];
  environments?: string[];
  statuses?: RunStatus[];
}

// ─── Shared Data Primitives ─────────────────────────────
export interface TimeSeriesPoint { tsIso: string; value: number; }
export interface KeyValueMetric  { key: string;   value: number; }

// ─── Entities ───────────────────────────────────────────
export interface Team    { id: string; name: string; }
export interface User    { id: string; name: string; email: string; teamId: string; }
export interface Project { id: string; name: string; teamId: string; }
export interface Agent   { id: string; name: string; projectId: string; }

// ─── Run Types ──────────────────────────────────────────
export interface RunListRow {
  id: string;
  status: RunStatus;
  failureCategory?: RunFailureCategory;
  teamId: string;
  userId: string;
  projectId: string;
  agentId: string;
  provider: ModelProvider;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  queueWaitMs: number;
  durationMs: number;
  startedAtIso: string;
  completedAtIso?: string;
  prCreated?: boolean;
  prMerged?: boolean;
  testsExecuted?: number;
  testsPassed?: number;
  linesAdded?: number;
  linesRemoved?: number;
}

export interface RunAnomaly {
  runId: string;
  type: "highest_cost" | "longest_duration" | "highest_tokens";
  label: string;
  value: number;
}

export type LiveAgentSessionStatus = "queued" | "running";

export interface LiveAgentSession {
  sessionId: string;
  runId: string;
  agentId: string;
  agentName: string;
  projectName: string;
  userName: string;
  status: LiveAgentSessionStatus;
  startedAtIso: string;
  currentTask: string;
}

export interface RunTimelineEvent {
  step: "queued" | "started" | "tools" | "tests" | "artifact" | "completed";
  timestampIso: string;
  detail: string;
}

export interface RunArtifacts {
  linesAdded: number; linesRemoved: number;
  prCreated: boolean; prMerged: boolean;
  testsExecuted: number; testsPassed: number;
}

export interface PolicyContext {
  blockedActions: string[];
  allowedActions: string[];
  networkMode: "none" | "limited" | "full";
}

export type PromptRole = "system" | "user" | "assistant" | "tool";

export interface RunPromptMessageCost {
  id: string;
  order: number;
  role: PromptRole;
  content: string;
  contextTokensBefore: number;
  inputTokens: number;
  outputTokens: number;
  contextTokensAfter: number;
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
  cumulativeCostUsd: number;
}

export interface RunPromptChainSummary {
  totalMessages: number;
  maxContextTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
}

// ─── Agent & Project Breakdown ──────────────────────────
export interface AgentBreakdownRow {
  agentId: string; agentName: string; projectName: string;
  totalRuns: number; successRate: number;
  avgDurationMs: number; totalCostUsd: number;
}

export interface ProjectBreakdownRow {
  projectId: string; projectName: string; teamName: string;
  totalRuns: number; successRate: number;
  totalCostUsd: number; avgCostPerRunUsd: number;
  agentCount: number;
}

export interface ProviderCostRow {
  provider: ModelProvider; totalCostUsd: number; runCount: number;
  totalTokens: number;
  percentOfTotal: number;
}

// ─── Breakdown Rows ─────────────────────────────────────
export interface UsageBreakdownRow {
  teamId: string; teamName: string;
  activeUsers: number; runsStarted: number; runSuccessRate: number;
}

export interface OutcomesLeaderboardRow {
  key: string; prsMerged: number;
  testsPassRate: number; codeAcceptanceRate: number;
}

export interface CostBreakdownRow {
  key: string; totalCostUsd: number; runsStarted: number;
  averageCostPerRunUsd: number; percentOfTotal: number;
}

export interface BudgetSummary {
  budgetUsd: number; spentUsd: number;
  remainingUsd: number; forecastMonthEndUsd: number;
}

export interface PolicyChangeEvent {
  id: string; actorUserId: string; action: string;
  timestampIso: string; target: string;
}

export interface PolicyViolationRow {
  id: string; timestampIso: string;
  agentId: string; agentName: string;
  reason: string; severity: "HIGH" | "MEDIUM" | "LOW";
}

export interface SecurityEventRow {
  id: string; type: string; description: string; timestampIso: string;
}

export interface ComplianceItem {
  label: string; status: "compliant" | "warning" | "critical";
}

export interface SeatUserUsageRow {
  userId: string;
  fullName: string;
  teamName: string;
  runsCount: number;
  totalTokens: number;
  totalCostUsd: number;
}

// ─── Overview KPIs ──────────────────────────────────────
export interface OverviewKpis {
  seatAdoptionRate: number; runSuccessRate: number;
  totalCostUsd: number; providerShareCodex: number;
  providerShareClaude: number; policyViolationCount: number;
}

/** Percentage change vs. the previous equivalent time period */
export interface OverviewDeltas {
  seatAdoptionRate: number;
  runSuccessRate: number;
  totalCostUsd: number;
  policyViolationCount: number;
}

// ─── API Responses ──────────────────────────────────────
export interface OverviewResponse {
  kpis: OverviewKpis;
  deltas: OverviewDeltas;
  runsTrend: TimeSeriesPoint[];
  costTrend: TimeSeriesPoint[];
  anomalies: RunAnomaly[];
}

export interface LiveAgentSessionsResponse {
  activeSessions: LiveAgentSession[];
  lastUpdatedIso: string;
}

export interface UsageResponse {
  wau: number; mau: number; activeSeats30d: number;
  seatAdoptionRate: number;
  activeUsersTrend: TimeSeriesPoint[];
  runsPerUserDistribution: KeyValueMetric[];
  breakdownByTeam: UsageBreakdownRow[];
}

export interface OutcomesResponse {
  prsCreated: number; prsMerged: number; prMergeRate: number;
  medianTimeToMergeHours: number; testsPassRate: number;
  codeAcceptanceRate: number; reworkRate: number;
  outcomesTrend: TimeSeriesPoint[];
  leaderboard: OutcomesLeaderboardRow[];
}

export interface CostResponse {
  totalCostUsd: number; averageCostPerRunUsd: number;
  costPerSuccessfulRunUsd: number;
  costTrend: TimeSeriesPoint[];
  costBreakdown: CostBreakdownRow[];
  providerBreakdown: ProviderCostRow[];
  budget: BudgetSummary;
}

export interface ReliabilityResponse {
  runSuccessRate: number; errorRate: number;
  p50RunDurationMs: number; p95RunDurationMs: number;
  p95QueueWaitMs: number; peakConcurrency: number;
  failureCategoryBreakdown: KeyValueMetric[];
  reliabilityTrend: TimeSeriesPoint[];
  agentBreakdown: AgentBreakdownRow[];
}

export interface ProjectsResponse {
  totalProjects: number; activeProjects: number;
  totalRuns: number; overallSuccessRate: number;
  totalCostUsd: number;
  projectBreakdown: ProjectBreakdownRow[];
  runsTrend: TimeSeriesPoint[];
  successRateTrend: TimeSeriesPoint[];
}

export interface GovernanceResponse {
  policyViolationCount: number; policyViolationRate: number;
  blockedNetworkAttempts: number; auditEventsCount: number;
  violationsByTeam: KeyValueMetric[];
  recentViolations: PolicyViolationRow[];
  securityEvents: SecurityEventRow[];
  complianceItems: ComplianceItem[];
  policyChanges: PolicyChangeEvent[];
  seatUserUsage: SeatUserUsageRow[];
}

export type RunsPageSortBy =
  | "id"
  | "status"
  | "projectId"
  | "teamId"
  | "startedAtIso"
  | "durationMs"
  | "totalTokens"
  | "costUsd"
  | "provider";

export interface RunsPageRequest {
  filters: AnalyticsFilters;
  page: number; pageSize: number;
  sortBy: RunsPageSortBy;
  sortDirection: "asc" | "desc";
}

export interface RunsPageResponse {
  total: number; page: number; pageSize: number;
  rows: RunListRow[];
}

export interface RunDetailResponse {
  run: RunListRow;
  timeline: RunTimelineEvent[];
  artifacts: RunArtifacts;
  policyContext: PolicyContext;
  promptChain: RunPromptMessageCost[];
  promptChainSummary: RunPromptChainSummary;
}

// ─── Seed Data Container ────────────────────────────────
export interface SeedData {
  teams: Team[]; users: User[]; projects: Project[]; agents: Agent[];
  runs: RunListRow[];
  policyViolations: PolicyViolationRow[];
  securityEvents: SecurityEventRow[];
  policyChanges: PolicyChangeEvent[];
  complianceItems: ComplianceItem[];
}
