# 0006 — Analytics Service Layer & Metric Utilities

> Implement `IAnalyticsService`, `AnalyticsService`, 15 pure metric-formula functions, and display formatters. The service delegates to `IAnalyticsApi` via DI; formulas are independently testable pure functions targeting 95% coverage.

---

## Prior State

`IAnalyticsApi` and `StubAnalyticsApi` exist (PR 0005). No business-logic layer or formatter utilities exist.

## Target State

Hooks call `analyticsService.getOverview(filters)` through DI. Metric formulas are pure functions in a utility module. Formatters produce consistent display strings for currency, percentages, numbers, durations, and tokens.

---

## Files to Create

### `src/features/analytics/services/IAnalyticsService.ts`

Identical method signatures to `IAnalyticsApi` — the service is a 1:1 pass-through with post-processing:

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

### `src/features/analytics/services/AnalyticsService.ts`

```ts
export class AnalyticsService implements IAnalyticsService {
  constructor(private api: IAnalyticsApi) {}
  // Each method: await this.api.methodName(...), apply post-processing, return.
}
```

Post-processing per method:
- Round all `*Usd` fields to 2 decimal places.
- Round all percentage fields to 1 decimal place.
- Validate anomaly `runId` values are non-empty strings.
- No data generation — pure delegation + normalization.

### `src/features/analytics/utils/metricFormulas.ts`

Every function is a **pure function** — no side effects, no imports except types.

```ts
// Every function: if denominator === 0, return 0.
// Every percentage function: clamp result to [0, 100].
// Every currency function: round to 2 decimal places.

export function calcSeatAdoptionRate(activeSeats: number, purchased: number): number;
export function calcWauMauRatio(wau: number, mau: number): number;
export function calcRunCompletionRate(completed: number, started: number): number;
export function calcRunSuccessRate(succeeded: number, completed: number): number;
export function calcErrorRate(failed: number, started: number): number;
export function calcProviderShare(providerRuns: number, totalRuns: number): number;
export function calcAverageTokensPerRun(totalTokens: number, runs: number): number;
export function calcAverageCostPerRunUsd(totalCost: number, runs: number): number;
export function calcCostPerSuccessfulRunUsd(totalCost: number, succeeded: number): number;
export function calcPrMergeRate(merged: number, created: number): number;
export function calcTestsPassRate(passing: number, executed: number): number;
export function calcCodeAcceptanceRate(accepted: number, total: number): number;
export function calcReworkRate(followUps: number, succeeded: number): number;
export function calcPolicyViolationRate(violations: number, actions: number): number;
```

Implementation pattern for every function:

```ts
export function calcRunSuccessRate(succeeded: number, completed: number): number {
  if (completed <= 0) return 0;
  return Math.min(100, Math.max(0, (succeeded / completed) * 100));
}
```

### `src/features/analytics/utils/formatters.ts`

```ts
/** "$47,823.00" — 2 decimal places, comma-separated, USD prefix */
export function formatCurrency(usd: number): string;

/** "94.2%" — 1 decimal place, % suffix */
export function formatPercent(value: number): string;

/** "1,247" — comma-separated integer */
export function formatNumber(n: number): string;

/** "2.8M" / "15.6K" / "247" — compact for large numbers */
export function formatCompactNumber(n: number): string;

/** "2.3s" / "120.0s" — from milliseconds */
export function formatDuration(ms: number): string;

/** "2.8M" — tokens use same compact format */
export function formatTokens(n: number): string;

/** "+12.3%" / "−5.2%" — signed delta with direction symbol */
export function formatDelta(value: number): string;
```

### `src/features/analytics/utils/index.ts`

```ts
export * from "./metricFormulas";
export * from "./formatters";
```

### `src/features/analytics/services/index.ts`

```ts
export type { IAnalyticsService } from "./IAnalyticsService";
export { AnalyticsService } from "./AnalyticsService";
```

---

## Depends On

- **PR 0003** — type contracts.
- **PR 0005** — `IAnalyticsApi` (service constructor parameter).

## Done When

- `AnalyticsService` implements all 8 methods of `IAnalyticsService`.
- Every metric formula returns `0` when denominator is `0`.
- `calcRunSuccessRate(0, 0) === 0` (not NaN).
- `calcAverageCostPerRunUsd(100, 3)` rounds to `33.33`.
- `formatCurrency(47823)` → `"$47,823.00"`.
- `formatCompactNumber(2_800_000)` → `"2.8M"`.
- `formatDuration(2300)` → `"2.3s"`.
- `formatPercent(94.2)` → `"94.2%"`.
- `npx tsc --noEmit` passes.
