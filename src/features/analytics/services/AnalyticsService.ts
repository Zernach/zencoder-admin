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
  ProjectsResponse,
  RunsPageRequest,
  RunsPageResponse,
  RunDetailResponse,
} from "@/features/analytics/types";

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
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
    res.policyViolationRate = round1(res.policyViolationRate);
    return res;
  }

  async getProjects(filters: AnalyticsFilters): Promise<ProjectsResponse> {
    const res = await this.api.getProjects(filters);
    res.overallSuccessRate = round1(res.overallSuccessRate);
    res.totalCostUsd = round2(res.totalCostUsd);
    for (const row of res.projectBreakdown) {
      row.totalCostUsd = round2(row.totalCostUsd);
      row.avgCostPerRunUsd = round2(row.avgCostPerRunUsd);
      row.successRate = round1(row.successRate);
    }
    return res;
  }

  async getRunsPage(request: RunsPageRequest): Promise<RunsPageResponse> {
    return this.api.getRunsPage(request);
  }

  async getRunDetail(orgId: string, runId: string): Promise<RunDetailResponse> {
    const res = await this.api.getRunDetail(orgId, runId);
    res.promptChain = res.promptChain.map((row) => ({
      ...row,
      inputCostUsd: round2(row.inputCostUsd),
      outputCostUsd: round2(row.outputCostUsd),
      totalCostUsd: round2(row.totalCostUsd),
      cumulativeCostUsd: round2(row.cumulativeCostUsd),
    }));
    res.promptChainSummary.totalCostUsd = round2(res.promptChainSummary.totalCostUsd);
    return res;
  }
}
