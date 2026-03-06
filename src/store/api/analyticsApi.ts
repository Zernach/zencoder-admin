import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { getService } from "./serviceRegistry";
import type {
  AnalyticsFilters,
  OverviewResponse,
  UsageResponse,
  OutcomesResponse,
  CostResponse,
  ReliabilityResponse,
  GovernanceResponse,
  AgentsHubResponse,
  LiveAgentSessionsResponse,
  SearchSuggestionsRequest,
  SearchSuggestionsResponse,
  AgentDetailResponse,
  ProjectDetailResponse,
  TeamDetailResponse,
  HumanDetailResponse,
  RunDetailResponse,
  CreateComplianceRuleRequest,
  CreateComplianceRuleResponse,
  CreateSeatRequest,
  CreateSeatResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  CreateTeamRequest,
  CreateTeamResponse,
} from "@/features/analytics/types";

interface EntityDetailArgs {
  orgId: string;
  entityId: string;
}

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: fakeBaseQuery<string>(),
  tagTypes: [
    "Overview",
    "Usage",
    "Outcomes",
    "Cost",
    "Reliability",
    "Governance",
    "AgentsHub",
    "LiveAgentSessions",
    "Search",
    "AgentDetail",
    "ProjectDetail",
    "TeamDetail",
    "HumanDetail",
    "RunDetail",
  ],
  endpoints: (builder) => ({
    // ─── Dashboard Queries ─────────────────────────────────
    getOverview: builder.query<OverviewResponse, AnalyticsFilters>({
      queryFn: async (filters) => {
        try {
          return { data: await getService().getOverview(filters) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      providesTags: ["Overview"],
    }),

    getUsage: builder.query<UsageResponse, AnalyticsFilters>({
      queryFn: async (filters) => {
        try {
          return { data: await getService().getUsage(filters) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      providesTags: ["Usage"],
    }),

    getOutcomes: builder.query<OutcomesResponse, AnalyticsFilters>({
      queryFn: async (filters) => {
        try {
          return { data: await getService().getOutcomes(filters) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      providesTags: ["Outcomes"],
    }),

    getCost: builder.query<CostResponse, AnalyticsFilters>({
      queryFn: async (filters) => {
        try {
          return { data: await getService().getCost(filters) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      providesTags: ["Cost"],
    }),

    getReliability: builder.query<ReliabilityResponse, AnalyticsFilters>({
      queryFn: async (filters) => {
        try {
          return { data: await getService().getReliability(filters) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      providesTags: ["Reliability"],
    }),

    getGovernance: builder.query<GovernanceResponse, AnalyticsFilters>({
      queryFn: async (filters) => {
        try {
          return { data: await getService().getGovernance(filters) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      providesTags: ["Governance"],
    }),

    getAgentsHub: builder.query<AgentsHubResponse, AnalyticsFilters>({
      queryFn: async (filters) => {
        try {
          return { data: await getService().getAgentsHub(filters) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      providesTags: ["AgentsHub"],
    }),

    getLiveAgentSessions: builder.query<LiveAgentSessionsResponse, AnalyticsFilters>({
      queryFn: async (filters) => {
        try {
          return { data: await getService().getLiveAgentSessions(filters) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      providesTags: ["LiveAgentSessions"],
    }),

    // ─── Search ────────────────────────────────────────────
    getSearchSuggestions: builder.query<SearchSuggestionsResponse, SearchSuggestionsRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().getSearchSuggestions(request) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      providesTags: ["Search"],
    }),

    // ─── Entity Detail Queries ─────────────────────────────
    getAgentDetail: builder.query<AgentDetailResponse, EntityDetailArgs>({
      queryFn: async ({ orgId, entityId }) => {
        try {
          return { data: await getService().getAgentDetail(orgId, entityId) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      providesTags: (_result, _error, { entityId }) => [
        { type: "AgentDetail", id: entityId },
      ],
    }),

    getProjectDetail: builder.query<ProjectDetailResponse, EntityDetailArgs>({
      queryFn: async ({ orgId, entityId }) => {
        try {
          return { data: await getService().getProjectDetail(orgId, entityId) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      providesTags: (_result, _error, { entityId }) => [
        { type: "ProjectDetail", id: entityId },
      ],
    }),

    getTeamDetail: builder.query<TeamDetailResponse, EntityDetailArgs>({
      queryFn: async ({ orgId, entityId }) => {
        try {
          return { data: await getService().getTeamDetail(orgId, entityId) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      providesTags: (_result, _error, { entityId }) => [
        { type: "TeamDetail", id: entityId },
      ],
    }),

    getHumanDetail: builder.query<HumanDetailResponse, EntityDetailArgs>({
      queryFn: async ({ orgId, entityId }) => {
        try {
          return { data: await getService().getHumanDetail(orgId, entityId) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      providesTags: (_result, _error, { entityId }) => [
        { type: "HumanDetail", id: entityId },
      ],
    }),

    getRunDetail: builder.query<RunDetailResponse, EntityDetailArgs>({
      queryFn: async ({ orgId, entityId }) => {
        try {
          return { data: await getService().getRunDetail(orgId, entityId) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      providesTags: (_result, _error, { entityId }) => [
        { type: "RunDetail", id: entityId },
      ],
    }),

    // ─── Mutations ─────────────────────────────────────────
    createComplianceRule: builder.mutation<CreateComplianceRuleResponse, CreateComplianceRuleRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().createComplianceRule(request) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      invalidatesTags: ["Governance"],
    }),

    createSeat: builder.mutation<CreateSeatResponse, CreateSeatRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().createSeat(request) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      invalidatesTags: ["Governance", "Usage"],
    }),

    createProject: builder.mutation<CreateProjectResponse, CreateProjectRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().createProject(request) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      invalidatesTags: ["AgentsHub", "Cost"],
    }),

    createTeam: builder.mutation<CreateTeamResponse, CreateTeamRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().createTeam(request) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
      invalidatesTags: ["Overview", "Usage", "Governance"],
    }),
  }),
});

export const {
  useGetOverviewQuery,
  useGetUsageQuery,
  useGetOutcomesQuery,
  useGetCostQuery,
  useGetReliabilityQuery,
  useGetGovernanceQuery,
  useGetAgentsHubQuery,
  useGetLiveAgentSessionsQuery,
  useGetSearchSuggestionsQuery,
  useGetAgentDetailQuery,
  useGetProjectDetailQuery,
  useGetTeamDetailQuery,
  useGetHumanDetailQuery,
  useGetRunDetailQuery,
  useCreateComplianceRuleMutation,
  useCreateSeatMutation,
  useCreateProjectMutation,
  useCreateTeamMutation,
} = analyticsApi;
