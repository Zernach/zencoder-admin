# 0065 — Governance Seat Usage: Hover Tooltip Details + Table Removal

> Remove the standalone seat-usage DataTable and surface those row details directly in the "Seat Usage by Runs" chart via an animated hover bubble on each human name.

---

## User Stories

1. As a governance admin, I want seat usage details inside the chart interaction so I can inspect a user without scanning a separate table.
2. As an analyst, I want hovering a human name to reveal Full Name, Team, Runs, Tokens, and Cost so I can get the same data with less visual clutter.
3. As an engineer, I want tooltip behavior implemented in the shared chart component with typed contracts so the UI remains maintainable and reusable.

## Prior State

- Governance "Seat User Oversight" rendered:
  - A "Seat Usage by Runs" horizontal bar chart.
  - A separate DataTable with columns `Full Name`, `Team`, `Runs`, `Tokens`, `Cost`.
- Seat usage detail inspection required moving attention between chart and table.

## Target State

1. Remove seat usage DataTable from Governance:
- Keep the section header and `+ Add Seat` action.
- Keep the "Seat Usage by Runs" chart card.

2. Add hover/press details in `BreakdownChart` horizontal bars:
- When the user hovers a human name (web) or presses it (touch fallback), show an animated bubble.
- Bubble content includes:
  - `Full Name`
  - `Team`
  - `Runs`
  - `Tokens`
  - `Cost`

3. Keep architecture boundaries:
- Screen remains composition-only.
- No direct stub/API calls in screen.
- Shared typed data drives both chart values and hover detail payload.

## Files to Create / Update

### Docs

- `docs/pull_requests/0000-task-manager.md`
- `docs/pull_requests/0065-governance-seat-usage-hover-tooltip-and-table-removal.md`

### Screens

- `src/app/(dashboard)/governance/index.tsx`
  - Remove seat usage DataTable.
  - Build chart data with hover-detail rows from filtered `seatUserUsage`.
  - Pass typed hover details into `BreakdownChart`.

### Charts

- `src/components/charts/BreakdownChart.tsx`
  - Extend chart datum contract with optional tooltip rows.
  - Add hover/press interactions on horizontal label targets.
  - Animate hover bubble entry and render the details list.

### Tests

- `src/app/(dashboard)/__tests__/governanceScreen.test.tsx`
  - Assert seat usage table headers no longer render.
  - Assert seat chart still renders seat labels.
  - Assert seat chart receives hover-detail payload.
- `src/components/charts/__tests__/BreakdownChart.test.tsx`
  - Add coverage for hover/press bubble visibility.
  - Assert bubble renders all required fields.

## Acceptance Criteria

- The seat usage DataTable under "Seat Usage by Runs" is removed from Governance.
- Hovering a human label in the seat usage horizontal chart shows an animated bubble.
- Bubble content shows `Full Name`, `Team`, `Runs`, `Tokens`, and `Cost` values from the corresponding seat usage row.
- Chart bars/labels continue to render correctly and remain sorted by runs.
- Existing governance tables (team performance, violations, security events, policy changes) remain unchanged.
- TypeScript strict checks pass with no new `any`.

## Test Plan (Write + Run)

1. Update component tests:
- `src/components/charts/__tests__/BreakdownChart.test.tsx`
  - Verify hover/press reveals and hides the bubble.
  - Verify bubble field/value rendering for one seat row.

2. Update governance screen tests:
- `src/app/(dashboard)/__tests__/governanceScreen.test.tsx`
  - Verify `Full Name` column header is absent.
  - Verify seat usage chart still renders labels and receives hover details.

3. Run focused validation:
- `npx jest 'src/components/charts/__tests__/BreakdownChart.test.tsx'`
- `npx jest 'src/app/(dashboard)/__tests__/governanceScreen.test.tsx'`
- `npx tsc --noEmit`

## Depends On

- **PR 0010** — Data Visualization Components
- **PR 0018** — Governance & Compliance Screen
- **PR 0031** — Governance Seat User Runs Bar Chart
- **PR 0063** — Bar Charts Orange Value-Intensity Palette
