# 0008 — Global Dashboard Filter State

> Implement the global filter system: a Redux Toolkit slice for `AnalyticsFilters`, the `useDashboardFilters` hook, and a query-key factory so React Query auto-refetches when filters change.

---

## Prior State

Redux store exists (PR 0007) with an empty reducer. No filter state, no mechanism for screens to share or react to filter changes.

## Target State

Changing any filter (time range, team, provider, etc.) via `useDashboardFilters().setTimeRange("7d")` immediately updates Redux state, which changes React Query keys, which triggers automatic refetch in every active screen hook.

---

## Files to Create

### `src/store/slices/filtersSlice.ts`

```ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AnalyticsFilters, TimeRange, TimeRangePreset, ModelProvider, RunStatus } from "@/features/analytics/types";

interface FiltersState extends AnalyticsFilters {
  preset: TimeRangePreset;
}

function computeTimeRange(preset: TimeRangePreset): TimeRange {
  const now = new Date();
  const to = now.toISOString();
  const from = new Date(now);
  switch (preset) {
    case "24h": from.setHours(from.getHours() - 24); break;
    case "7d":  from.setDate(from.getDate() - 7); break;
    case "30d": from.setDate(from.getDate() - 30); break;
    case "90d": from.setDate(from.getDate() - 90); break;
    default: break;
  }
  return { fromIso: from.toISOString(), toIso: to };
}

const initialState: FiltersState = {
  orgId: "org_zencoder_001",
  preset: "30d",
  timeRange: computeTimeRange("30d"),
  teamIds: undefined,
  userIds: undefined,
  projectIds: undefined,
  providers: undefined,
  modelIds: undefined,
  environments: undefined,
  statuses: undefined,
};

export const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setTimeRangePreset(state, action: PayloadAction<TimeRangePreset>) { ... },
    setCustomTimeRange(state, action: PayloadAction<TimeRange>) { ... },
    setTeamFilter(state, action: PayloadAction<string[] | undefined>) { ... },
    setUserFilter(state, action: PayloadAction<string[] | undefined>) { ... },
    setProjectFilter(state, action: PayloadAction<string[] | undefined>) { ... },
    setProviderFilter(state, action: PayloadAction<ModelProvider[] | undefined>) { ... },
    setModelFilter(state, action: PayloadAction<string[] | undefined>) { ... },
    setStatusFilter(state, action: PayloadAction<RunStatus[] | undefined>) { ... },
    clearAllFilters(state) { return { ...initialState }; },
  },
});

// Selector — strips `preset` and returns pure AnalyticsFilters
export const selectActiveFilters = (state: { filters: FiltersState }): AnalyticsFilters => { ... };
export const selectPreset = (state: { filters: FiltersState }): TimeRangePreset => state.filters.preset;
```

### `src/store/slices/index.ts`

```ts
export { filtersSlice, selectActiveFilters, selectPreset } from "./filtersSlice";
```

### `src/store/store.ts` (modify)

Add `filters: filtersSlice.reducer` to the reducer map.

### `src/features/analytics/hooks/useDashboardFilters.ts`

```ts
export function useDashboardFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectActiveFilters);
  const preset = useAppSelector(selectPreset);

  return {
    filters,
    preset,
    setTimeRange: (p: TimeRangePreset) => dispatch(filtersSlice.actions.setTimeRangePreset(p)),
    setCustomTimeRange: (r: TimeRange) => dispatch(filtersSlice.actions.setCustomTimeRange(r)),
    setTeamFilter: (ids?: string[]) => dispatch(filtersSlice.actions.setTeamFilter(ids)),
    setUserFilter: (ids?: string[]) => dispatch(filtersSlice.actions.setUserFilter(ids)),
    setProjectFilter: (ids?: string[]) => dispatch(filtersSlice.actions.setProjectFilter(ids)),
    setProviderFilter: (p?: ModelProvider[]) => dispatch(filtersSlice.actions.setProviderFilter(p)),
    setStatusFilter: (s?: RunStatus[]) => dispatch(filtersSlice.actions.setStatusFilter(s)),
    clearAll: () => dispatch(filtersSlice.actions.clearAllFilters()),
    activeFilterCount: countActiveFilters(filters),
  };
}

function countActiveFilters(f: AnalyticsFilters): number {
  let count = 0;
  if (f.teamIds?.length) count++;
  if (f.userIds?.length) count++;
  if (f.projectIds?.length) count++;
  if (f.providers?.length) count++;
  if (f.modelIds?.length) count++;
  if (f.statuses?.length) count++;
  return count;
}
```

### `src/features/analytics/hooks/useQueryKeyFactory.ts`

```ts
export function useQueryKeyFactory() {
  const { filters } = useDashboardFilters();

  return {
    overview: ["analytics", "overview", filters] as const,
    usage:    ["analytics", "usage", filters] as const,
    outcomes: ["analytics", "outcomes", filters] as const,
    cost:     ["analytics", "cost", filters] as const,
    reliability: ["analytics", "reliability", filters] as const,
    governance:  ["analytics", "governance", filters] as const,
    runsPage: (page: number, pageSize: number, sortBy: string, sortDir: string) =>
      ["analytics", "runs", filters, page, pageSize, sortBy, sortDir] as const,
    runDetail: (runId: string) => ["analytics", "run", runId] as const,
  };
}
```

---

## Depends On

- **PR 0003** — `AnalyticsFilters`, `TimeRange`, `TimeRangePreset`, `ModelProvider`, `RunStatus`.
- **PR 0007** — Redux store, `useAppSelector`, `useAppDispatch`.

## Done When

- `useDashboardFilters()` returns current state + all setters.
- `setTimeRange("7d")` changes `filters.timeRange` immediately.
- `clearAll()` resets to 30d default with no team/user/project filters.
- `activeFilterCount` returns `2` when teamIds and providers are set.
- `useQueryKeyFactory().overview` produces different keys for different filter states.
- Filter state persists across screen navigation (Redux in memory).
- `npx tsc --noEmit` passes.
