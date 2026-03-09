import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  filtersSlice,
  selectActiveFilters,
  selectPreset,
  selectSearchQuery,
} from "@/store/slices/filtersSlice";
import type {
  AnalyticsFilters,
  TimeRange,
  TimeRangePreset,
  ModelProvider,
  RunStatus,
} from "@/features/analytics/types";

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

export function useDashboardFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectActiveFilters);
  const preset = useAppSelector(selectPreset);
  const searchQuery = useAppSelector(selectSearchQuery);

  const setTimeRange = useCallback(
    (p: TimeRangePreset) => dispatch(filtersSlice.actions.setTimeRangePreset(p)),
    [dispatch],
  );
  const setCustomTimeRange = useCallback(
    (r: TimeRange) => dispatch(filtersSlice.actions.setCustomTimeRange(r)),
    [dispatch],
  );
  const setTeamFilter = useCallback(
    (ids?: string[]) => dispatch(filtersSlice.actions.setTeamFilter(ids)),
    [dispatch],
  );
  const setUserFilter = useCallback(
    (ids?: string[]) => dispatch(filtersSlice.actions.setUserFilter(ids)),
    [dispatch],
  );
  const setProjectFilter = useCallback(
    (ids?: string[]) => dispatch(filtersSlice.actions.setProjectFilter(ids)),
    [dispatch],
  );
  const setProviderFilter = useCallback(
    (p?: ModelProvider[]) => dispatch(filtersSlice.actions.setProviderFilter(p)),
    [dispatch],
  );
  const setStatusFilter = useCallback(
    (s?: RunStatus[]) => dispatch(filtersSlice.actions.setStatusFilter(s)),
    [dispatch],
  );
  const setSearchQuery = useCallback(
    (q: string) => dispatch(filtersSlice.actions.setSearchQuery(q)),
    [dispatch],
  );
  const clearAll = useCallback(
    () => dispatch(filtersSlice.actions.clearAllFilters()),
    [dispatch],
  );

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  return useMemo(
    () => ({
      filters,
      preset,
      searchQuery,
      setTimeRange,
      setCustomTimeRange,
      setTeamFilter,
      setUserFilter,
      setProjectFilter,
      setProviderFilter,
      setStatusFilter,
      setSearchQuery,
      clearAll,
      activeFilterCount,
    }),
    [
      filters,
      preset,
      searchQuery,
      setTimeRange,
      setCustomTimeRange,
      setTeamFilter,
      setUserFilter,
      setProjectFilter,
      setProviderFilter,
      setStatusFilter,
      setSearchQuery,
      clearAll,
      activeFilterCount,
    ],
  );
}
