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
  CreateAgentRequest,
  CreateAgentResponse,
  UpdateAgentDescriptionRequest,
  UpdateAgentDescriptionResponse,
} from "@/features/analytics/types";

export interface IAnalyticsApi {
  getOverview(filters: AnalyticsFilters): Promise<OverviewResponse>;
  getUsage(filters: AnalyticsFilters): Promise<UsageResponse>;
  getOutcomes(filters: AnalyticsFilters): Promise<OutcomesResponse>;
  getCost(filters: AnalyticsFilters): Promise<CostResponse>;
  getReliability(filters: AnalyticsFilters): Promise<ReliabilityResponse>;
  getGovernance(filters: AnalyticsFilters): Promise<GovernanceResponse>;
  getAgentsHub(filters: AnalyticsFilters): Promise<AgentsHubResponse>;
  getLiveAgentSessions(filters: AnalyticsFilters): Promise<LiveAgentSessionsResponse>;
  getSearchSuggestions(request: SearchSuggestionsRequest): Promise<SearchSuggestionsResponse>;
  getAgentDetail(orgId: string, agentId: string): Promise<AgentDetailResponse>;
  getProjectDetail(orgId: string, projectId: string): Promise<ProjectDetailResponse>;
  getTeamDetail(orgId: string, teamId: string): Promise<TeamDetailResponse>;
  getHumanDetail(orgId: string, humanId: string): Promise<HumanDetailResponse>;
  getRunDetail(orgId: string, runId: string): Promise<RunDetailResponse>;
  createComplianceRule(request: CreateComplianceRuleRequest): Promise<CreateComplianceRuleResponse>;
  createSeat(request: CreateSeatRequest): Promise<CreateSeatResponse>;
  createProject(request: CreateProjectRequest): Promise<CreateProjectResponse>;
  createTeam(request: CreateTeamRequest): Promise<CreateTeamResponse>;
  createAgent(request: CreateAgentRequest): Promise<CreateAgentResponse>;
  updateAgentDescription(request: UpdateAgentDescriptionRequest): Promise<UpdateAgentDescriptionResponse>;
}
