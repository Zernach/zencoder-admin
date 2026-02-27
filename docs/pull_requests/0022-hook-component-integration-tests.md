# 0022 — Hook, Component & Integration Tests

> Test all dashboard hooks (React Query state transitions), core components (KpiCard, DataTable, charts), screen rendering (all 7 screens), and cross-screen integration (filter propagation, drill-down). Target: hooks >=90%, UI >=80%.

---

## Prior State

All hooks, components, and screens are implemented (PRs 0007–0019). Unit and contract tests exist (PRs 0020–0021). No hook, component, or integration tests exist.

## Target State

`npm test` passes with hooks >=90% and UI >=80% line coverage. Every screen verifies KPI, chart, and table rendering plus loading/empty/error states.

---

## Files to Create

### Hook Tests (8 files)

**Pattern for every hook** (`src/features/analytics/hooks/__tests__/use*.test.ts`):

```ts
// Wrap in test providers: QueryClientProvider + ReduxProvider + AppDependenciesProvider(overrides: mockApi)
// Use @testing-library/react-native renderHook

describe("useOverviewDashboard", () => {
  it("returns loading: true initially", () => { ... });
  it("returns data after resolution", async () => { ... });
  it("data matches OverviewViewModel shape", async () => { ... });
  it("query key includes filters — changing filters triggers refetch", async () => { ... });
  it("error state provides message and refetch", async () => { ... });
  it("loading → empty when filters return no data", async () => { ... });
});
```

Files:
- `useOverviewDashboard.test.ts`
- `useProjectsDashboard.test.ts`
- `useAgentsDashboard.test.ts`
- `useRunsExplorer.test.ts`
- `useRunDetail.test.ts`
- `useCostDashboard.test.ts`
- `useGovernanceDashboard.test.ts`
- `useDashboardFilters.test.ts`

### Component Tests (3+ files)

**`src/components/dashboard/__tests__/KpiCard.test.tsx`**
```ts
it("renders title and value", () => { ... });
it("positive delta: green arrow-up", () => { ... });
it("negative delta: red arrow-down", () => { ... });
it("negative-good polarity: inverts colors", () => { ... });
it("fires onPress when pressed", () => { ... });
```

**`src/components/charts/__tests__/TrendChart.test.tsx`**
```ts
it("renders SVG elements from TimeSeriesPoint data", () => { ... });
it("handles empty data without crash", () => { ... });
```

**`src/components/tables/__tests__/DataTable.test.tsx`**
```ts
it("renders column headers", () => { ... });
it("renders correct number of rows", () => { ... });
it("sort handler fires with column key", () => { ... });
it("loading state shows skeleton", () => { ... });
it("empty data shows EmptyState", () => { ... });
```

### Screen Tests (8 files)

**Pattern** (`src/app/(dashboard)/__tests__/*.test.tsx`):

Each screen wrapped in full provider stack with mock API. Assertions:

```ts
describe("Overview Dashboard Screen", () => {
  it("renders Adoption & Throughput section with 4 KPI cards", () => { ... });
  it("renders Reliability section with 5 KPI cards", () => { ... });
  it("renders Cost section with 4 KPI cards", () => { ... });
  it("renders Governance section with 3 KPI cards", () => { ... });
  it("renders Runs Over Time chart", () => { ... });
  it("renders Top Projects table with 5 rows", () => { ... });
  it("shows loading skeleton before data arrives", () => { ... });
  it("shows error state with retry on API failure", () => { ... });
  it("shows empty state when filters match nothing", () => { ... });
});
```

Files: `dashboard.test.tsx`, `projects.test.tsx`, `agents.test.tsx`, `runs.test.tsx`, `costs.test.tsx`, `governance.test.tsx`, `settings.test.tsx`, `runs/runDetail.test.tsx`.

### Integration Tests (2 files)

**`src/__tests__/integration/filterPropagation.test.tsx`**
```ts
it("changing time range refetches all active hooks", () => { ... });
it("provider filter updates codex/claude percentages AND runs table", () => { ... });
it("team filter updates cost, reliability, and governance consistently", () => { ... });
```

**`src/__tests__/integration/drillDown.test.tsx`**
```ts
it("overview anomaly click opens matching run detail", () => { ... });
it("runs explorer row click opens runs/[runId]", () => { ... });
it("back navigation preserves runs explorer page/sort state", () => { ... });
```

---

## Depends On

- **PR 0007** — DI (test providers). **PR 0008** — filters. **PR 0009–0012** — components. **PR 0013–0019** — screens.

## Done When

- All 8 hooks tested for `{ data, loading, error, refetch }` shape.
- Filter change → query key change verified.
- KpiCard delta color logic tested.
- DataTable sort/pagination tested.
- All 8 screens tested for KPI/chart/table rendering + loading/empty/error.
- Filter propagation integration test passes.
- Drill-down integration test passes.
- `npm test -- --coverage`: hooks >=90%, UI >=80%.
