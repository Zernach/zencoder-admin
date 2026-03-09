import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  AnalyticsFilters,
  TimeRange,
  TimeRangePreset,
  ModelProvider,
  RunStatus,
} from "@/features/analytics/types";

interface FiltersState extends AnalyticsFilters {
  preset: TimeRangePreset;
  searchQuery: string;
}

function computeTimeRange(preset: TimeRangePreset): TimeRange {
  const now = new Date();
  const to = now.toISOString();
  const from = new Date(now);
  switch (preset) {
    case "24h":
      from.setHours(from.getHours() - 24);
      break;
    case "7d":
      from.setDate(from.getDate() - 7);
      break;
    case "30d":
      from.setDate(from.getDate() - 30);
      break;
    case "90d":
      from.setDate(from.getDate() - 90);
      break;
    default:
      break;
  }
  return { fromIso: from.toISOString(), toIso: to };
}

const initialState: FiltersState = {
  orgId: "org_zencoder_001",
  preset: "30d",
  searchQuery: "",
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
    setTimeRangePreset(state, action: PayloadAction<TimeRangePreset>) {
      state.preset = action.payload;
      const range = computeTimeRange(action.payload);
      state.timeRange = range;
    },
    setCustomTimeRange(state, action: PayloadAction<TimeRange>) {
      state.preset = "custom";
      state.timeRange = action.payload;
    },
    setTeamFilter(state, action: PayloadAction<string[] | undefined>) {
      state.teamIds = action.payload;
    },
    setUserFilter(state, action: PayloadAction<string[] | undefined>) {
      state.userIds = action.payload;
    },
    setProjectFilter(state, action: PayloadAction<string[] | undefined>) {
      state.projectIds = action.payload;
    },
    setProviderFilter(
      state,
      action: PayloadAction<ModelProvider[] | undefined>
    ) {
      state.providers = action.payload;
    },
    setModelFilter(state, action: PayloadAction<string[] | undefined>) {
      state.modelIds = action.payload;
    },
    setStatusFilter(state, action: PayloadAction<RunStatus[] | undefined>) {
      state.statuses = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    clearAllFilters() {
      return { ...initialState, timeRange: computeTimeRange("30d") };
    },
  },
});

export const selectActiveFilters = createSelector(
  [
    (state: { filters: FiltersState }) => state.filters.orgId,
    (state: { filters: FiltersState }) => state.filters.timeRange,
    (state: { filters: FiltersState }) => state.filters.teamIds,
    (state: { filters: FiltersState }) => state.filters.userIds,
    (state: { filters: FiltersState }) => state.filters.projectIds,
    (state: { filters: FiltersState }) => state.filters.providers,
    (state: { filters: FiltersState }) => state.filters.modelIds,
    (state: { filters: FiltersState }) => state.filters.environments,
    (state: { filters: FiltersState }) => state.filters.statuses,
  ],
  (orgId, timeRange, teamIds, userIds, projectIds, providers, modelIds, environments, statuses): AnalyticsFilters => ({
    orgId,
    timeRange,
    teamIds,
    userIds,
    projectIds,
    providers,
    modelIds,
    environments,
    statuses,
  }),
);

export const selectPreset = createSelector(
  [(state: { filters: FiltersState }) => state.filters.preset],
  (preset) => preset,
);

export const selectSearchQuery = createSelector(
  [(state: { filters: FiltersState }) => state.filters.searchQuery],
  (searchQuery) => searchQuery,
);
