import type { IAnalyticsApi } from "../api/IAnalyticsApi";
import type { IAnalyticsService } from "./IAnalyticsService";
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
import { round1, round2 } from "../utils/metricFormulas";

function roundRate(value: number): number {
  // Keep enough precision on 0..1 ratios so percent displays remain varied.
  return Math.round(value * 1000) / 1000;
}

export class AnalyticsService implements IAnalyticsService {
  constructor(private api: IAnalyticsApi) {}

  async getOverview(filters: AnalyticsFilters): Promise<OverviewResponse> {
    const res = await this.api.getOverview(filters);
    res.kpis.totalCostUsd = round2(res.kpis.totalCostUsd);
    res.kpis.seatAdoptionRate = round1(res.kpis.seatAdoptionRate);
    res.kpis.runSuccessRate = round1(res.kpis.runSuccessRate);
    res.kpis.providerShareCodex = round1(res.kpis.providerShareCodex);
    res.kpis.providerShareClaude = round1(res.kpis.providerShareClaude);
    for (const a of res.anomalies) {
      if (!a.runId) a.runId = "unknown";
    }
    return res;
  }

  async getUsage(filters: AnalyticsFilters): Promise<UsageResponse> {
    const res = await this.api.getUsage(filters);
    res.seatAdoptionRate = round1(res.seatAdoptionRate);
    for (const row of res.breakdownByTeam) {
      row.runSuccessRate = round1(row.runSuccessRate);
    }
    return res;
  }

  async getOutcomes(filters: AnalyticsFilters): Promise<OutcomesResponse> {
    const res = await this.api.getOutcomes(filters);
    res.prMergeRate = round1(res.prMergeRate);
    res.testsPassRate = round1(res.testsPassRate);
    res.codeAcceptanceRate = round1(res.codeAcceptanceRate);
    res.reworkRate = round1(res.reworkRate);
    res.medianTimeToMergeHours = round1(res.medianTimeToMergeHours);
    return res;
  }

  async getCost(filters: AnalyticsFilters): Promise<CostResponse> {
    const res = await this.api.getCost(filters);
    res.totalCostUsd = round2(res.totalCostUsd);
    res.averageCostPerRunUsd = round2(res.averageCostPerRunUsd);
    res.costPerSuccessfulRunUsd = round2(res.costPerSuccessfulRunUsd);
    res.budget.spentUsd = round2(res.budget.spentUsd);
    res.budget.remainingUsd = round2(res.budget.remainingUsd);
    res.budget.forecastMonthEndUsd = round2(res.budget.forecastMonthEndUsd);
    for (const row of res.costBreakdown) {
      row.totalCostUsd = round2(row.totalCostUsd);
      row.averageCostPerRunUsd = round2(row.averageCostPerRunUsd);
      row.percentOfTotal = round1(row.percentOfTotal);
    }
    for (const row of res.costPerTeam) {
      row.totalCostUsd = round2(row.totalCostUsd);
      row.averageCostPerRunUsd = round2(row.averageCostPerRunUsd);
      row.percentOfTotal = round1(row.percentOfTotal);
    }
    return res;
  }

  async getReliability(filters: AnalyticsFilters): Promise<ReliabilityResponse> {
    const res = await this.api.getReliability(filters);
    res.runSuccessRate = round1(res.runSuccessRate);
    res.errorRate = round1(res.errorRate);
    return res;
  }

  async getGovernance(filters: AnalyticsFilters): Promise<GovernanceResponse> {
    const res = await this.api.getGovernance(filters);
    for (const row of res.teamPerformanceComparison) {
      row.successRate = roundRate(row.successRate);
      row.policyViolationRate = round1(row.policyViolationRate);
      row.totalCostUsd = round2(row.totalCostUsd);
    }
    return res;
  }

  async getAgentsHub(filters: AnalyticsFilters): Promise<AgentsHubResponse> {
    const res = await this.api.getAgentsHub(filters);
    res.runSuccessRate = round1(res.runSuccessRate);
    res.errorRate = round1(res.errorRate);
    res.overallSuccessRate = round1(res.overallSuccessRate);
    res.totalCostUsd = round2(res.totalCostUsd);
    for (const row of res.projectBreakdown) {
      row.totalCostUsd = round2(row.totalCostUsd);
      row.avgCostPerRunUsd = round2(row.avgCostPerRunUsd);
      row.successRate = roundRate(row.successRate);
    }
    return res;
  }

  connectLiveAgentSessionsSocket(filters: AnalyticsFilters): LiveAgentSessionsSocket {
    return this.api.connectLiveAgentSessionsSocket(filters);
  }

  async getSearchSuggestions(request: SearchSuggestionsRequest): Promise<SearchSuggestionsResponse> {
    return this.api.getSearchSuggestions(request);
  }

  async getAgentDetail(request: GetAgentDetailRequest): Promise<AgentDetailResponse> {
    return this.api.getAgentDetail(request);
  }

  async getProjectDetail(request: GetProjectDetailRequest): Promise<ProjectDetailResponse> {
    return this.api.getProjectDetail(request);
  }

  async getTeamDetail(request: GetTeamDetailRequest): Promise<TeamDetailResponse> {
    return this.api.getTeamDetail(request);
  }

  async getHumanDetail(request: GetHumanDetailRequest): Promise<HumanDetailResponse> {
    return this.api.getHumanDetail(request);
  }

  async getRunDetail(request: GetRunDetailRequest): Promise<RunDetailResponse> {
    return this.api.getRunDetail(request);
  }

  async getRuleDetail(request: GetRuleDetailRequest): Promise<RuleDetailResponse> {
    return this.api.getRuleDetail(request);
  }

  async updateRule(request: UpdateRuleRequest): Promise<UpdateRuleResponse> {
    return this.api.updateRule(request);
  }

  async createComplianceRule(request: CreateComplianceRuleRequest): Promise<CreateComplianceRuleResponse> {
    return this.api.createComplianceRule(request);
  }

  async createSeat(request: CreateSeatRequest): Promise<CreateSeatResponse> {
    return this.api.createSeat(request);
  }

  async createProject(request: CreateProjectRequest): Promise<CreateProjectResponse> {
    return this.api.createProject(request);
  }

  async createTeam(request: CreateTeamRequest): Promise<CreateTeamResponse> {
    return this.api.createTeam(request);
  }

  async createAgent(request: CreateAgentRequest): Promise<CreateAgentResponse> {
    return this.api.createAgent(request);
  }

  async updateAgentDescription(request: UpdateAgentDescriptionRequest): Promise<UpdateAgentDescriptionResponse> {
    return this.api.updateAgentDescription(request);
  }
}
