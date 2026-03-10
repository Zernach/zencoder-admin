# 0076 — Bar/Pie Chart Unification Toggle

> Introduce a shared `BarPieChart` mode-toggle container and route all bar/pie chart experiences through it so users can switch each chart between bar and pie view styles.

---

## User Stories

1. As an analytics user, I want every bar/pie visualization to support bar and pie modes so I can compare categorical distributions in whichever shape is clearer.
2. As a dashboard user, I want the mode toggle to appear consistently in chart card headers (or inline when outside a card) so the control is predictable and discoverable.
3. As an engineer, I want one shared toggle implementation for bar/pie switching so behavior and styling stay consistent across charts.

## Prior State

- `LineChart` had a reusable chart-mode toggle pattern, but bar and pie chart components did not share that behavior.
- `BarChart` rendered only bar modes.
- `DonutChart` and `ProviderCostChart` rendered only pie modes.
- Users could not switch a given chart between bar and pie representations.

## Target State

1. Add a shared `BarPieChart` container:
- Unified `Bar` / `Pie` toggle controls.
- `ChartCard` header action integration (same pattern as `LineChart`).
- Inline mode toggle fallback when no `ChartCard` context is available.

2. Upgrade all bar charts:
- `BarChart` now renders through `BarPieChart`.
- Default mode remains bar for backward compatibility.
- Pie mode is auto-derived from existing bar/breakdown data with typed tooltips and legend rows.

3. Upgrade all pie wrappers:
- `DonutChart` now renders through `BarPieChart` with default pie mode and bar fallback.
- `ProviderCostChart` now renders through `BarPieChart` with default pie mode and bar fallback.

4. Keep architecture and typing constraints:
- No `any` introduced.
- Existing chart wrappers remain focused and reusable.
- Shared chart types continue to be reused across wrappers.

## Files Created

- `src/components/charts/BarPieChart.tsx`
- `src/components/charts/__tests__/BarPieChart.test.tsx`
- `src/components/charts/__tests__/DonutChart.test.tsx`
- `src/components/charts/__tests__/ProviderCostChart.test.tsx`
- `docs/pull_requests/0076-bar-pie-chart-unification-toggle.md`

## Files Updated

- `docs/pull_requests/0000-task-manager.md`
- `src/components/charts/BarChart.tsx`
- `src/components/charts/DonutChart.tsx`
- `src/components/charts/ProviderCostChart.tsx`
- `src/components/charts/index.ts`
- `src/components/charts/__tests__/BarChart.test.tsx`
- `src/components/charts/__tests__/BarChartBreakdownMode.test.tsx`
- `src/components/charts/__tests__/ProviderTokenCostBarChart.test.tsx`

## Acceptance Criteria

- Every `BarChart` instance can toggle between bar and pie views.
- `DonutChart` can toggle between pie and bar views.
- `ProviderCostChart` can toggle between pie and bar views.
- Toggle controls appear in `ChartCard` header actions when available, and inline otherwise.
- Existing bar chart behavior (labels, hover rows, color scaling, formatting) remains intact in bar mode.
- TypeScript compile surface for changed files remains strict and typed (no new `any` usage).
- Updated chart unit tests pass.

## Test Plan (Write + Run)

1. Add/Update unit tests:
- `src/components/charts/__tests__/BarPieChart.test.tsx`
- `src/components/charts/__tests__/BarChart.test.tsx`
- `src/components/charts/__tests__/BarChartBreakdownMode.test.tsx`
- `src/components/charts/__tests__/ProviderTokenCostBarChart.test.tsx`
- `src/components/charts/__tests__/DonutChart.test.tsx`
- `src/components/charts/__tests__/ProviderCostChart.test.tsx`

2. Run focused chart test suite:
- `npx jest src/components/charts/__tests__/BarPieChart.test.tsx src/components/charts/__tests__/BarChart.test.tsx src/components/charts/__tests__/BarChartBreakdownMode.test.tsx src/components/charts/__tests__/ProviderTokenCostBarChart.test.tsx src/components/charts/__tests__/DonutChart.test.tsx src/components/charts/__tests__/ProviderCostChart.test.tsx`

3. Run chart-consuming screen regressions:
- `npx jest --runTestsByPath src/app/(dashboard)/__tests__/costsScreen.test.tsx src/app/(dashboard)/__tests__/agentsScreen.test.tsx src/app/(dashboard)/__tests__/governanceScreen.test.tsx`

4. Run type check:
- `npx tsc --noEmit`

## Depends On

- **PR 0064** — Trend Charts: Line/Candlestick (Diffs) Toggle
- **PR 0066** — Chart Primitives DRY Refactor: Bar, Line/Candlestick, Pie
