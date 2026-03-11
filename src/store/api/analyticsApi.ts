import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { getService } from "./serviceRegistry";
import type { ApiError } from "@/contracts/http/errors";
import { toApiError } from "@/contracts/http/errors";
import type {
  AnalyticsFilters,
  OverviewResponse,
  UsageResponse,
  OutcomesResponse,
  CostResponse,
  ReliabilityResponse,
  GovernanceResponse,
  AgentsHubResponse,
  SearchSuggestionsRequest,
  SearchSuggestionsResponse,
  GetAgentDetailRequest,
  GetProjectDetailRequest,
  GetTeamDetailRequest,
  GetHumanDetailRequest,
  GetRunDetailRequest,
  GetRuleDetailRequest,
  AgentDetailResponse,
  ProjectDetailResponse,
  TeamDetailResponse,
  HumanDetailResponse,
  RunDetailResponse,
  RuleDetailResponse,
  UpdateRuleRequest,
  UpdateRuleResponse,
  CreateComplianceRuleRequest,
  CreateComplianceRuleResponse,
  CreateSeatRequest,
  CreateSeatResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  CreateTeamRequest,
  CreateTeamResponse,
  CreateAgentRequest,
  CreateAgentResponse,
  UpdateAgentDescriptionRequest,
  UpdateAgentDescriptionResponse,
} from "@/features/analytics/types";

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: [
    "Overview",
    "Usage",
    "Outcomes",
    "Cost",
    "Reliability",
    "Governance",
    "AgentsHub",
    "Search",
    "AgentDetail",
    "ProjectDetail",
    "TeamDetail",
    "HumanDetail",
    "RunDetail",
    "RuleDetail",
  ],
  endpoints: (builder) => ({
    // ─── Dashboard Queries ─────────────────────────────────
    getOverview: builder.query<OverviewResponse, AnalyticsFilters>({
      queryFn: async (filters) => {
        try {
          return { data: await getService().getOverview(filters) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      providesTags: ["Overview"],
    }),

    getUsage: builder.query<UsageResponse, AnalyticsFilters>({
      queryFn: async (filters) => {
        try {
          return { data: await getService().getUsage(filters) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      providesTags: ["Usage"],
    }),

    getOutcomes: builder.query<OutcomesResponse, AnalyticsFilters>({
      queryFn: async (filters) => {
        try {
          return { data: await getService().getOutcomes(filters) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      providesTags: ["Outcomes"],
    }),

    getCost: builder.query<CostResponse, AnalyticsFilters>({
      queryFn: async (filters) => {
        try {
          return { data: await getService().getCost(filters) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      providesTags: ["Cost"],
    }),

    getReliability: builder.query<ReliabilityResponse, AnalyticsFilters>({
      queryFn: async (filters) => {
        try {
          return { data: await getService().getReliability(filters) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      providesTags: ["Reliability"],
    }),

    getGovernance: builder.query<GovernanceResponse, AnalyticsFilters>({
      queryFn: async (filters) => {
        try {
          return { data: await getService().getGovernance(filters) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      providesTags: ["Governance"],
    }),

    getAgentsHub: builder.query<AgentsHubResponse, AnalyticsFilters>({
      queryFn: async (filters) => {
        try {
          return { data: await getService().getAgentsHub(filters) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      providesTags: ["AgentsHub"],
    }),

    // ─── Search ────────────────────────────────────────────
    getSearchSuggestions: builder.query<SearchSuggestionsResponse, SearchSuggestionsRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().getSearchSuggestions(request) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      providesTags: ["Search"],
    }),

    // ─── Entity Detail Queries ─────────────────────────────
    getAgentDetail: builder.query<AgentDetailResponse, GetAgentDetailRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().getAgentDetail(request) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      providesTags: (_result, _error, { agentId }) => [
        { type: "AgentDetail", id: agentId },
      ],
    }),

    getProjectDetail: builder.query<ProjectDetailResponse, GetProjectDetailRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().getProjectDetail(request) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      providesTags: (_result, _error, { projectId }) => [
        { type: "ProjectDetail", id: projectId },
      ],
    }),

    getTeamDetail: builder.query<TeamDetailResponse, GetTeamDetailRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().getTeamDetail(request) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      providesTags: (_result, _error, { teamId }) => [
        { type: "TeamDetail", id: teamId },
      ],
    }),

    getHumanDetail: builder.query<HumanDetailResponse, GetHumanDetailRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().getHumanDetail(request) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      providesTags: (_result, _error, { humanId }) => [
        { type: "HumanDetail", id: humanId },
      ],
    }),

    getRunDetail: builder.query<RunDetailResponse, GetRunDetailRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().getRunDetail(request) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      providesTags: (_result, _error, { runId }) => [
        { type: "RunDetail", id: runId },
      ],
    }),

    getRuleDetail: builder.query<RuleDetailResponse, GetRuleDetailRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().getRuleDetail(request) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      providesTags: (_result, _error, { ruleId }) => [
        { type: "RuleDetail", id: ruleId },
      ],
    }),

    // ─── Mutations ─────────────────────────────────────────
    updateRule: builder.mutation<UpdateRuleResponse, UpdateRuleRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().updateRule(request) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      invalidatesTags: (_result, _error, { ruleId }) => [
        { type: "RuleDetail", id: ruleId },
        "Governance",
      ],
    }),

    createComplianceRule: builder.mutation<CreateComplianceRuleResponse, CreateComplianceRuleRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().createComplianceRule(request) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      invalidatesTags: ["Governance"],
    }),

    createSeat: builder.mutation<CreateSeatResponse, CreateSeatRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().createSeat(request) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      invalidatesTags: ["Governance", "Usage"],
    }),

    createProject: builder.mutation<CreateProjectResponse, CreateProjectRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().createProject(request) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      invalidatesTags: ["AgentsHub", "Cost"],
    }),

    createTeam: builder.mutation<CreateTeamResponse, CreateTeamRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().createTeam(request) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      invalidatesTags: ["Overview", "Usage", "Governance"],
    }),

    createAgent: builder.mutation<CreateAgentResponse, CreateAgentRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().createAgent(request) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      invalidatesTags: ["AgentsHub"],
    }),

    updateAgentDescription: builder.mutation<UpdateAgentDescriptionResponse, UpdateAgentDescriptionRequest>({
      queryFn: async (request) => {
        try {
          return { data: await getService().updateAgentDescription(request) };
        } catch (e) {
          return { error: toApiError(e) };
        }
      },
      invalidatesTags: (_result, _error, { agentId }) => [
        { type: "AgentDetail", id: agentId },
        "AgentsHub",
      ],
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
  useGetSearchSuggestionsQuery,
  useGetAgentDetailQuery,
  useGetProjectDetailQuery,
  useGetTeamDetailQuery,
  useGetHumanDetailQuery,
  useGetRunDetailQuery,
  useGetRuleDetailQuery,
  useUpdateRuleMutation,
  useCreateComplianceRuleMutation,
  useCreateSeatMutation,
  useCreateProjectMutation,
  useCreateTeamMutation,
  useCreateAgentMutation,
  useUpdateAgentDescriptionMutation,
} = analyticsApi;
