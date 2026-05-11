import type {
  AnalyticsFilters,
  OverviewResponse,
  UsageResponse,
  OutcomesResponse,
  CostResponse,
  ReliabilityResponse,
  GovernanceResponse,
  AgentsHubResponse,
  LiveAgentSessionsSocket,
  SearchSuggestionsRequest,
  SearchSuggestionsResponse,
  GetAgentDetailRequest,
  GetProjectDetailRequest,
  GetTeamDetailRequest,
  GetHumanDetailRequest,
  GetRunDetailRequest,
  GetRuleDetailRequest,
  GetGoldenQuestionDetailRequest,
  AgentDetailResponse,
  ProjectDetailResponse,
  TeamDetailResponse,
  HumanDetailResponse,
  RunDetailResponse,
  RuleDetailResponse,
  GoldenQuestionDetailResponse,
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
  CreateEvaluationRequest,
  CreateEvaluationResponse,
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
  connectLiveAgentSessionsSocket(filters: AnalyticsFilters): LiveAgentSessionsSocket;
  getSearchSuggestions(request: SearchSuggestionsRequest): Promise<SearchSuggestionsResponse>;
  getAgentDetail(request: GetAgentDetailRequest): Promise<AgentDetailResponse>;
  getProjectDetail(request: GetProjectDetailRequest): Promise<ProjectDetailResponse>;
  getTeamDetail(request: GetTeamDetailRequest): Promise<TeamDetailResponse>;
  getHumanDetail(request: GetHumanDetailRequest): Promise<HumanDetailResponse>;
  getRunDetail(request: GetRunDetailRequest): Promise<RunDetailResponse>;
  getRuleDetail(request: GetRuleDetailRequest): Promise<RuleDetailResponse>;
  getGoldenQuestionDetail(request: GetGoldenQuestionDetailRequest): Promise<GoldenQuestionDetailResponse>;
  updateRule(request: UpdateRuleRequest): Promise<UpdateRuleResponse>;
  createComplianceRule(request: CreateComplianceRuleRequest): Promise<CreateComplianceRuleResponse>;
  createSeat(request: CreateSeatRequest): Promise<CreateSeatResponse>;
  createProject(request: CreateProjectRequest): Promise<CreateProjectResponse>;
  createTeam(request: CreateTeamRequest): Promise<CreateTeamResponse>;
  createAgent(request: CreateAgentRequest): Promise<CreateAgentResponse>;
  createEvaluation(request: CreateEvaluationRequest): Promise<CreateEvaluationResponse>;
  updateAgentDescription(request: UpdateAgentDescriptionRequest): Promise<UpdateAgentDescriptionResponse>;
}
