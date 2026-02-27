# 0014 — Projects Screen

> Build the Projects screen: 3 KPI cards, 2 charts (run volume bar, success distribution line), and a sortable projects table with drill-down to project-scoped runs.

---

## Prior State

DashboardShell and all component primitives exist. Overview screen (PR 0013) demonstrates the hook → mapper → screen pattern.

## Target State

`/(dashboard)/projects` renders a project comparison view. Row press navigates to runs explorer pre-filtered by project.

---

## Files to Create

### `src/features/analytics/hooks/useProjectsDashboard.ts`

```ts
export function useProjectsDashboard() {
  const { analyticsService } = useAppDependencies();
  const { filters } = useDashboardFilters();
  const queryKeys = useQueryKeyFactory();

  // Aggregates project-level metrics from overview + cost + usage data
  // Returns { data: ProjectsViewModel, loading, error, refetch }
}
```

### `src/features/analytics/mappers/projectsMappers.ts`

```ts
interface ProjectsViewModel {
  kpis: KpiCardProps[];           // Total Projects, Total Runs, Total Agents
  runVolumeByProject: KeyValueMetric[];
  successRateByProject: TimeSeriesPoint[] | KeyValueMetric[];
  projectTable: ProjectTableRow[];
}

interface ProjectTableRow {
  id: string;
  name: string;
  totalRuns: number;
  successRate: number;
  totalCost: number;
  agentCount: number;
}
```

### `src/app/(dashboard)/projects.tsx`

Layout:

```
Header: "Projects" / "All active projects in your organization"
Search + Time selector + Filters button

CardGrid(columns=3):
  KpiCard: "Total Projects" | "5"
  KpiCard: "Total Runs"     | "16,457"
  KpiCard: "Total Agents"   | "36"

ChartCard row:
  "Projects by Run Volume"      → BreakdownChart(variant="bar")
  "Success Rate Distribution"   → TrendChart or BreakdownChart

SectionHeader: "All Projects"
ResponsiveTable:
  Columns: Project Name | Total Runs | Success Rate | Total Cost | Agents | Actions
  5 rows:
    Customer Support AI    | 5,847  | 96.2% | $18,234 | 12
    Data Pipeline Automation| 4,293 | 91.5% | $12,847 | 8
    Code Review Assistant  | 2,847  | 98.1% | $9,234  | 5
    Sales Intelligence     | 1,923  | 89.7% | $5,123  | 7
    Content Generator      | 1,547  | 93.4% | $3,847  | 4
  Actions: "View" button
  Row press → router.push(`/(dashboard)/runs?projectId=${row.id}`)
```

**Responsive**: Charts above table on web; KPI → chart → list on mobile.

---

## Depends On

- **PR 0008** — filters. **PR 0009** — KpiCard, CardGrid. **PR 0010** — charts. **PR 0011** — ResponsiveTable. **PR 0012** — DashboardShell.

## Done When

- 3 KPI cards render.
- Run volume bar chart ranks projects.
- Table shows 5 rows with all columns.
- Table is sortable by runs, success rate, cost.
- Row press navigates to runs with project filter.
- Filter changes trigger refetch.
- Loading/empty/error states work.
