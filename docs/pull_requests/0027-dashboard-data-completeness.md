# PR 0027 — Dashboard Data Completeness & Screen Enhancements

## Summary

Make every dashboard screen feel like a production-grade analytics tool by surfacing unused API data, replacing hardcoded values with computed ones, adding missing data tables, and ensuring each screen has unique, meaningful content.

## Changes

### 1. Overview Screen — Usage & Outcomes Integration
- Add **Usage section**: WAU, MAU, Seat Adoption KPIs + Active Users trend chart
- Add **Outcomes section**: PRs Created, PRs Merged, Test Pass Rate KPIs + PR Merge trend chart
- Creates a true "executive summary" that surfaces data from `getUsage()` and `getOutcomes()` (previously uncalled)

### 2. Agents Screen — Per-Agent Breakdown & Real Deltas
- Remove hardcoded `delta={2.1}` and `delta={-1.5}` — compute real deltas from previous period
- Add **Agent Performance Table**: sortable table showing per-agent name, project, success rate, runs, avg duration, total cost
- Add P95 Queue Wait and Peak Concurrency KPIs
- Create `getAgentBreakdown()` helper in StubAnalyticsApi

### 3. Projects Screen — Dedicated Project Metrics
- Replace reused `useCostDashboard` with new `useProjectsDashboard` that calls a dedicated API
- Add **Projects Table**: name, team, total runs, success rate, total cost, avg cost per run
- Add project-level success rate and run volume charts
- New `getProjects()` method on StubAnalyticsApi

### 4. Governance Screen — Policy Changes Table
- Render the `policyChanges` data (API already returns it but screen ignores it)
- Resolve `actorUserId` to human-readable names via seed data
- Add column definitions and DataTable for policy change audit trail

### 5. Cost Analytics — Provider Cost Breakdown
- Add **Cost by Provider** donut chart (Codex vs Claude vs Other)
- Compute per-provider cost totals in StubAnalyticsApi
- New `providerBreakdown` field on CostResponse

### 6. Run Detail — Dynamic Policy Context
- Vary `blockedActions`, `allowedActions`, and `networkMode` per run based on agent/project
- Some agents get `full` network, some get `none`
- More diverse blocked/allowed action sets

## Files Changed

| File | Change |
|------|--------|
| `src/features/analytics/api/stub/StubAnalyticsApi.ts` | Agent breakdown, projects endpoint, provider cost breakdown, dynamic policy context |
| `src/features/analytics/types/contracts.ts` | New response types: `ProjectsResponse`, `AgentBreakdownRow`, `ProviderCostRow` |
| `src/features/analytics/api/IAnalyticsApi.ts` | New method signatures |
| `src/features/analytics/services/IAnalyticsService.ts` | New method signatures |
| `src/features/analytics/services/AnalyticsService.ts` | New method implementations |
| `src/features/analytics/hooks/useOverviewDashboard.ts` | Fetch usage + outcomes in parallel |
| `src/features/analytics/hooks/useAgentsDashboard.ts` | Fetch reliability + agent breakdown |
| `src/features/analytics/hooks/useProjectsDashboard.ts` | New dedicated hook using getProjects |
| `src/features/analytics/mappers/overviewMappers.ts` | Extended OverviewViewModel with usage & outcomes data |
| `src/app/(dashboard)/dashboard.tsx` | Usage & Outcomes sections |
| `src/app/(dashboard)/agents.tsx` | Agent table, real deltas, extra KPIs |
| `src/app/(dashboard)/projects.tsx` | Projects table, dedicated project metrics |
| `src/app/(dashboard)/governance.tsx` | Policy changes table |
| `src/app/(dashboard)/costs.tsx` | Provider cost donut chart |
| `src/app/(dashboard)/runs/[runId].tsx` | Dynamic policy context |
