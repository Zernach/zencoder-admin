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
} from "@/features/analytics/types";

export interface IAnalyticsService {
  getOverview(filters: AnalyticsFilters): Promise<OverviewResponse>;
  getUsage(filters: AnalyticsFilters): Promise<UsageResponse>;
  getOutcomes(filters: AnalyticsFilters): Promise<OutcomesResponse>;
  getCost(filters: AnalyticsFilters): Promise<CostResponse>;
  getReliability(filters: AnalyticsFilters): Promise<ReliabilityResponse>;
  getGovernance(filters: AnalyticsFilters): Promise<GovernanceResponse>;
  getAgentsHub(filters: AnalyticsFilters): Promise<AgentsHubResponse>;
  getLiveAgentSessions(filters: AnalyticsFilters): Promise<LiveAgentSessionsResponse>;
  getSearchSuggestions(request: SearchSuggestionsRequest): Promise<SearchSuggestionsResponse>;
}
