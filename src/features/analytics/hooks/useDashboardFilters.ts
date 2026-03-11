import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  filtersSlice,
  selectActiveFilters,
  selectOrgId,
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

interface DashboardFilterActions {
  setTimeRange: (preset: TimeRangePreset) => void;
  setCustomTimeRange: (range: TimeRange) => void;
  setTeamFilter: (ids?: string[]) => void;
  setUserFilter: (ids?: string[]) => void;
  setProjectFilter: (ids?: string[]) => void;
  setProviderFilter: (providers?: ModelProvider[]) => void;
  setStatusFilter: (statuses?: RunStatus[]) => void;
  setSearchQuery: (query: string) => void;
  clearAll: () => void;
}

export function useActiveDashboardFilters(): AnalyticsFilters {
  return useAppSelector(selectActiveFilters);
}

export function useDashboardPreset(): TimeRangePreset {
  return useAppSelector(selectPreset);
}

export function useDashboardSearchQuery(): string {
  return useAppSelector(selectSearchQuery);
}

export function useDashboardOrgId(): string {
  return useAppSelector(selectOrgId);
}

export function useDashboardFilterActions(): DashboardFilterActions {
  const dispatch = useAppDispatch();

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

  return useMemo(
    () => ({
      setTimeRange,
      setCustomTimeRange,
      setTeamFilter,
      setUserFilter,
      setProjectFilter,
      setProviderFilter,
      setStatusFilter,
      setSearchQuery,
      clearAll,
    }),
    [
      setTimeRange,
      setCustomTimeRange,
      setTeamFilter,
      setUserFilter,
      setProjectFilter,
      setProviderFilter,
      setStatusFilter,
      setSearchQuery,
      clearAll,
    ],
  );
}

export function useDashboardFilters() {
  const filters = useActiveDashboardFilters();
  const preset = useDashboardPreset();
  const searchQuery = useDashboardSearchQuery();
  const actions = useDashboardFilterActions();
  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  return useMemo(
    () => ({
      filters,
      preset,
      searchQuery,
      ...actions,
      activeFilterCount,
    }),
    [actions, activeFilterCount, filters, preset, searchQuery],
  );
}
