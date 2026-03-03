# 0031 — Governance Seat User Runs Bar Chart

> Add a Governance dataviz that visualizes active seat users by AI usage (`runsCount`) using full names.

---

## User Story

As a governance admin, I want a bar chart of active seat users by AI usage so I can quickly compare which account seats are consuming AI the most.

## Prior State

`/(dashboard)/governance` already renders:

- Seat user summary lines (most/least usage)
- Seat user table (`seatUserUsage`) with full names

The screen does not yet visualize seat usage as a chart.

## Target State

Governance includes a new chart section in "Seat User Oversight" showing:

- X-axis/category: `SeatUserUsageRow.fullName`
- Y-axis/value: `SeatUserUsageRow.runsCount`
- Ordering: highest `runsCount` first (descending)

The chart is additive; existing summary lines and table remain.

## Files to Update

### `src/app/(dashboard)/governance.tsx`

- Add a chart card in the seat oversight section.
- Map `data.seatUserUsage` to chart input `{ key: fullName, value: runsCount }`.
- Keep chart and seat table driven from the same filtered dataset.

### `src/features/analytics/hooks/__tests__/useGovernanceDashboard.test.ts`

- Add assertions confirming seat usage is chart-ready and sorted by `runsCount` descending.

### `src/app/(dashboard)/__tests__/governanceScreen.test.tsx` (new)

- Add screen-level rendering assertions for:
  - Seat usage chart section title/subtitle
  - Presence of full-name labels
  - Presence of runs-based bars/values

### `e2e/tests/04-governance-flow.spec.ts`

- Add a smoke assertion for the new seat usage chart section visibility.

## Acceptance Criteria

- A new seat usage bar chart renders on Governance mount.
- Chart title/subtitle matches seat oversight context.
- Bars use full names from `SeatUserUsageRow.fullName`.
- Bars are sorted by `runsCount` descending.
- Filter/time-range changes update chart and table consistently.

## Test Plan

1. Hook test: verify sorted seat usage data and required fields for chart mapping.
2. Screen test: verify chart section renders and labels correspond to full names.
3. E2E test: verify Governance route shows the seat usage chart section.

## Depends On

- **PR 0018** — Governance screen baseline
- **PR 0030** — Seat user oversight data contract and table
- **PR 0010** — chart components
- **PR 0008** — shared filters
