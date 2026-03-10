# 0066 — Chart Primitives DRY Refactor: Bar, Line/Candlestick, Pie

> DRY up chart rendering by introducing reusable chart primitives (`BarChart`, `LineCandlestickChart`, `PieChart`) and migrating all existing dashboard chart components to render through those primitives.

---

## User Stories

1. As a dashboard user, I want charts to stay visually and behaviorally consistent across screens.
2. As an engineer, I want one shared implementation for bar, line/candlestick, and pie rendering so chart fixes and enhancements happen in one place.
3. As a maintainer, I want existing chart wrappers to stay screen-friendly while delegating rendering to reusable primitives.

## Prior State

- Bar rendering logic was duplicated across:
  - `BreakdownChart`
  - `ProviderTokenCostBarChart`
  - `DistributionChart`
- Pie/donut rendering logic was duplicated across:
  - `DonutChart`
  - `ProviderCostChart`
- Line/candlestick rendering lived directly in `TrendChart` with no lower-level reusable primitive.

## Target State

1. Introduce shared chart primitives:
- `BarChart` for horizontal and vertical bar rendering.
- `LineCandlestickChart` for line/area and candlestick mode rendering.
- `PieChart` for reusable pie/donut segment rendering with overlay support.

2. Migrate all chart wrappers to primitives:
- `TrendChart` renders through `LineCandlestickChart`.
- `BreakdownChart`, `ProviderTokenCostBarChart`, and `DistributionChart` render through `BarChart`.
- `DonutChart` and `ProviderCostChart` render through `PieChart`.

3. Preserve current behavior:
- Existing chart props remain usable at wrapper level.
- Existing test IDs and chart-focused tests continue to pass.
- TypeScript strictness remains enforced (no new `any`).

## Files to Create / Update

### Docs

- `docs/pull_requests/0000-task-manager.md`
- `docs/pull_requests/0066-chart-primitives-dry-refactor.md`

### New Chart Primitives

- `src/components/charts/BarChart.tsx`
- `src/components/charts/LineCandlestickChart.tsx`
- `src/components/charts/PieChart.tsx`

### Refactored Chart Wrappers

- `src/components/charts/TrendChart.tsx`
- `src/components/charts/BreakdownChart.tsx`
- `src/components/charts/ProviderTokenCostBarChart.tsx`
- `src/components/charts/DistributionChart.tsx`
- `src/components/charts/DonutChart.tsx`
- `src/components/charts/ProviderCostChart.tsx`
- `src/components/charts/index.ts`

### Tests

- `src/components/charts/__tests__/BarChart.test.tsx` (new)
- `src/components/charts/__tests__/PieChart.test.tsx` (new)
- Existing regression tests:
  - `src/components/charts/__tests__/TrendChart.test.tsx`
  - `src/components/charts/__tests__/BreakdownChart.test.tsx`
  - `src/components/charts/__tests__/ProviderTokenCostBarChart.test.tsx`
  - `src/components/charts/__tests__/DistributionChart.test.tsx`

## Acceptance Criteria

- Shared chart primitives exist for bar, line/candlestick, and pie rendering.
- All existing chart wrappers render through one of those primitives.
- Existing chart test IDs used by tests remain valid.
- Chart regression tests pass for trend, breakdown, provider token bar, and distribution charts.
- New primitive tests cover `BarChart` and `PieChart` core rendering behavior.
- TypeScript strict checking reports no new errors from this refactor.

## Test Plan (Write + Run)

1. Add primitive tests:
- `src/components/charts/__tests__/BarChart.test.tsx`
- `src/components/charts/__tests__/PieChart.test.tsx`

2. Run chart regression tests:
- `npx jest src/components/charts/__tests__/TrendChart.test.tsx`
- `npx jest src/components/charts/__tests__/BreakdownChart.test.tsx`
- `npx jest src/components/charts/__tests__/ProviderTokenCostBarChart.test.tsx`
- `npx jest src/components/charts/__tests__/DistributionChart.test.tsx`

3. Run combined focused suite:
- `npx jest src/components/charts/__tests__/BarChart.test.tsx src/components/charts/__tests__/PieChart.test.tsx src/components/charts/__tests__/TrendChart.test.tsx src/components/charts/__tests__/BreakdownChart.test.tsx src/components/charts/__tests__/ProviderTokenCostBarChart.test.tsx src/components/charts/__tests__/DistributionChart.test.tsx`

4. Type check:
- `npx tsc --noEmit`

## Depends On

- **PR 0010** — Data Visualization Components
- **PR 0059** — Costs: Split "Cost by Provider" into Pie + Cost per Token Bar
- **PR 0063** — Bar Charts: Orange Value-Intensity Palette
- **PR 0064** — Trend Charts: Line/Candlestick (Diffs) Toggle
