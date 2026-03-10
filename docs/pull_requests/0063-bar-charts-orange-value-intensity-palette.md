# 0063 — Bar Charts: Orange Value-Intensity Palette

> Standardize all bar charts to one orange palette where higher values render darker orange and lower values render lighter orange.

---

## User Stories

1. As a dashboard viewer, I want all bar charts to use consistent orange shades so chart meaning is visually consistent across screens.
2. As an analyst, I want higher values to appear darker and lower values lighter so I can rank magnitude at a glance without reading every label.
3. As an engineer, I want value-to-color mapping centralized in a shared utility so bar color behavior stays maintainable and type-safe.

## Prior State

- `BreakdownChart` and `ProviderTokenCostBarChart` used categorical palettes indexed by position.
- Governance seat usage passed a custom multi-hue palette override.
- `DistributionChart` used a single static fill color for all bins.
- Bar color did not consistently encode relative value intensity.

## Target State

1. Add a shared orange shade utility for bar charts:
- Input: current value + dataset min/max.
- Output: interpolated orange hex where low values are light orange and high values are dark orange.

2. Apply the utility across all bar chart components:
- `BreakdownChart` horizontal and vertical variants.
- `ProviderTokenCostBarChart`.
- `DistributionChart`.

3. Remove non-orange bar overrides:
- Remove Governance seat-usage custom palette constant and prop override.
- Ensure seat usage bars use the same value-intensity orange scale as all other bars.

4. Keep existing architecture constraints:
- No screen-level business logic changes.
- Shared chart behavior remains inside chart components/utilities.
- TypeScript contracts remain strict, with no `any`.

## Files to Create / Update

### Docs

- `docs/pull_requests/0000-task-manager.md`
- `docs/pull_requests/0063-bar-charts-orange-value-intensity-palette.md`

### Charts

- `src/components/charts/palette.ts`
  - Add shared orange interpolation utility (`getOrangeBarShade`).
- `src/components/charts/BreakdownChart.tsx`
  - Replace positional palette fills with value-intensity orange fills.
- `src/components/charts/ProviderTokenCostBarChart.tsx`
  - Replace categorical fills with value-intensity orange fills.
- `src/components/charts/DistributionChart.tsx`
  - Replace static fill color with value-intensity orange fills.

### Screen Composition

- `src/app/(dashboard)/governance/index.tsx`
  - Remove custom non-orange chart palette override for seat usage chart.

### Tests

- `src/components/charts/__tests__/BreakdownChart.test.tsx`
  - Add assertions for higher-value darker shade mapping in both bar variants.
- `src/components/charts/__tests__/ProviderTokenCostBarChart.test.tsx`
  - Add assertions for higher-value darker shade mapping.
- `src/components/charts/__tests__/DistributionChart.test.tsx` (new)
  - Add coverage for empty state and value-intensity shade mapping.

## Acceptance Criteria

- All bar charts render bars as shades of orange only.
- In every bar chart, larger values map to darker orange than smaller values.
- Governance seat usage chart no longer injects a non-orange custom palette.
- Shared orange shade logic is implemented once and reused across bar chart components.
- Existing chart functionality (sorting, labels, formatting) remains intact.
- TypeScript checks pass with strict typing and no new `any`.

## Test Plan (Write + Run)

1. Component unit tests:
- `src/components/charts/__tests__/BreakdownChart.test.tsx`
- `src/components/charts/__tests__/ProviderTokenCostBarChart.test.tsx`
- `src/components/charts/__tests__/DistributionChart.test.tsx`

2. Run focused checks:
- `npx jest src/components/charts/__tests__/BreakdownChart.test.tsx`
- `npx jest src/components/charts/__tests__/ProviderTokenCostBarChart.test.tsx`
- `npx jest src/components/charts/__tests__/DistributionChart.test.tsx`
- `npx tsc --noEmit`

## Depends On

- **PR 0010** — Data Visualization Components
- **PR 0059** — Costs: Cost per Provider Token Bar
- **PR 0062** — Governance Team Performance + Create Team Relocation
