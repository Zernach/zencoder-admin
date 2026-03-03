# 0034 — Cost Project Breakdown Full Title Visibility

> Ensure project names in Cost "Project Breakdown" are fully visible and never truncated.

---

## User Story

As a FinOps user, I need full project titles visible in Project Breakdown so I can identify high-cost projects without ambiguity.

## Prior State

The Cost screen renders Project Breakdown via `BreakdownChart` with horizontal labels that currently use one-line truncation behavior for long project names.

## Target State

Cost Project Breakdown uses a non-truncating label mode:

- Long names render fully (wrapped or expanded label area)
- No chopped trailing text/ellipsis for project titles
- Bar/value readability remains intact on web and mobile

## Files to Update

### `src/components/charts/BreakdownChart.tsx`

- Extend `BreakdownChartProps` with a label-display option (for example `truncateLabels?: boolean` or `labelMode`).
- Implement non-truncating label rendering path for horizontal bars.
- Preserve current default behavior for other existing chart usages.

### `src/app/(dashboard)/costs.tsx`

- Pass full-label mode to the Project Breakdown chart only.

### `src/components/charts/__tests__/BreakdownChart.test.tsx` (new)

- Add test coverage for long label rendering in non-truncating mode.

### `src/app/(dashboard)/__tests__/costsScreen.test.tsx` (new or update)

- Verify long project names render fully in Project Breakdown section.

## Acceptance Criteria

- Project titles in Cost Project Breakdown are fully visible.
- No title is truncated or ellipsized in full-label mode.
- Horizontal bar alignment and numeric value readability remain correct.
- Layout remains usable on web and mobile breakpoints.

## Test Plan

1. Component unit test for `BreakdownChart` full-label mode.
2. Screen test for long-name visibility in Cost Project Breakdown.
3. Manual responsive check (mobile + desktop widths) for label readability.

## Depends On

- **PR 0017** — Cost screen baseline
- **PR 0010** — chart components foundation
