import { AnalyticsService } from "../AnalyticsService";
import { StubAnalyticsApi } from "../../api/stub/StubAnalyticsApi";
import { generateSeedData } from "@/features/analytics/fixtures/seedData";
import type { IAnalyticsApi } from "../../api/IAnalyticsApi";
import type {
  AnalyticsFilters,
  OverviewResponse,
  CostResponse,
  SearchSuggestionsResponse,
} from "@/features/analytics/types";

const seedData = generateSeedData(42);
const stubApi = new StubAnalyticsApi(seedData, { latencyMinMs: 0, latencyMaxMs: 0 });
const service = new AnalyticsService(stubApi);

/** Derive time range from seed runs so tests pass regardless of current date */
function timeRangeFromRuns(runs: { startedAtIso: string }[]): { fromIso: string; toIso: string } {
  if (runs.length === 0) {
    const d = new Date();
    return {
      fromIso: new Date(d.getTime() - 90 * 86_400_000).toISOString(),
      toIso: d.toISOString(),
    };
  }
  const sorted = [...runs].sort((a, b) => a.startedAtIso.localeCompare(b.startedAtIso));
  return { fromIso: sorted[0]!.startedAtIso, toIso: sorted[sorted.length - 1]!.startedAtIso };
}

const defaultFilters: AnalyticsFilters = {
  orgId: "org_zencoder_001",
  timeRange: timeRangeFromRuns(seedData.runs),
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
    const costStr = String(res.kpis.totalCostUsd).split(".")[1] || "";
    expect(costStr.length).toBeLessThanOrEqual(2);
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
  it("returns rounded team performance rates", async () => {
    const res = await service.getGovernance(defaultFilters);
    for (const row of res.teamPerformanceComparison) {
      const successDec = String(row.successRate).split(".")[1] || "";
      expect(successDec.length).toBeLessThanOrEqual(3);
    }
  });

  it("returns seat user usage with full names", async () => {
    const res = await service.getGovernance(defaultFilters);
    expect(Array.isArray(res.seatUserUsage)).toBe(true);
    expect(res.seatUserUsage.length).toBeGreaterThan(0);
    expect(res.seatUserUsage[0]!.fullName).toContain(" ");
  });
});

describe("getAgentsHub", () => {
  it("returns rounded rate and cost values", async () => {
    const res = await service.getAgentsHub(defaultFilters);
    const successDec = String(res.runSuccessRate).split(".")[1] || "";
    expect(successDec.length).toBeLessThanOrEqual(1);
    const costDec = String(res.totalCostUsd).split(".")[1] || "";
    expect(costDec.length).toBeLessThanOrEqual(2);
  });

  it("rounds project breakdown values", async () => {
    const res = await service.getAgentsHub(defaultFilters);
    for (const row of res.projectBreakdown) {
      const costDec = String(row.totalCostUsd).split(".")[1] || "";
      expect(costDec.length).toBeLessThanOrEqual(2);
      const successDec = String(row.successRate).split(".")[1] || "";
      expect(successDec.length).toBeLessThanOrEqual(3);
    }
  });
});

describe("getLiveAgentSessions", () => {
  it("returns active sessions from api", async () => {
    const res = await service.getLiveAgentSessions(defaultFilters);
    expect(Array.isArray(res.activeSessions)).toBe(true);
    for (const session of res.activeSessions) {
      expect(session.status === "running" || session.status === "queued").toBe(true);
    }
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
      deltas: {
        seatAdoptionRate: 5.0,
        runSuccessRate: 2.1,
        totalCostUsd: 12.3,
        policyViolationCount: -3.0,
      },
      runsTrend: [{ tsIso: "2025-01-01T00:00:00Z", value: 100 }],
      costTrend: [{ tsIso: "2025-01-01T00:00:00Z", value: 500 }],
      anomalies: [{ runId: "run_1", type: "highest_cost", label: "100.00", value: 100 }],
    };

    const mockApi: IAnalyticsApi = {
      getOverview: jest.fn().mockResolvedValue(mockOverview),
      getUsage: jest.fn(),
      getOutcomes: jest.fn(),
      getCost: jest.fn(),
      getReliability: jest.fn(),
      getGovernance: jest.fn(),
      getAgentsHub: jest.fn(),
      getLiveAgentSessions: jest.fn(),
      getSearchSuggestions: jest.fn(),
      getAgentDetail: jest.fn(),
      getProjectDetail: jest.fn(),
      getTeamDetail: jest.fn(),
      getHumanDetail: jest.fn(),
      getRunDetail: jest.fn(),
      createComplianceRule: jest.fn(),
      createSeat: jest.fn(),
      createProject: jest.fn(),
      createTeam: jest.fn(),
      createAgent: jest.fn(),
      updateAgentDescription: jest.fn(),
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
      providerBreakdown: [],
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
      getAgentsHub: jest.fn(),
      getLiveAgentSessions: jest.fn(),
      getSearchSuggestions: jest.fn(),
      getAgentDetail: jest.fn(),
      getProjectDetail: jest.fn(),
      getTeamDetail: jest.fn(),
      getHumanDetail: jest.fn(),
      getRunDetail: jest.fn(),
      createComplianceRule: jest.fn(),
      createSeat: jest.fn(),
      createProject: jest.fn(),
      createTeam: jest.fn(),
      createAgent: jest.fn(),
      updateAgentDescription: jest.fn(),
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

describe("getSearchSuggestions", () => {
  it("delegates to api.getSearchSuggestions and returns result", async () => {
    const mockResponse: SearchSuggestionsResponse = {
      groups: [
        {
          entityType: "agent",
          label: "Agents",
          suggestions: [{ id: "a1", entityType: "agent", title: "Agent X" }],
        },
      ],
      totalCount: 1,
    };

    const mockApi: IAnalyticsApi = {
      getOverview: jest.fn(),
      getUsage: jest.fn(),
      getOutcomes: jest.fn(),
      getCost: jest.fn(),
      getReliability: jest.fn(),
      getGovernance: jest.fn(),
      getAgentsHub: jest.fn(),
      getLiveAgentSessions: jest.fn(),
      getSearchSuggestions: jest.fn().mockResolvedValue(mockResponse),
      getAgentDetail: jest.fn(),
      getProjectDetail: jest.fn(),
      getTeamDetail: jest.fn(),
      getHumanDetail: jest.fn(),
      getRunDetail: jest.fn(),
      createComplianceRule: jest.fn(),
      createSeat: jest.fn(),
      createProject: jest.fn(),
      createTeam: jest.fn(),
      createAgent: jest.fn(),
      updateAgentDescription: jest.fn(),
    };

    const svc = new AnalyticsService(mockApi);
    const request = { query: "agent" };
    const res = await svc.getSearchSuggestions(request);

    expect(mockApi.getSearchSuggestions).toHaveBeenCalledWith(request);
    expect(res).toEqual(mockResponse);
  });

  it("returns grouped suggestions from stub", async () => {
    const res = await service.getSearchSuggestions({ query: "a" });
    expect(res.groups.length).toBeGreaterThan(0);
    expect(res.totalCount).toBeGreaterThan(0);
  });
});

describe("entity detail delegation", () => {
  it("getAgentDetail delegates to api", async () => {
    const agentId = seedData.agents[0]!.id;
    const res = await service.getAgentDetail("org1", agentId);
    expect(res.agent.id).toBe(agentId);
    expect(typeof res.totalRuns).toBe("number");
  });

  it("getProjectDetail delegates to api", async () => {
    const projectId = seedData.projects[0]!.id;
    const res = await service.getProjectDetail("org1", projectId);
    expect(res.project.id).toBe(projectId);
    expect(typeof res.agentCount).toBe("number");
  });

  it("getTeamDetail delegates to api", async () => {
    const teamId = seedData.teams[0]!.id;
    const res = await service.getTeamDetail("org1", teamId);
    expect(res.team.id).toBe(teamId);
    expect(typeof res.memberCount).toBe("number");
  });

  it("getHumanDetail delegates to api", async () => {
    const userId = seedData.users[0]!.id;
    const res = await service.getHumanDetail("org1", userId);
    expect(res.user.id).toBe(userId);
    expect(typeof res.totalTokens).toBe("number");
  });

  it("getRunDetail delegates to api", async () => {
    const runId = seedData.runs[0]!.id;
    const res = await service.getRunDetail("org1", runId);
    expect(res.run.id).toBe(runId);
    expect(typeof res.agentName).toBe("string");
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
});
