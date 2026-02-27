import { useAppDispatch, useAppSelector } from "@/store";
import {
  filtersSlice,
  selectActiveFilters,
  selectPreset,
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

  return {
    filters,
    preset,
    setTimeRange: (p: TimeRangePreset) =>
      dispatch(filtersSlice.actions.setTimeRangePreset(p)),
    setCustomTimeRange: (r: TimeRange) =>
      dispatch(filtersSlice.actions.setCustomTimeRange(r)),
    setTeamFilter: (ids?: string[]) =>
      dispatch(filtersSlice.actions.setTeamFilter(ids)),
    setUserFilter: (ids?: string[]) =>
      dispatch(filtersSlice.actions.setUserFilter(ids)),
    setProjectFilter: (ids?: string[]) =>
      dispatch(filtersSlice.actions.setProjectFilter(ids)),
    setProviderFilter: (p?: ModelProvider[]) =>
      dispatch(filtersSlice.actions.setProviderFilter(p)),
    setStatusFilter: (s?: RunStatus[]) =>
      dispatch(filtersSlice.actions.setStatusFilter(s)),
    clearAll: () => dispatch(filtersSlice.actions.clearAllFilters()),
    activeFilterCount: countActiveFilters(filters),
  };
}
