import type {
  AnalyticsFilters,
  OverviewResponse,
  UsageResponse,
  OutcomesResponse,
  CostResponse,
  ReliabilityResponse,
  GovernanceResponse,
  ProjectsResponse,
  RunsPageRequest,
  RunsPageResponse,
  RunDetailResponse,
} from "@/features/analytics/types";

export interface IAnalyticsApi {
  getOverview(filters: AnalyticsFilters): Promise<OverviewResponse>;
  getUsage(filters: AnalyticsFilters): Promise<UsageResponse>;
  getOutcomes(filters: AnalyticsFilters): Promise<OutcomesResponse>;
  getCost(filters: AnalyticsFilters): Promise<CostResponse>;
  getReliability(filters: AnalyticsFilters): Promise<ReliabilityResponse>;
  getGovernance(filters: AnalyticsFilters): Promise<GovernanceResponse>;
  getProjects(filters: AnalyticsFilters): Promise<ProjectsResponse>;
  getRunsPage(request: RunsPageRequest): Promise<RunsPageResponse>;
  getRunDetail(orgId: string, runId: string): Promise<RunDetailResponse>;
}
