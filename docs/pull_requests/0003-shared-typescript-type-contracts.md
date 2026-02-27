# 0003 — Shared TypeScript Type Contracts

> Create the single source of truth for every domain type and API request/response shape in one file. Fixtures, stub API, services, hooks, and screens all import from here — zero duplication.

---

## Prior State

No type contracts exist. The technical spec defines exact interfaces in prose form.

## Target State

`src/features/analytics/types/contracts.ts` exports 40+ fully typed interfaces and type aliases. `npx tsc --noEmit` guarantees every downstream consumer agrees on shapes.

---

## File to Create

### `src/features/analytics/types/contracts.ts`

Implement **exactly** this type system (copy verbatim and adjust nothing — this is the source of truth):

```ts
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

// ─── Overview KPIs ──────────────────────────────────────
export interface OverviewKpis {
  seatAdoptionRate: number; runSuccessRate: number;
  totalCostUsd: number; providerShareCodex: number;
  providerShareClaude: number; policyViolationCount: number;
}

// ─── API Responses ──────────────────────────────────────
export interface OverviewResponse {
  kpis: OverviewKpis;
  runsTrend: TimeSeriesPoint[];
  costTrend: TimeSeriesPoint[];
  anomalies: RunAnomaly[];
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
  budget: BudgetSummary;
}

export interface ReliabilityResponse {
  runSuccessRate: number; errorRate: number;
  p50RunDurationMs: number; p95RunDurationMs: number;
  p95QueueWaitMs: number; peakConcurrency: number;
  failureCategoryBreakdown: KeyValueMetric[];
  reliabilityTrend: TimeSeriesPoint[];
}

export interface GovernanceResponse {
  policyViolationCount: number; policyViolationRate: number;
  blockedNetworkAttempts: number; auditEventsCount: number;
  violationsByTeam: KeyValueMetric[];
  recentViolations: PolicyViolationRow[];
  securityEvents: SecurityEventRow[];
  complianceItems: ComplianceItem[];
  policyChanges: PolicyChangeEvent[];
}

export interface RunsPageRequest {
  filters: AnalyticsFilters;
  page: number; pageSize: number;
  sortBy: "startedAtIso" | "costUsd" | "durationMs" | "totalTokens";
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
```

### `src/features/analytics/types/index.ts`

```ts
export * from "./contracts";
```

---

## Depends On

**PR 0001** — TypeScript compiler.

## Done When

- `npx tsc --noEmit` passes with strict mode.
- Zero `any` types.
- All types importable via `@/features/analytics/types`.
