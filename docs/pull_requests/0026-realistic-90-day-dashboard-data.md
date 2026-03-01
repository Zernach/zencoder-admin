# PR 0026 — Realistic 90-Day Dashboard Data & Interactive Filters

## Summary

Make the Zencoder Admin Dashboard feel like a real production analytics tool by fixing the seed data timeline, adding interactive filter controls, enhancing data realism, and improving data context across all screens.

## Changes

### 1. Dynamic Seed Data Date Range
- Changed `REFERENCE_DATE` from hardcoded `2025-02-27` to `new Date()` so data always covers the most recent 90 days
- Filters now match the seed data timeline (previously the 30d default returned zero results)

### 2. Growth Trend in Seed Data
- Added ~20% growth factor across the 90-day period (older days have fewer runs)
- Creates realistic "growing organization" pattern in trend charts

### 3. FilterBar Component (`src/components/filters/FilterBar.tsx`)
- Time range preset buttons (24h, 7d, 30d, 90d) with active state
- Dropdown filters for Team, Project, Provider, Status with multi-select
- Active filter chips with individual remove and "Clear All"
- Modal-based dropdown panels with checkbox selection
- Integrated with Redux filter state via `useDashboardFilters` hook

### 4. FilterBar Added to All Dashboard Screens
- Overview Dashboard, Projects, Agents, Runs Explorer, Cost Analytics, Governance
- Changing filters triggers automatic data refresh via React Query key invalidation

### 5. Seed Data Exposed via DI Context
- `AppDependenciesProvider` now exposes `seedData` alongside `analyticsApi` and `analyticsService`
- FilterBar and screen components can resolve entity IDs to human-readable names

### 6. Runs Explorer Enhancements
- Added Project and Team name columns (resolved from seed data)
- Dynamic subtitle showing total runs found
- Run ID displayed in brand color for visual hierarchy

### 7. Run Detail Enhancements
- Context section showing Project, Agent, Team, and User names
- Token breakdown (input/output) in the Tokens KPI caption
- Timeline with visual connector lines and status-colored final dot
- Policy context with styled badges and color-coded blocked actions

### 8. Real Delta Calculations
- Added `OverviewDeltas` type to contracts
- `StubAnalyticsApi.getOverview()` computes previous-period comparison for real percentage changes
- Overview mapper now uses computed deltas instead of hardcoded values

### 9. Data Context in Screen Subtitles
- Overview: "X runs across Y days (preset)"
- Costs: "$X spent across Y projects"
- Agents: "X% success rate, P50 Ys"
- Projects: "$X total, Y active projects"
- Governance: "X violations, Y security events"
- Runs: "X runs found"

### 10. Governance Data Sorting
- Violations, security events, and policy changes sorted by timestamp descending (most recent first)

### 11. Reduced API Latency
- Lowered simulated latency from 250-900ms to 80-300ms for snappier UX

## Files Changed

| File | Change |
|------|--------|
| `src/features/analytics/fixtures/seedData.ts` | Dynamic date, growth factor |
| `src/features/analytics/api/stub/StubAnalyticsApi.ts` | Delta computation, sorting, imports |
| `src/features/analytics/types/contracts.ts` | `OverviewDeltas` type, updated `OverviewResponse` |
| `src/features/analytics/mappers/overviewMappers.ts` | Real deltas from response |
| `src/core/di/AppDependencies.tsx` | Expose seedData, reduced latency config |
| `src/components/filters/FilterBar.tsx` | **New** — interactive filter bar |
| `src/components/filters/index.ts` | **New** — barrel export |
| `src/app/(dashboard)/dashboard.tsx` | FilterBar, dynamic subtitle |
| `src/app/(dashboard)/costs.tsx` | FilterBar, dynamic subtitle |
| `src/app/(dashboard)/agents.tsx` | FilterBar, dynamic subtitle |
| `src/app/(dashboard)/projects.tsx` | FilterBar, dynamic subtitle |
| `src/app/(dashboard)/governance.tsx` | FilterBar, dynamic subtitle |
| `src/app/(dashboard)/runs/index.tsx` | FilterBar, name columns, dynamic subtitle |
| `src/app/(dashboard)/runs/[runId].tsx` | Entity names, enhanced timeline, policy badges |
| `src/features/analytics/services/__tests__/AnalyticsService.test.ts` | Updated mock with deltas |
