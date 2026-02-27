# 0013 — Overview Dashboard Screen

> Build the flagship Overview screen: 14 KPI cards across 4 sections, 2 trend charts, a failures donut, a cost bar chart, and a Top Projects table. All data through `useOverviewDashboard` → `analyticsService.getOverview(filters)`.

---

## Prior State

DashboardShell (PR 0012), all UI primitives (PR 0009–0011), chart components (PR 0010), global filters (PR 0008), and DI stack (PR 0007) exist. No screens are implemented.

## Target State

Navigating to `/(dashboard)/dashboard` renders a fully data-driven overview with loading → success states, filter reactivity, and drill-down cross-links.

---

## Files to Create

### `src/features/analytics/hooks/useOverviewDashboard.ts`

```ts
export function useOverviewDashboard() {
  const { analyticsService } = useAppDependencies();
  const queryKeys = useQueryKeyFactory();
  const { filters } = useDashboardFilters();

  const query = useQuery({
    queryKey: queryKeys.overview,
    queryFn: () => analyticsService.getOverview(filters),
    keepPreviousData: true,
  });

  return {
    data: query.data ? mapOverviewToViewModel(query.data) : undefined,
    loading: query.isLoading,
    error: query.error?.message,
    refetch: query.refetch,
  };
}
```

### `src/features/analytics/mappers/overviewMappers.ts`

Maps `OverviewResponse` → `OverviewViewModel`:

```ts
interface OverviewViewModel {
  adoptionKpis: KpiCardProps[];     // 4 cards
  reliabilityKpis: KpiCardProps[];  // 5 cards
  costKpis: KpiCardProps[];         // 4 cards
  governanceKpis: KpiCardProps[];   // 3 cards (reduced from full governance)
  runsTrend: TimeSeriesPoint[];
  successRateTrend: TimeSeriesPoint[];  // derived from runs data
  costByProject: KeyValueMetric[];
  failuresByCategory: KeyValueMetric[];
  topProjects: ProjectTableRow[];
  anomalies: RunAnomaly[];
}
```

All numeric values pre-formatted using `formatCurrency`, `formatPercent`, `formatCompactNumber`, `formatDuration`.

### `src/app/(dashboard)/dashboard.tsx`

Screen layout (top to bottom):

**Header**: Title "Overview Dashboard", subtitle "Organization-level analytics for cloud agent operations", meta "Last updated: {timestamp}".

**Section 1 — Adoption & Throughput**
```
SectionHeader: "Adoption & Throughput"
CardGrid(columns=4):
  KpiCard: "Active Users"    | "1,247"  | +12.3% | "Daily active"
  KpiCard: "Active Agents"   | "342"    | +8.5%  | "In production"
  KpiCard: "Runs / Day"      | "15,623" | +3.2%  | "Total executions"
  KpiCard: "Peak Concurrency"| "89"     | +5.7%  | "Max simultaneous"

ChartCard row (2 charts side by side on desktop):
  ChartCard: "Runs Over Time (24h)"    → TrendChart(variant="area", data=runsTrend)
  ChartCard: "Success Rate Trend"      → TrendChart(variant="line", data=successRateTrend)
```

**Section 2 — Reliability & Quality**
```
CardGrid(columns=5):
  KpiCard: "Success Rate" | "94.2%" | +2.1%
  KpiCard: "Failure Rate" | "5.8%"  | −2.1% | polarity="negative-good"
  KpiCard: "P50 Duration" | "2.3s"  | −8.4% | polarity="negative-good"
  KpiCard: "P95 Duration" | "12.7s" | −5.2% | polarity="negative-good"
  KpiCard: "Retry Rate"   | "3.1%"  | −0.5% | polarity="negative-good"
```

**Section 3 — Cost & Efficiency**
```
CardGrid(columns=4):
  KpiCard: "Total Cost"    | "$47,823" | +15.2% | "Last 7 days"
  KpiCard: "Cost Per Run"  | "$3.06"   | +2.3%  | "Average"
  KpiCard: "Total Tokens"  | "2.8M"    | +18.5% | "In + Out"
  KpiCard: "Cache Hit Rate"| "67.4%"   | +5.2%

ChartCard row:
  ChartCard: "Cost by Project"        → BreakdownChart(data=costByProject)
  ChartCard: "Failures by Category"   → DonutChart(data=failuresByCategory)
```

**Section 4 — Safety & Governance**
```
CardGrid(columns=3):
  KpiCard: "Policy Blocks"  | "147"    | +12.4% | "Last 7 days"
  KpiCard: "Secrets Scans"  | "23"     | +8.7%  | "Detected"
  KpiCard: "Data Egress"    | "847 GB" | +22.1%
```

**Top Projects Table**
```
SectionHeader: "Top Projects by Activity"
ResponsiveTable:
  Columns: Project Name, Runs, Success Rate, Cost, Agents
  5 rows from seed data
  Row press → navigate to project detail (preserving filters)
```

**States**: Loading skeleton per section. Empty state with filter summary. Error with retry.

**Cross-links**: KPI card press navigates to detail screen (e.g., "Total Cost" → `/costs`).

---

## Depends On

- **PR 0007** — DI (`useAppDependencies`).
- **PR 0008** — filters (`useDashboardFilters`, `useQueryKeyFactory`).
- **PR 0009** — KpiCard, SectionHeader, CardGrid, LoadingSkeleton, ErrorState, EmptyState.
- **PR 0010** — TrendChart, BreakdownChart, DonutChart, ChartCard.
- **PR 0011** — ResponsiveTable.
- **PR 0012** — DashboardShell (screen renders inside shell).

## Done When

- 16 KPI cards render across 4 sections with correct values, deltas, and captions.
- Runs Over Time area chart renders with data.
- Success Rate Trend line chart renders.
- Cost by Project bar chart shows 5 categories.
- Failures by Category donut shows 5 segments with percentages.
- Top Projects table shows 5 rows.
- Time range change triggers refetch → KPIs update.
- Loading state shows section-matched skeletons.
- Error state shows retry.
- KPI press navigates to detail screen.
- Responsive: stacks on mobile, grids on desktop.
