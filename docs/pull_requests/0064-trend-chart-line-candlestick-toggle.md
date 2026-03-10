# 0064 — Trend Charts: Line/Candlestick (Diffs) Toggle

> Add a built-in chart-mode toggle for all trend charts so users can switch between the current line/area view and a candlestick diffs view from the chart’s upper-right corner.

---

## User Stories

1. As an analyst, I want to switch a trend chart between line view and candlestick diffs view so I can inspect both overall direction and point-to-point movement.
2. As a dashboard user, I want the chart mode controls in a consistent upper-right position so the interaction is discoverable and repeatable across screens.
3. As an engineer, I want mode-toggle behavior centralized in the shared trend chart component so screens stay declarative and maintainable.

## Prior State

- `TrendChart` only rendered `line` or `area` series based on the static `variant` prop.
- There was no in-chart mode toggle, and no candlestick/diffs rendering path.
- Each trend card depended on a single fixed visualization mode.

## Target State

1. Add built-in mode controls to `TrendChart`:
- Render `Line` and `Diffs` buttons in the chart’s upper-right corner.
- Default mode stays line/area (backward-compatible behavior).

2. Add candlestick diffs rendering in `TrendChart`:
- Derive candle open/close from sequential `TimeSeriesPoint` values.
- Render wick/body with clear up/down/neutral coloring.
- Reuse existing axes/ticks/grid logic.

3. Roll out automatically to all existing trend-chart usages:
- `Runs Over Time`, `Cost Trend`, `Active Users Trend`, `PRs Merged Over Time`, `Cost per Day`, `Reliability Trend`.
- No per-screen toggle duplication or screen-level business logic.

4. Preserve architecture and typing constraints:
- Keep logic in shared chart component.
- Strict TypeScript typing; no `any`.

## Files to Create / Update

### Docs

- `docs/pull_requests/0000-task-manager.md`
- `docs/pull_requests/0064-trend-chart-line-candlestick-toggle.md`

### Charts

- `src/components/charts/TrendChart.tsx`
  - Add upper-right mode toggle controls.
  - Add candlestick diffs rendering path.
  - Keep existing line/area rendering as default mode.

### Tests

- `src/components/charts/__tests__/TrendChart.test.tsx`
  - Add assertions for mode controls.
  - Add assertions that toggling to `Diffs` renders candlestick series.
  - Keep existing coverage for empty data, variants, and zero-to-one axis behavior.

## Acceptance Criteria

- Every chart using `TrendChart` shows built-in `Line` and `Diffs` toggle controls in the upper-right.
- Default mode remains the existing line/area rendering.
- Switching to `Diffs` renders a candlestick-style series derived from sequential trend values.
- Trend charts with `yScaleMode="percentages"` continue to render valid axis labels and toggle correctly.
- No screen-level chart-mode duplication is introduced.
- TypeScript and unit tests pass with no new `any` usage.

## Test Plan (Write + Run)

1. Component unit tests:
- `src/components/charts/__tests__/TrendChart.test.tsx`

2. Focused regression checks:
- `npx jest src/components/charts/__tests__/TrendChart.test.tsx`
- `npx jest src/app/(dashboard)/__tests__/costsScreen.test.tsx`
- `npx jest src/app/(dashboard)/__tests__/agentsScreen.test.tsx`
- `npx tsc --noEmit`

## Depends On

- **PR 0010** — Data Visualization Components
- **PR 0063** — Bar Charts: Orange Value-Intensity Palette
