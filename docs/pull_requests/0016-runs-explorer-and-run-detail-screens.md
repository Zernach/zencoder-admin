# 0016 — Runs Explorer & Run Detail Screens

> Build the Runs Explorer (paginated, sortable, filterable table of all runs) and Run Detail (`/runs/[runId]`) with lifecycle timeline, artifact summary, token/cost breakdown, and policy context. These are the deepest drill-down in the dashboard.

---

## Prior State

All UI primitives, charts, tables, shell, and previous screens exist. `StubAnalyticsApi.getRunsPage` and `getRunDetail` are implemented (PR 0005).

## Target State

`/(dashboard)/runs` shows a paginated run table with filter chips. Clicking a row opens `/(dashboard)/runs/[runId]` with full run forensics. Back navigation preserves explorer state.

---

## Files to Create

### `src/features/analytics/hooks/useRunsExplorer.ts`

```ts
export function useRunsExplorer() {
  const { analyticsService } = useAppDependencies();
  const { filters } = useDashboardFilters();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<"startedAtIso" | "costUsd" | "durationMs" | "totalTokens">("startedAtIso");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const query = useQuery({
    queryKey: ["analytics", "runs", filters, page, pageSize, sortBy, sortDirection],
    queryFn: () => analyticsService.getRunsPage({ filters, page, pageSize, sortBy, sortDirection }),
    keepPreviousData: true,  // keeps old data visible during page change
  });

  return {
    data: query.data, loading: query.isLoading, error: query.error?.message,
    refetch: query.refetch,
    page, setPage, pageSize, setPageSize,
    sortBy, setSortBy, sortDirection, setSortDirection,
  };
}
```

### `src/features/analytics/hooks/useRunDetail.ts`

```ts
export function useRunDetail(runId: string) {
  const { analyticsService } = useAppDependencies();
  const { filters } = useDashboardFilters();

  const query = useQuery({
    queryKey: ["analytics", "run", runId],
    queryFn: () => analyticsService.getRunDetail(filters.orgId, runId),
  });

  return {
    data: query.data ? mapRunDetailToViewModel(query.data) : undefined,
    loading: query.isLoading,
    error: query.error?.message,
    refetch: query.refetch,
  };
}
```

### `src/features/analytics/mappers/runDetailMappers.ts`

```ts
interface RunDetailViewModel {
  header: { runId: string; status: RunStatus; agentName: string; projectName: string; };
  timeline: { step: string; timestamp: string; detail: string; isCurrent: boolean; }[];
  artifacts: { linesAdded: number; linesRemoved: number; prStatus: string; testsLabel: string; };
  tokenBreakdown: { input: number; output: number; total: number; cost: string; provider: string; model: string; };
  policyContext: { allowed: string[]; blocked: string[]; networkMode: string; };
}
```

### `src/app/(dashboard)/runs/index.tsx`

```
Header: "Runs" / "Real-time view of all agent executions"
Search + Filters

CardGrid(columns=4):
  KpiCard: "Total Runs"    | computed from data.total
  KpiCard: "Successful"    | count succeeded
  KpiCard: "Failed"        | count failed
  KpiCard: "Avg Duration"  | mean durationMs

ChartCard row:
  "Runs Over Time (24h)"      → TrendChart(variant="area")
  "Duration Distribution"     → DistributionChart(data=durations)

FilterChips: reflect active global filters, each dismissable

SectionHeader: "Recent Runs"
ResponsiveTable:
  Columns: Run ID | Agent | Project | Status | Duration | Cost | Time
  Sort: by time (default desc), cost, duration, tokens
  Pagination: PaginationControls(page, pageSize, total)
  Cell renderers: StatusBadge for status, formatDuration, formatCurrency, time format
  Row press → router.push(`/(dashboard)/runs/${row.id}`)

  8 seed rows from design content doc
```

### `src/app/(dashboard)/runs/[runId].tsx`

```
Header: Run ID badge + StatusBadge + agent name + project name
Back button → router.back() (preserves explorer state)

Section: "Lifecycle Timeline"
  Visual step progression (vertical on mobile, horizontal on desktop):
    queued → started → tools → tests → artifact → completed
  Each step: icon + label + timestamp + detail text
  Failed runs: visual stop at failure point (muted remaining steps)

Section: "Artifacts"
  Card with:
    Lines: "+{added} / −{removed}"
    PR: "Created" / "Created & Merged" / "None"
    Tests: "{passed}/{executed} passed"

Section: "Token & Cost Breakdown"
  Card with:
    Input Tokens: formatted number
    Output Tokens: formatted number
    Total Tokens: formatted number
    Cost: formatted currency
    Provider: codex/claude/other badge
    Model: model ID string

Section: "Policy Context"
  Card with:
    Allowed Actions: tag list
    Blocked Actions: tag list (red tinted)
    Network Mode: badge (none/limited/full)
```

---

## Depends On

- **PR 0005** — `getRunsPage`, `getRunDetail`. **PR 0008** — filters.
- **PR 0009–0011** — all UI primitives + tables. **PR 0012** — shell.

## Done When

- Runs table renders with all columns and 8+ seed rows.
- StatusBadge correctly shows Success/Failed per row.
- Sorting by time, cost, duration, tokens works in both directions.
- Pagination controls work — changing page updates rows.
- Filter chips reflect active filters with dismiss.
- Row press navigates to `/runs/[runId]`.
- Run detail shows lifecycle timeline with step progression.
- Failed run timeline shows muted remaining steps.
- Artifact summary, token breakdown, and policy context render.
- Back navigation preserves runs explorer page/sort state.
- `keepPreviousData` keeps old table visible during refetch.
- Loading/empty/error states on both screens.
