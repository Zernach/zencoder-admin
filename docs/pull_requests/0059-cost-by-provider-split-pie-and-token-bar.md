# 0059 — Costs: Split "Cost by Provider" into Pie + Cost per Token Bar

> Replace the current single mixed visualization with two focused charts: provider spend share (pie) and provider unit cost (bar).

---

## User Stories

1. As a FinOps stakeholder, I want provider spend share and per-token cost shown separately so I can distinguish highest-spend providers from highest-cost-per-token providers.
2. As a dashboard user, I want a clear bar comparison of cost per token (for example, 13 vs 8 vs 4 ten-thousandths of a penny per token) so I can rank providers by unit economics quickly.
3. As an engineer, I want this change to reuse existing shared contracts (`ProviderCostRow`) so frontend and stubbed backend remain type-safe and swappable.

## Prior State

- `Cost by Provider` in `src/app/(dashboard)/costs/index.tsx` renders one `ProviderCostChart` card.
- `ProviderCostChart` currently mixes the pie view with detailed metric text in one visualization block.
- There is no dedicated bar chart for provider cost-per-token comparison.

## Target State

`Cost by Provider` renders exactly two visualizations:

1. Provider Cost Share (pie):
- Keep existing pie chart behavior and center total.
- Continue to represent percent share of total provider cost.

2. Cost per Provider Token (bar):
- Add a horizontal bar chart that compares `totalCostUsd / totalTokens` by provider.
- Rank bars descending by per-token cost.
- Display value labels using existing formatter language: `X ten-thousandths of a penny per token`.

Layout behavior:
- Web/tablet: show both charts side-by-side when width allows.
- Mobile: stack charts vertically with pie first, bar second.

Data behavior:
- No API contract changes required; derive per-token values from `ProviderCostRow.totalCostUsd` and `ProviderCostRow.totalTokens`.
- Zero-token rows render as `0 ten-thousandths of a penny per token` and never show `NaN` or `Infinity`.

## Files to Create / Update

### `src/app/(dashboard)/costs/index.tsx`

- Replace one chart card in `Cost by Provider` with two chart cards.
- Keep section title and section anchor id unchanged.

### `src/components/charts/ProviderCostChart.tsx`

- Keep (or extract to) pie-share responsibility for visualization #1.
- Preserve existing provider share semantics.

### `src/components/charts/ProviderTokenCostBarChart.tsx` (new)

- Add new chart component for per-token provider cost comparison.
- Use `ProviderCostRow[]` as input and derive per-token values in a typed path.

### `src/components/charts/index.ts`

- Export `ProviderTokenCostBarChart`.

### `src/components/charts/__tests__/ProviderTokenCostBarChart.test.tsx` (new)

- Add unit tests for per-token value rendering and sort behavior.

### `src/app/(dashboard)/__tests__/costsScreen.test.tsx`

- Extend screen tests to assert both `Cost by Provider` visualizations render.

### `src/features/analytics/utils/__tests__/formatters.test.ts` (update if needed)

- Confirm `formatCostPerToken` expectations match chart label expectations for representative values (13, 8, 4 ten-thousandths examples).

## Acceptance Criteria

- `Cost by Provider` renders exactly two visualizations (not one).
- First visualization is the provider spend-share pie chart.
- Second visualization is a provider cost-per-token bar chart.
- Bar values are shown in ten-thousandths of a penny per token.
- Bar order is descending by computed per-token cost.
- Provider names are human-readable labels (`Codex`, `Claude`, `Other`).
- Zero-token providers render safely as zero cost-per-token.
- Web/tablet shows side-by-side cards at wide widths; mobile shows stacked cards.

## Test Plan (Write + Run)

1. Add `ProviderTokenCostBarChart` unit tests:
- Renders one bar per provider row.
- Sorts rows by computed per-token cost descending.
- Shows expected formatted labels (including 13/8/4 ten-thousandths examples).
- Handles `totalTokens = 0` without invalid numeric output.

2. Update `costsScreen.test.tsx`:
- Verifies section now includes both visualization titles.
- Verifies both pie and bar visualizations receive provider data.
- Verifies per-token chart text is present for representative fixtures.

3. Run focused regression checks:
- `npx jest src/components/charts/__tests__/ProviderTokenCostBarChart.test.tsx`
- `npx jest 'src/app/(dashboard)/__tests__/costsScreen.test.tsx'`
- `npx jest src/features/analytics/utils/__tests__/formatters.test.ts`
- `npx tsc --noEmit`

## Depends On

- **PR 0017** — Cost Analytics Screen baseline
- **PR 0010** — Data visualization component patterns
- **PR 0037** — TypeScript type cleanup baseline
