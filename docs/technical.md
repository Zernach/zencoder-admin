# Zencoder Organizational Analytics Dashboard Technical Specification

## Purpose
This specification defines the exact architecture, shared contracts, and implementation constraints required for an LLM coding agent to one-shot the dashboard described in `docs/prd.md`.

## Non-Negotiable Constraints
- Use TypeScript with strict typing across frontend and stubbed backend modules.
- Use stubbed APIs only for this phase.
- All request/response/domain types are shared between UI and stub API from a single source of truth.
- Screens must not call APIs directly.
- Dependency flow must be: `screens -> hooks/view-models -> services -> interface-based API -> stub implementation`.

## Stack
- Expo + React Native + React Native Web.
- Expo Router.
- TanStack React Query.
- React Native SVG + chart library compatible with iOS/Android/Web.
- Jest + React Native Testing Library for unit/component/integration tests.
- Playwright for web end-to-end tests.

## Suggested Directory Layout
```text
src/
  app/
    (dashboard)/
      overview.tsx
      usage.tsx
      outcomes.tsx
      cost.tsx
      reliability.tsx
      governance.tsx
      runs/
        index.tsx
        [runId].tsx
  features/
    analytics/
      types/
        contracts.ts
      api/
        IAnalyticsApi.ts
        stub/
          StubAnalyticsApi.ts
      services/
        IAnalyticsService.ts
        AnalyticsService.ts
      hooks/
        useDashboardFilters.ts
        useOverviewDashboard.ts
        useUsageDashboard.ts
        useOutcomesDashboard.ts
        useCostDashboard.ts
        useReliabilityDashboard.ts
        useGovernanceDashboard.ts
        useRunsExplorer.ts
        useRunDetail.ts
      mappers/
        overviewMappers.ts
        chartMappers.ts
      fixtures/
        seedData.ts
  components/
    dashboard/
      DashboardShell.tsx
      GlobalFilterBar.tsx
      KpiCard.tsx
      TrendChart.tsx
      BreakdownChart.tsx
      RunsTable.tsx
      ErrorState.tsx
      EmptyState.tsx
      LoadingSkeleton.tsx
  core/
    di/
      AppDependencies.tsx
```

## Shared Type Contracts (Single Source of Truth)
Place all domain and API contracts in `src/features/analytics/types/contracts.ts`.

```ts
export type ModelProvider = "codex" | "claude" | "other";

export type RunStatus = "queued" | "running" | "succeeded" | "failed" | "canceled";

export type RunFailureCategory =
  | "timeout"
  | "tool_error"
  | "model_error"
  | "policy_block"
  | "infra_error"
  | "unknown";

export interface TimeRange {
  fromIso: string;
  toIso: string;
}

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

export interface TimeSeriesPoint {
  tsIso: string;
  value: number;
}

export interface KeyValueMetric {
  key: string;
  value: number;
}

export interface OverviewKpis {
  seatAdoptionRate: number;
  runSuccessRate: number;
  totalCostUsd: number;
  providerShareCodex: number;
  providerShareClaude: number;
  policyViolationCount: number;
}

export interface OverviewResponse {
  kpis: OverviewKpis;
  runsTrend: TimeSeriesPoint[];
  costTrend: TimeSeriesPoint[];
  anomalies: RunAnomaly[];
}

export interface UsageResponse {
  wau: number;
  mau: number;
  activeSeats30d: number;
  seatAdoptionRate: number;
  activeUsersTrend: TimeSeriesPoint[];
  runsPerUserDistribution: KeyValueMetric[];
  breakdownByTeam: UsageBreakdownRow[];
}

export interface OutcomesResponse {
  prsCreated: number;
  prsMerged: number;
  prMergeRate: number;
  medianTimeToMergeHours: number;
  testsPassRate: number;
  codeAcceptanceRate: number;
  reworkRate: number;
  outcomesTrend: TimeSeriesPoint[];
  leaderboard: OutcomesLeaderboardRow[];
}

export interface CostResponse {
  totalCostUsd: number;
  averageCostPerRunUsd: number;
  costPerSuccessfulRunUsd: number;
  costTrend: TimeSeriesPoint[];
  costBreakdown: CostBreakdownRow[];
  budget: BudgetSummary;
}

export interface ReliabilityResponse {
  runSuccessRate: number;
  errorRate: number;
  p50RunDurationMs: number;
  p95RunDurationMs: number;
  p95QueueWaitMs: number;
  peakConcurrency: number;
  failureCategoryBreakdown: KeyValueMetric[];
  reliabilityTrend: TimeSeriesPoint[];
}

export interface GovernanceResponse {
  policyViolationCount: number;
  policyViolationRate: number;
  blockedNetworkAttempts: number;
  auditEventsCount: number;
  violationsByTeam: KeyValueMetric[];
  policyChanges: PolicyChangeEvent[];
}

export interface RunsPageRequest {
  filters: AnalyticsFilters;
  page: number;
  pageSize: number;
  sortBy: "startedAtIso" | "costUsd" | "durationMs" | "totalTokens";
  sortDirection: "asc" | "desc";
}

export interface RunsPageResponse {
  total: number;
  page: number;
  pageSize: number;
  rows: RunListRow[];
}

export interface RunDetailResponse {
  run: RunListRow;
  timeline: RunTimelineEvent[];
  artifacts: RunArtifacts;
  policyContext: PolicyContext;
}

export interface RunListRow {
  id: string;
  status: RunStatus;
  failureCategory?: RunFailureCategory;
  teamId: string;
  userId: string;
  projectId: string;
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
}

export interface RunAnomaly {
  runId: string;
  type: "highest_cost" | "longest_duration" | "highest_tokens";
  label: string;
  value: number;
}

export interface UsageBreakdownRow {
  teamId: string;
  activeUsers: number;
  runsStarted: number;
  runSuccessRate: number;
}

export interface OutcomesLeaderboardRow {
  key: string;
  prsMerged: number;
  testsPassRate: number;
  codeAcceptanceRate: number;
}

export interface CostBreakdownRow {
  key: string;
  totalCostUsd: number;
  runsStarted: number;
  averageCostPerRunUsd: number;
}

export interface BudgetSummary {
  budgetUsd: number;
  spentUsd: number;
  remainingUsd: number;
  forecastMonthEndUsd: number;
}

export interface PolicyChangeEvent {
  id: string;
  actorUserId: string;
  action: string;
  timestampIso: string;
  target: string;
}

export interface RunTimelineEvent {
  step: "queued" | "started" | "tools" | "tests" | "artifact" | "completed";
  timestampIso: string;
  detail: string;
}

export interface RunArtifacts {
  linesAdded: number;
  linesRemoved: number;
  prCreated: boolean;
  prMerged: boolean;
  testsExecuted: number;
  testsPassed: number;
}

export interface PolicyContext {
  blockedActions: string[];
  allowedActions: string[];
  networkMode: "none" | "limited" | "full";
}
```

## API Abstractions
`src/features/analytics/api/IAnalyticsApi.ts`:

```ts
export interface IAnalyticsApi {
  getOverview(filters: AnalyticsFilters): Promise<OverviewResponse>;
  getUsage(filters: AnalyticsFilters): Promise<UsageResponse>;
  getOutcomes(filters: AnalyticsFilters): Promise<OutcomesResponse>;
  getCost(filters: AnalyticsFilters): Promise<CostResponse>;
  getReliability(filters: AnalyticsFilters): Promise<ReliabilityResponse>;
  getGovernance(filters: AnalyticsFilters): Promise<GovernanceResponse>;
  getRunsPage(request: RunsPageRequest): Promise<RunsPageResponse>;
  getRunDetail(orgId: string, runId: string): Promise<RunDetailResponse>;
}
```

`StubAnalyticsApi` requirements:
- Implements `IAnalyticsApi`.
- Returns fully typed data only.
- Uses deterministic seeded fixtures.
- Simulates latency between `250ms` and `900ms`.
- Supports filtering, sorting, pagination, and segmentation logic.
- Can optionally inject controlled failures for testing (`debugFailureRate` config).

## Service Layer
Use interface-driven service layer:

```ts
export interface IAnalyticsService {
  getOverview(filters: AnalyticsFilters): Promise<OverviewResponse>;
  getUsage(filters: AnalyticsFilters): Promise<UsageResponse>;
  getOutcomes(filters: AnalyticsFilters): Promise<OutcomesResponse>;
  getCost(filters: AnalyticsFilters): Promise<CostResponse>;
  getReliability(filters: AnalyticsFilters): Promise<ReliabilityResponse>;
  getGovernance(filters: AnalyticsFilters): Promise<GovernanceResponse>;
  getRunsPage(request: RunsPageRequest): Promise<RunsPageResponse>;
  getRunDetail(orgId: string, runId: string): Promise<RunDetailResponse>;
}
```

`AnalyticsService` responsibilities:
- Coordinate API calls.
- Normalize/format units where needed.
- Keep metric calculations pure and testable in utility modules.
- Never contain view-specific component concerns.

## Dependency Injection
Provide dependencies through `AppDependencies` context:
- `analyticsApi: IAnalyticsApi`
- `analyticsService: IAnalyticsService`

Default runtime binding:
- `analyticsApi = new StubAnalyticsApi(seedData)`
- `analyticsService = new AnalyticsService(analyticsApi)`

Screens and hooks consume services through DI context only.

## Hooks/View Models
Each dashboard screen has a dedicated hook with predictable state:
- Return shape: `{ data, loading, error, refetch }` plus any screen-local actions.
- Query keys must include all active filters and pagination/sort values.
- Hooks map raw responses into render-ready view models.

Required hooks:
- `useOverviewDashboard`
- `useUsageDashboard`
- `useOutcomesDashboard`
- `useCostDashboard`
- `useReliabilityDashboard`
- `useGovernanceDashboard`
- `useRunsExplorer`
- `useRunDetail`

## Screen Composition Rules
- Screens compose reusable UI components and hook output only.
- No metrics formula logic inside screen components.
- No direct imports of stub API classes in screens/hooks.
- Shared components are platform-aware but style-consistent.

## Visualization Requirements
- KPI cards for core metrics with delta vs previous period where possible.
- Trend charts for volume/cost/reliability over time.
- Breakdown charts for provider/team/failure categories.
- Sortable and paginated runs table/list.
- Mobile-first chart sizing with readable labels.

## UX States and Error Handling
- Every data block supports loading skeleton, empty state, error state.
- Retry action calls hook `refetch`.
- Maintain previous data during refetch for smooth filter transitions.
- Show active filters in empty state messaging.

## Performance Requirements
- Initial screen data load target: `< 2.5s` on web with seeded data.
- Filter change re-render target: `< 1s` perceived update.
- Runs list virtualization on web and mobile list optimization.
- Avoid unnecessary rerenders by memoizing derived view models.

## Accessibility and Responsiveness
- Web: keyboard navigable filters, table rows, links, and actionable cards.
- Mobile: touch target minimum `44x44` and legible chart labels.
- Use semantic text hierarchy and color contrast that meets WCAG AA.
- Layout adapts at minimum breakpoints: mobile `<768`, tablet `768-1023`, desktop `>=1024`.

## Observability (App-Level)
- Log non-sensitive client errors in a typed logger utility.
- Never log secrets/tokens/raw prompt content.
- Emit screen and filter interaction events via local analytics interface (stubbed).

## Security and Data Handling
- All requests must include `orgId` scoping via `AnalyticsFilters`.
- Treat all prompt/run metadata as sensitive in logs and exports.
- Governance screens must expose policy/audit insights but not edit controls in V1.

## One-Shot Execution Checklist
1. Scaffold route structure and dashboard shell.
2. Implement shared contracts and interfaces.
3. Build deterministic stub fixtures and `StubAnalyticsApi`.
4. Build service layer and metric utilities.
5. Implement hooks with React Query.
6. Compose reusable dashboard components.
7. Build each screen in route order from Overview to Run Detail.
8. Implement loading/empty/error states everywhere.
9. Add unit, component, integration, and e2e tests.
10. Validate quality gates and finalize documentation alignment.

## Out of Scope
- Real auth provider integration.
- Real backend API integration.
- Billing invoice workflows.
- Policy management mutation UI.
