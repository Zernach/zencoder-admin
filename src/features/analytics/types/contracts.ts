// ─── Domain Enums ────────────────────────────────────────
export type ModelProvider = "codex" | "claude" | "other";
export type RunStatus = "queued" | "running" | "succeeded" | "failed" | "canceled";
export type RunFailureCategory =
  | "timeout" | "tool_error" | "model_error"
  | "policy_block" | "infra_error" | "unknown";
export type Severity = "HIGH" | "MEDIUM" | "LOW";
export type DeltaPolarity = "positive-good" | "negative-good";
export type SortDirection = "asc" | "desc";

// ─── Shared UI Primitives ───────────────────────────────
export interface Option<T = string> { label: string; value: T; }
export interface FilterChip { key: string; label: string; onRemove: () => void; }

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
export interface FailureCategoryMetric extends KeyValueMetric {
  agentBreakdown: KeyValueMetric[];
}

// ─── Entities ───────────────────────────────────────────
export interface Team    { id: string; name: string; }
export interface User    { id: string; name: string; email: string; teamId: string; }
export interface Project { id: string; name: string; teamId: string; }
export interface Agent   { id: string; name: string; projectId: string; description: string; }

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
  teamId: string;
  teamName: string;
  userName: string;
  status: LiveAgentSessionStatus;
  startedAtIso: string;
  currentTask: string;
}


// ─── Agent & Project Breakdown ──────────────────────────
export interface AgentBreakdownRow {
  agentId: string; agentName: string; projectId: string; projectName: string;
  totalRuns: number; successRate: number;
  avgDurationMs: number; totalCostUsd: number;
}

export interface ProjectBreakdownRow {
  projectId: string; projectName: string; teamId: string; teamName: string;
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

export interface CostPerTeamRow {
  teamId: string;
  teamName: string;
  totalCostUsd: number;
  runsStarted: number;
  averageCostPerRunUsd: number;
  percentOfTotal: number;
}

export interface BudgetSummary {
  budgetUsd: number; spentUsd: number;
  remainingUsd: number; forecastMonthEndUsd: number;
}

export interface PolicyChangeEvent {
  id: string; actorUserId: string; actorName: string; action: string;
  timestampIso: string; targetTeamId: string; target: string;
}

export interface PolicyViolationRow {
  id: string; timestampIso: string;
  agentId: string; agentName: string;
  ruleId: string; ruleTitle: string;
  reason: string; severity: Severity;
}

export interface TeamViolationMetric {
  teamName: string;
  totalViolations: number;
  reasonBreakdown: KeyValueMetric[];
}

export interface SecurityEventRow {
  id: string; type: string; description: string; timestampIso: string;
}

export interface ComplianceItem {
  label: string; status: "compliant" | "warning" | "critical";
}

export interface GovernanceRuleRow {
  id: string;
  title: string;
  description: string;
  createdAtIso: string;
  editedAtIso: string;
  runsCheckedCount: number;
}

export interface SeatUserUsageRow {
  userId: string;
  fullName: string;
  teamId: string;
  teamName: string;
  runsCount: number;
  totalTokens: number;
  totalCostUsd: number;
}

export interface TeamPerformanceComparisonRow {
  teamId: string;
  teamName: string;
  runsCount: number;
  successRate: number;
  policyViolationCount: number;
  rulesCount: number;
  policyViolationRate: number;
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
  wauTrend: TimeSeriesPoint[];
  mauTrend: TimeSeriesPoint[];
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
  costPerTeam: CostPerTeamRow[];
  providerBreakdown: ProviderCostRow[];
  budget: BudgetSummary;
}

export interface ReliabilityResponse {
  runSuccessRate: number; errorRate: number;
  p50RunDurationMs: number; p95RunDurationMs: number;
  p95QueueWaitMs: number; peakConcurrency: number;
  failureCategoryBreakdown: FailureCategoryMetric[];
  reliabilityTrend: TimeSeriesPoint[];
  agentBreakdown: AgentBreakdownRow[];
}

export interface AgentsHubResponse {
  // Reliability metrics
  runSuccessRate: number;
  errorRate: number;
  p50RunDurationMs: number;
  p95RunDurationMs: number;
  p95QueueWaitMs: number;
  peakConcurrency: number;
  failureCategoryBreakdown: FailureCategoryMetric[];
  reliabilityTrend: TimeSeriesPoint[];
  p50DurationTrend: TimeSeriesPoint[];
  p95DurationTrend: TimeSeriesPoint[];
  p95QueueWaitTrend: TimeSeriesPoint[];
  peakConcurrencyTrend: TimeSeriesPoint[];
  agentBreakdown: AgentBreakdownRow[];
  // Project breakdown
  totalProjects: number;
  activeProjects: number;
  totalRuns: number;
  overallSuccessRate: number;
  totalCostUsd: number;
  projectBreakdown: ProjectBreakdownRow[];
  // Recent runs (latest N, no pagination)
  recentRuns: RunListRow[];
}

export interface GovernanceResponse {
  policyViolationCount: number;
  violationsByTeam: TeamViolationMetric[];
  recentViolations: PolicyViolationRow[];
  securityEvents: SecurityEventRow[];
  rules: GovernanceRuleRow[];
  complianceItems: ComplianceItem[];
  policyChanges: PolicyChangeEvent[];
  seatUserUsage: SeatUserUsageRow[];
  teamPerformanceComparison: TeamPerformanceComparisonRow[];
}


// ─── Search Autocomplete ────────────────────────────────
export type SearchEntityType = "agent" | "project" | "team" | "human" | "run" | "rule" | "chat";

export interface SearchSuggestion {
  id: string;
  entityType: SearchEntityType;
  title: string;
  subtitle?: string;
}

export interface SearchSuggestionGroup {
  entityType: SearchEntityType;
  label: string;
  suggestions: SearchSuggestion[];
}

export interface SearchSuggestionsRequest {
  query: string;
  limit?: number;
}

export interface SearchSuggestionsResponse {
  groups: SearchSuggestionGroup[];
  totalCount: number;
}

// ─── Entity Detail Responses ────────────────────────────
export interface AgentDetailResponse {
  agent: Agent;
  projectName: string;
  teamName: string;
  totalRuns: number;
  successRate: number;
  avgDurationMs: number;
  totalCostUsd: number;
  recentRuns: RunListRow[];
  /** Maps userId → display name for users referenced in recentRuns */
  userMap: Record<string, string>;
}

export interface ProjectDetailResponse {
  project: Project;
  teamName: string;
  agentCount: number;
  totalRuns: number;
  successRate: number;
  totalCostUsd: number;
  avgCostPerRunUsd: number;
  agents: Agent[];
  recentRuns: RunListRow[];
}

export interface TeamDetailResponse {
  team: Team;
  memberCount: number;
  projectCount: number;
  totalRuns: number;
  successRate: number;
  totalCostUsd: number;
  members: User[];
  projects: Project[];
}

export interface HumanDetailResponse {
  user: User;
  teamName: string;
  totalRuns: number;
  totalTokens: number;
  totalCostUsd: number;
  recentRuns: RunListRow[];
}

export interface RunDetailResponse {
  run: RunListRow;
  agentName: string;
  projectName: string;
  teamName: string;
  userName: string;
}

export interface RuleDetailResponse {
  rule: GovernanceRuleRow;
  /** Agent IDs this rule currently applies to */
  assignedAgentIds: string[];
  /** Project IDs this rule currently applies to */
  assignedProjectIds: string[];
  /** All agents available for assignment */
  allAgents: Agent[];
  /** All projects available for assignment */
  allProjects: Project[];
  recentViolations: PolicyViolationRow[];
  recentRuns: RunListRow[];
}

export interface UpdateRuleRequest {
  ruleId: string;
  title: string;
  description: string;
  assignedAgentIds: string[];
  assignedProjectIds: string[];
}

export interface UpdateRuleResponse {
  rule: GovernanceRuleRow;
}

// ─── Create Entity Contracts ────────────────────────────
export interface CreateComplianceRuleRequest {
  name: string;
  description: string;
  severity: Severity;
}

export interface CreateComplianceRuleResponse {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  createdAtIso: string;
}

export interface CreateSeatRequest {
  name: string;
  email: string;
  teamId: string;
}

export interface CreateSeatResponse {
  user: User;
  createdAtIso: string;
}

export interface CreateProjectRequest {
  name: string;
  teamId: string;
}

export interface CreateProjectResponse {
  project: Project;
  createdAtIso: string;
}

export interface CreateTeamRequest {
  name: string;
}

export interface CreateTeamResponse {
  team: Team;
  createdAtIso: string;
}

export interface CreateAgentRequest {
  name: string;
  projectId: string;
}

export interface CreateAgentResponse {
  agent: Agent;
  createdAtIso: string;
}

export interface UpdateAgentDescriptionRequest {
  agentId: string;
  description: string;
}

export interface UpdateAgentDescriptionResponse {
  agent: Agent;
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
