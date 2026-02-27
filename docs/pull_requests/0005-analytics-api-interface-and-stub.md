# 0005 — Analytics API Interface & Stub Implementation

> Define `IAnalyticsApi` (abstract contract) and build `StubAnalyticsApi` — a fully functional in-memory query engine with filtering, sorting, pagination, aggregation, latency simulation, and optional failure injection.

---

## Prior State

Type contracts (PR 0003) and seed data (PR 0004) exist. No data-access abstraction exists.

## Target State

Any consumer calls `api.getOverview(filters)` and receives a properly typed, filter-aware response after simulated latency. The interface guarantees a real API can replace the stub without changing any consumer.

---

## Files to Create

### `src/features/analytics/api/IAnalyticsApi.ts`

```ts
import type {
  AnalyticsFilters, OverviewResponse, UsageResponse,
  OutcomesResponse, CostResponse, ReliabilityResponse,
  GovernanceResponse, RunsPageRequest, RunsPageResponse,
  RunDetailResponse,
} from "@/features/analytics/types";

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

### `src/features/analytics/api/stub/StubAnalyticsApi.ts`

```ts
interface StubConfig {
  latencyMinMs?: number;      // default 250
  latencyMaxMs?: number;      // default 900
  debugFailureRate?: number;  // 0–1, default 0
}

class StubAnalyticsApi implements IAnalyticsApi {
  constructor(private seedData: SeedData, private config: StubConfig = {}) {}
  // ... 8 methods
}
```

#### Internal Filter Engine

`private filterRuns(filters: AnalyticsFilters): RunListRow[]`

Apply in order (AND logic — all must pass):

1. **Time range** — `run.startedAtIso >= fromIso && run.startedAtIso <= toIso`
2. **teamIds** — if non-empty, `run.teamId in teamIds`
3. **userIds** — if non-empty, `run.userId in userIds`
4. **projectIds** — if non-empty, `run.projectId in projectIds`
5. **providers** — if non-empty, `run.provider in providers`
6. **modelIds** — if non-empty, `run.modelId in modelIds`
7. **statuses** — if non-empty, `run.status in statuses`
8. Empty/undefined arrays = no constraint on that dimension.

#### Time-Series Helper

`private bucketByDay(runs: RunListRow[], valueFn: (dayRuns: RunListRow[]) => number): TimeSeriesPoint[]`

Group runs by calendar day, compute `valueFn` per group, return sorted array.

#### Method Specifications

| Method | Aggregation from filtered runs |
|--------|-------------------------------|
| **getOverview** | KPIs: `seatAdoptionRate`, `runSuccessRate`, `totalCostUsd`, `providerShareCodex/Claude`, `policyViolationCount`. Trends: daily run count, daily cost. Anomalies: top-3 (highest cost, longest duration, highest tokens). |
| **getUsage** | `wau` (unique users last 7d of range), `mau` (last 30d), `seatAdoptionRate`. Trends: daily active users. Distribution: runs-per-user histogram. Breakdown: per-team stats. |
| **getOutcomes** | PR counts, merge rate, median time to merge, test pass rate, acceptance rate, rework rate. Trend: daily merged PRs. Leaderboard: top 5 teams by PRs merged. |
| **getCost** | Total cost, avg cost/run, cost/successful run. Trend: daily cost. Breakdown: by project. Budget: hardcoded $60K budget, forecast extrapolated from daily spend rate. |
| **getReliability** | Success rate, error rate, p50/p95 duration, p95 queue wait, peak concurrency (max concurrent within any 1-min window). Failure category breakdown. Trend: daily success rate. |
| **getGovernance** | Violation count/rate, blocked network attempts, audit events. Violations by team. Recent violations, security events, compliance items, policy changes — all from seed data, filtered by time range. |
| **getRunsPage** | Sort by `request.sortBy` + `request.sortDirection`. Paginate: `rows = sorted.slice((page-1)*pageSize, page*pageSize)`. Return `{ total, page, pageSize, rows }`. |
| **getRunDetail** | Find run by ID. Generate timeline events from timestamps. Extract artifacts from outcome fields. Generate policy context (stub: deterministic allowed/blocked actions from seed). |

#### Latency Simulation

Every method: `await new Promise(r => setTimeout(r, randomBetween(min, max)))`.

#### Failure Injection

If `config.debugFailureRate > 0` and `prng() < debugFailureRate`, reject with `new Error("StubAnalyticsApi: simulated failure")`.

### `src/features/analytics/api/index.ts`

```ts
export type { IAnalyticsApi } from "./IAnalyticsApi";
export { StubAnalyticsApi } from "./stub/StubAnalyticsApi";
```

---

## Depends On

- **PR 0003** — all type contracts.
- **PR 0004** — `generateSeedData()` and `SeedData`.

## Done When

- All 8 methods implement `IAnalyticsApi` and pass `tsc --noEmit`.
- `filterRuns({ providers: ["codex"] })` returns only codex runs.
- `filterRuns({ teamIds: ["team_01"], statuses: ["failed"] })` returns only failed team_01 runs.
- Time-range boundaries are inclusive (runs at exact boundary timestamps included).
- `getRunsPage` with identical inputs returns identical rows (stable sort + deterministic seed).
- `sortBy: "costUsd", sortDirection: "desc"` → highest cost first.
- 250–900ms latency per call.
- `debugFailureRate: 1` → every call rejects.
- `getOverview` anomalies match the 3 injected outlier runs from seed data.
