import { AnalyticsService } from "../AnalyticsService";
import { StubAnalyticsApi } from "../../api/stub/StubAnalyticsApi";
import { generateSeedData } from "@/features/analytics/fixtures/seedData";
import type {
  AnalyticsFilters,
  IAnalyticsApi,
  OverviewResponse,
  CostResponse,
} from "@/features/analytics/types";

const seedData = generateSeedData(42);
const stubApi = new StubAnalyticsApi(seedData, { latencyMinMs: 0, latencyMaxMs: 0 });
const service = new AnalyticsService(stubApi);

const defaultFilters: AnalyticsFilters = {
  orgId: "org_zencoder_001",
  timeRange: { fromIso: "2024-12-01T00:00:00Z", toIso: "2025-02-27T23:59:59Z" },
};

// ── Pass-through correctness ─────────────────────────────

describe("getOverview", () => {
  it("calls api.getOverview and returns response", async () => {
    const res = await service.getOverview(defaultFilters);
    expect(res.kpis).toBeDefined();
    expect(res.runsTrend.length).toBeGreaterThan(0);
    expect(res.anomalies.length).toBe(3);
  });

  it("rounds kpi values", async () => {
    const res = await service.getOverview(defaultFilters);
    // totalCostUsd should be rounded to 2 decimals
    const costStr = String(res.kpis.totalCostUsd).split(".")[1] || "";
    expect(costStr.length).toBeLessThanOrEqual(2);
    // seatAdoptionRate should be rounded to 1 decimal
    const adoptStr = String(res.kpis.seatAdoptionRate).split(".")[1] || "";
    expect(adoptStr.length).toBeLessThanOrEqual(1);
  });
});

describe("getUsage", () => {
  it("returns rounded seatAdoptionRate", async () => {
    const res = await service.getUsage(defaultFilters);
    const decStr = String(res.seatAdoptionRate).split(".")[1] || "";
    expect(decStr.length).toBeLessThanOrEqual(1);
  });

  it("rounds team runSuccessRate values", async () => {
    const res = await service.getUsage(defaultFilters);
    for (const row of res.breakdownByTeam) {
      const decStr = String(row.runSuccessRate).split(".")[1] || "";
      expect(decStr.length).toBeLessThanOrEqual(1);
    }
  });
});

describe("getOutcomes", () => {
  it("returns rounded rate values", async () => {
    const res = await service.getOutcomes(defaultFilters);
    for (const field of [
      res.prMergeRate,
      res.testsPassRate,
      res.codeAcceptanceRate,
      res.reworkRate,
      res.medianTimeToMergeHours,
    ]) {
      const decStr = String(field).split(".")[1] || "";
      expect(decStr.length).toBeLessThanOrEqual(1);
    }
  });
});

describe("getCost", () => {
  it("returns rounded currency values", async () => {
    const res = await service.getCost(defaultFilters);
    for (const field of [
      res.totalCostUsd,
      res.averageCostPerRunUsd,
      res.costPerSuccessfulRunUsd,
      res.budget.spentUsd,
      res.budget.remainingUsd,
      res.budget.forecastMonthEndUsd,
    ]) {
      const decStr = String(field).split(".")[1] || "";
      expect(decStr.length).toBeLessThanOrEqual(2);
    }
  });

  it("rounds breakdown row values", async () => {
    const res = await service.getCost(defaultFilters);
    for (const row of res.costBreakdown) {
      const costDec = String(row.totalCostUsd).split(".")[1] || "";
      expect(costDec.length).toBeLessThanOrEqual(2);
      const avgDec = String(row.averageCostPerRunUsd).split(".")[1] || "";
      expect(avgDec.length).toBeLessThanOrEqual(2);
      const pctDec = String(row.percentOfTotal).split(".")[1] || "";
      expect(pctDec.length).toBeLessThanOrEqual(1);
    }
  });
});

describe("getReliability", () => {
  it("returns rounded rate values", async () => {
    const res = await service.getReliability(defaultFilters);
    const successDec = String(res.runSuccessRate).split(".")[1] || "";
    expect(successDec.length).toBeLessThanOrEqual(1);
    const errDec = String(res.errorRate).split(".")[1] || "";
    expect(errDec.length).toBeLessThanOrEqual(1);
  });
});

describe("getGovernance", () => {
  it("returns rounded policyViolationRate", async () => {
    const res = await service.getGovernance(defaultFilters);
    const decStr = String(res.policyViolationRate).split(".")[1] || "";
    expect(decStr.length).toBeLessThanOrEqual(1);
  });
});

describe("getRunsPage", () => {
  it("passes through to api without modification", async () => {
    const request = {
      filters: defaultFilters,
      page: 1,
      pageSize: 10,
      sortBy: "startedAtIso" as const,
      sortDirection: "desc" as const,
    };
    const res = await service.getRunsPage(request);
    expect(res.rows.length).toBeLessThanOrEqual(10);
    expect(res.page).toBe(1);
  });
});

describe("getRunDetail", () => {
  it("passes through to api", async () => {
    const runId = seedData.runs[0]!.id;
    const res = await service.getRunDetail("org_zencoder_001", runId);
    expect(res.run.id).toBe(runId);
    expect(res.timeline.length).toBe(6);
  });
});

// ── Drill-down linkage ───────────────────────────────────

describe("drill-down linkage", () => {
  it("anomaly runId from getOverview is resolvable by getRunDetail", async () => {
    const overview = await service.getOverview(defaultFilters);
    expect(overview.anomalies.length).toBeGreaterThan(0);
    const runId = overview.anomalies[0]!.runId;
    const detail = await service.getRunDetail(defaultFilters.orgId, runId);
    expect(detail.run.id).toBe(runId);
  });

  it("run from getRunsPage is resolvable by getRunDetail", async () => {
    const page = await service.getRunsPage({
      filters: defaultFilters,
      page: 1,
      pageSize: 5,
      sortBy: "startedAtIso",
      sortDirection: "desc",
    });
    const runId = page.rows[0]!.id;
    const detail = await service.getRunDetail(defaultFilters.orgId, runId);
    expect(detail.run.id).toBe(runId);
  });
});

// ── Mock-based delegation tests ──────────────────────────

describe("delegation via mock", () => {
  it("getOverview calls api.getOverview with correct filters", async () => {
    const mockOverview: OverviewResponse = {
      kpis: {
        seatAdoptionRate: 0.8123,
        runSuccessRate: 0.7234,
        totalCostUsd: 47823.456,
        providerShareCodex: 0.4512,
        providerShareClaude: 0.4321,
        policyViolationCount: 5,
      },
      runsTrend: [{ tsIso: "2025-01-01T00:00:00Z", value: 100 }],
      costTrend: [{ tsIso: "2025-01-01T00:00:00Z", value: 500 }],
      anomalies: [{ runId: "run_1", type: "highest_cost", label: "$100", value: 100 }],
    };

    const mockApi: IAnalyticsApi = {
      getOverview: jest.fn().mockResolvedValue(mockOverview),
      getUsage: jest.fn(),
      getOutcomes: jest.fn(),
      getCost: jest.fn(),
      getReliability: jest.fn(),
      getGovernance: jest.fn(),
      getRunsPage: jest.fn(),
      getRunDetail: jest.fn(),
    };

    const svc = new AnalyticsService(mockApi);
    const res = await svc.getOverview(defaultFilters);

    expect(mockApi.getOverview).toHaveBeenCalledWith(defaultFilters);
    expect(res.kpis.totalCostUsd).toBe(47823.46); // round2
    expect(res.kpis.seatAdoptionRate).toBe(0.8); // round1
  });

  it("getCost rounds currency values from api", async () => {
    const mockCost: CostResponse = {
      totalCostUsd: 1234.5678,
      averageCostPerRunUsd: 1.2345,
      costPerSuccessfulRunUsd: 1.5678,
      costTrend: [],
      costBreakdown: [
        {
          key: "proj_1",
          totalCostUsd: 500.999,
          runsStarted: 100,
          averageCostPerRunUsd: 5.0099,
          percentOfTotal: 0.406,
        },
      ],
      budget: {
        budgetUsd: 60000,
        spentUsd: 1234.5678,
        remainingUsd: 58765.4322,
        forecastMonthEndUsd: 2000.1234,
      },
    };

    const mockApi: IAnalyticsApi = {
      getOverview: jest.fn(),
      getUsage: jest.fn(),
      getOutcomes: jest.fn(),
      getCost: jest.fn().mockResolvedValue(mockCost),
      getReliability: jest.fn(),
      getGovernance: jest.fn(),
      getRunsPage: jest.fn(),
      getRunDetail: jest.fn(),
    };

    const svc = new AnalyticsService(mockApi);
    const res = await svc.getCost(defaultFilters);

    expect(res.totalCostUsd).toBe(1234.57);
    expect(res.averageCostPerRunUsd).toBe(1.23);
    expect(res.costPerSuccessfulRunUsd).toBe(1.57);
    expect(res.budget.spentUsd).toBe(1234.57);
    expect(res.budget.remainingUsd).toBe(58765.43);
    expect(res.budget.forecastMonthEndUsd).toBe(2000.12);
    expect(res.costBreakdown[0]!.totalCostUsd).toBe(501);
    expect(res.costBreakdown[0]!.averageCostPerRunUsd).toBe(5.01);
    expect(res.costBreakdown[0]!.percentOfTotal).toBe(0.4);
  });
});

// ── Edge cases ───────────────────────────────────────────

describe("edge cases", () => {
  it("handles narrow time range with no runs gracefully", async () => {
    const emptyFilters: AnalyticsFilters = {
      ...defaultFilters,
      timeRange: { fromIso: "2020-01-01T00:00:00Z", toIso: "2020-01-01T00:00:01Z" },
    };
    const res = await service.getOverview(emptyFilters);
    expect(res.kpis).toBeDefined();
    expect(res.runsTrend.length).toBe(0);
  });

  it("handles impossible filter combination gracefully", async () => {
    const res = await service.getRunsPage({
      filters: {
        ...defaultFilters,
        teamIds: ["nonexistent_team"],
      },
      page: 1,
      pageSize: 10,
      sortBy: "startedAtIso",
      sortDirection: "desc",
    });
    expect(res.total).toBe(0);
    expect(res.rows.length).toBe(0);
  });
});
