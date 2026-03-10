# 0074 — Agents Screen: Replace KPI Cards with Time-Series Line Charts

> Convert the four scalar KPI cards (P50 Duration, P95 Duration, P95 Queue Time, Peak Concurrency) on the Agents screen into LineChart components that display each metric over time, and generate realistic stubbed time-series data for each.

---

## User Stories

1. As an engineering manager, I want to see P50 and P95 run duration trends over time so I can identify whether agent performance is improving or degrading across days.
2. As a platform engineer, I want to visualize P95 queue wait time over time so I can detect queueing bottlenecks before they impact developer experience.
3. As a team lead, I want to see peak concurrency over time so I can understand usage patterns and plan capacity accordingly.
4. As a developer, I want the trend data to follow the same `TimeSeriesPoint[]` contract used by the existing reliability trend chart so the data layer stays consistent.

## Prior State

- The Agents screen reliability section renders **four `KpiCard` components** showing single scalar values: `p50RunDurationMs`, `p95RunDurationMs`, `p95QueueWaitMs`, and `peakConcurrency`.
- `AgentsHubResponse` in `src/features/analytics/types/contracts.ts` stores these as scalar `number` fields.
- The stub API (`StubAnalyticsApi.getAgentsHub`) computes these scalars from filtered runs but does not generate any time-series data for them.
- The `LineChart` component and `ChartCard` wrapper already exist and support rendering `TimeSeriesPoint[]` data.

## Target State

1. **New type fields** on `AgentsHubResponse` (`src/features/analytics/types/contracts.ts`):
   - `p50DurationTrend: TimeSeriesPoint[]` — daily P50 run duration in ms over the selected time range.
   - `p95DurationTrend: TimeSeriesPoint[]` — daily P95 run duration in ms over the selected time range.
   - `p95QueueWaitTrend: TimeSeriesPoint[]` — daily P95 queue wait in ms over the selected time range.
   - `peakConcurrencyTrend: TimeSeriesPoint[]` — daily peak concurrent runs over the selected time range.
   - The existing scalar fields (`p50RunDurationMs`, `p95RunDurationMs`, `p95QueueWaitMs`, `peakConcurrency`) remain as-is for the subtitle and any other consumers.

2. **Stub data generation** (`src/features/analytics/api/stub/StubAnalyticsApi.ts`):
   - For each of the four new trend fields, use the existing `bucketByDay` helper (or a new private method following the same pattern as `reliabilityTrendFromRuns`) to aggregate runs by day:
     - `p50DurationTrend`: For each day's runs, compute the P50 (median) of `durationMs`.
     - `p95DurationTrend`: For each day's runs, compute the P95 of `durationMs`.
     - `p95QueueWaitTrend`: For each day's runs, compute the P95 of `queueWaitMs`.
     - `peakConcurrencyTrend`: For each day's runs, compute the max count of overlapping runs (or use a synthetic mathematical curve similar to `reliabilityTrendFromRuns` for realistic variation).
   - Apply the same mathematical variation pattern (baseline + sine oscillation + dip/spike + jitter) to produce visually interesting, realistic trend lines.

3. **Agents screen update** (`src/app/(dashboard)/agents/index.tsx`):
   - Replace the two `CardGrid` blocks containing the four `KpiCard` components with four `ChartCard` + `LineChart` pairs, arranged in a 2×2 grid layout (or horizontally scrollable on mobile).
   - Each chart:
     - `P50 Duration Over Time` — renders `data.p50DurationTrend`, variant `"line"`.
     - `P95 Duration Over Time` — renders `data.p95DurationTrend`, variant `"line"`.
     - `P95 Queue Time Over Time` — renders `data.p95QueueWaitTrend`, variant `"line"`.
     - `Peak Concurrency Over Time` — renders `data.peakConcurrencyTrend`, variant `"line"`.
   - Use `xTickCount={4}` for readability (consistent with existing reliability trend chart).
   - Preserve the existing reliability trend chart and failure categories breakdown chart below (unchanged).

4. **i18n keys** (`src/i18n/locales/en.json`):
   - Add translation keys for each chart title: `agents.p50DurationTrend`, `agents.p95DurationTrend`, `agents.p95QueueWaitTrend`, `agents.peakConcurrencyTrend`.

## Files to Create / Update

### New Files

- `docs/pull_requests/0074-agents-kpi-to-line-charts-time-series.md` — This spec

### Updated Files

- `src/features/analytics/types/contracts.ts` — Add 4 `TimeSeriesPoint[]` fields to `AgentsHubResponse`
- `src/features/analytics/api/stub/StubAnalyticsApi.ts` — Generate time-series data for the 4 new trend fields in `getAgentsHub`
- `src/app/(dashboard)/agents/index.tsx` — Replace 4 KpiCards with 4 ChartCard/LineChart pairs in a 2×2 layout
- `src/i18n/locales/en.json` — Add 4 new chart title translation keys
- `src/app/(dashboard)/__tests__/agentsScreen.test.tsx` — Update test fixture, add assertions for new charts
- `docs/pull_requests/0000-task-manager.md` — Add row for PR 0074

## Acceptance Criteria

- The four KpiCards (P50 Duration, P95 Duration, P95 Queue Wait, Peak Concurrency) are no longer rendered as scalar cards in the reliability section.
- Four LineChart components are rendered in the reliability section, each inside a ChartCard with a translated title.
- Each LineChart receives a `TimeSeriesPoint[]` array from the hook data with daily granularity.
- The stub API generates realistic time-series data for all four trends (at least 7 data points for a 7-day range, ~30 for a 30-day range, etc.).
- The existing scalar fields (`p50RunDurationMs`, `p95RunDurationMs`, etc.) remain in the response and are still used in the subtitle.
- The reliability trend chart and failure categories breakdown chart remain unchanged.
- Charts display in a 2×2 grid on desktop/tablet and scroll horizontally on mobile (consistent with existing chart layout pattern).
- All four i18n keys are defined in `en.json`.
- `npx tsc --noEmit` passes with no type errors.
- All existing tests pass; new/updated tests cover the chart rendering.

## Test Plan (Write + Run)

1. **Update `src/app/(dashboard)/__tests__/agentsScreen.test.tsx`**:
   - Update `createAgentsHubData()` fixture to include the four new `TimeSeriesPoint[]` fields (`p50DurationTrend`, `p95DurationTrend`, `p95QueueWaitTrend`, `peakConcurrencyTrend`) each with 2+ data points.
   - Add test: **"renders four performance trend line charts in reliability section"** — verify that the four chart titles (P50 Duration, P95 Duration, P95 Queue Wait, Peak Concurrency) are rendered as text nodes (via the mocked `ChartCard` title prop).
   - Add test: **"does not render KpiCards for duration/queue/concurrency metrics"** — verify the old KpiCard scalar text (e.g. `"P50 Duration: 1.2s"`) is no longer present.
   - Add test: **"still renders reliability trend and failure categories charts"** — ensure existing charts are not removed.
   - Ensure existing tests (navigation, section IDs, truncateLabels) still pass without modification.

2. **Stub data integration validation**:
   - Manually verify (or add a lightweight integration test) that `StubAnalyticsApi.getAgentsHub()` returns non-empty arrays for `p50DurationTrend`, `p95DurationTrend`, `p95QueueWaitTrend`, and `peakConcurrencyTrend`.
   - Each array should have length equal to the number of distinct days in the time range.
   - Values should be positive numbers (durations in ms, concurrency as integer).

3. **Type checking**:
   - `npx tsc --noEmit` passes.

4. **Run validation**:
   - `npx jest src/app/(dashboard)/__tests__/agentsScreen.test.tsx`
   - `npx tsc --noEmit`

## Depends On

- **PR 0015** — Agents Screen (base screen implementation)
- **PR 0066** — Chart Primitives DRY Refactor (LineChart, ChartCard components)
- **PR 0069** — i18n App-Wide String Extraction (translation infrastructure)
