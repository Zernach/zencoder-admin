# 0072 — Currency App-Wide Integration: Tables, Charts, and Visualizations

> Update every monetary display across the app — data tables, charts, KPI cards, cost breakdowns, and detail screens — to use the currency-aware formatters and respect the user's selected currency.

---

## User Stories

1. As a user who selected Japanese Yen, I want every cost, revenue, and monetary value in the app to display in JPY with the &yen; symbol so my experience is fully localized.
2. As a user, I want data table columns that show monetary values to automatically convert and format based on my selected currency.
3. As a user, I want chart axes, tooltips, and legends that show monetary values to reflect my selected currency.

## Prior State

- `useCurrencyFormatter` hook and currency-aware formatters exist (PR 0070).
- Currency selection modal is integrated (PR 0071).
- Most components still call the old `formatCurrency(usdAmount)` without a currency parameter, or use hardcoded `$` symbols.

## Target State

1. **All monetary displays use `useCurrencyFormatter`**:
   - Components that display money import `useCurrencyFormatter` and use its returned `formatCurrency`, `formatCostPerToken`, or `formatCompactCurrency` functions.
   - No component hardcodes a currency symbol (`$`, `€`, etc.).

2. **Data Tables**:
   - Cost columns in all `DataTable` instances use currency-aware formatting.
   - Affected screens: Overview (cost KPIs), Costs (all cost tables and breakdowns), Projects (cost columns), Agents (cost-per-run columns), Runs (cost column), Governance (cost-related metrics).

3. **Charts and Visualizations**:
   - Cost-axis labels on bar charts use currency-aware compact formatting.
   - Pie/donut chart legends and tooltips use currency-aware formatting.
   - Trend chart Y-axis and tooltips for cost metrics use currency-aware formatting.
   - KPI cards on Overview dashboard use currency-aware formatting for cost metrics.

4. **Entity Detail Screens**:
   - Run detail cost breakdown uses currency-aware formatting.
   - Project detail cost summary uses currency-aware formatting.
   - Agent detail cost metrics use currency-aware formatting.

5. **Conversion applied at display layer only**:
   - Seed data and API responses remain in EUR (base currency).
   - Conversion happens in the formatting functions, not in the data layer.
   - This keeps the data layer clean and conversion logic centralized.

## Files to Update

### Screens
- `src/app/(dashboard)/overview/index.tsx` — KPI cards with cost metrics
- `src/app/(dashboard)/costs/index.tsx` — All cost tables and breakdowns
- `src/app/(dashboard)/projects/index.tsx` — Cost columns
- `src/app/(dashboard)/agents/index.tsx` — Cost-per-run columns
- `src/app/(dashboard)/runs/index.tsx` — Cost column
- `src/app/(dashboard)/governance/index.tsx` — Cost-related metrics

### Charts
- `src/components/charts/TrendChart.tsx` — Y-axis and tooltip formatting for cost series
- `src/components/charts/BreakdownChart.tsx` — Bar labels and tooltips
- `src/components/charts/ProviderCostChart.tsx` — Pie legend and tooltips
- `src/components/charts/ProviderTokenCostBarChart.tsx` — Bar labels
- `src/components/charts/DonutChart.tsx` — Legend formatting

### Entity Detail Views
- Run detail screen/view — cost breakdown section
- Project detail screen/view — cost summary
- Agent detail screen/view — cost metrics

### Hooks (if needed)
- Any data hooks that pre-format monetary strings should instead pass raw numbers to the view layer for currency-aware formatting.

## Acceptance Criteria

- Selecting EUR (default) displays all monetary values with `€` symbol and correct EUR amounts.
- Selecting USD converts all monetary values from EUR to USD and displays with `$` symbol.
- Selecting JPY converts and displays with `¥` symbol and no decimal places.
- All 20 supported currencies display correctly with their respective symbols and decimal conventions.
- No hardcoded currency symbols (`$`, `€`, `£`, etc.) remain in component render output.
- Data table sort behavior still works correctly (sorts on numeric value, not formatted string).
- Chart axes scale correctly for currencies with very different magnitudes (e.g., KRW values are ~1,400x EUR values).
- Existing tests pass after updating mocks for `useCurrencyFormatter`.
- `npx tsc --noEmit` passes.

## Test Plan (Write + Run)

1. Update screen tests with `useCurrencyFormatter` mock:
   - Create shared test utility that mocks `useCurrencyFormatter` to return EUR-based formatters by default.
   - Apply to all affected screen test files.

2. Update `src/app/(dashboard)/__tests__/overviewScreen.test.tsx`:
   - Verify cost KPI cards render with currency-formatted values.

3. Update `src/app/(dashboard)/__tests__/costsScreen.test.tsx`:
   - Verify cost tables and breakdowns use currency-formatted values.

4. Create integration test `src/features/analytics/__tests__/currencyIntegration.test.tsx`:
   - Set `selectedCurrency` to `"JPY"` in test store.
   - Render a cost-displaying component.
   - Assert values show `¥` symbol and no decimal places.
   - Change to `"GBP"` and assert `£` symbol with 2 decimal places.

5. Run validation:
   - `npx jest --runInBand`
   - `npx tsc --noEmit`

## Depends On

- **PR 0070** — Currency Conversion Engine and Formatter Updates
- **PR 0071** — Currency Selection Modal and Settings Integration
