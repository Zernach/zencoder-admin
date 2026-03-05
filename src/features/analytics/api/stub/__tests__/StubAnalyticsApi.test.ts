import { StubAnalyticsApi } from "../StubAnalyticsApi";
import { generateSeedData } from "@/features/analytics/fixtures/seedData";
import type { AnalyticsFilters } from "@/features/analytics/types";

const seedData = generateSeedData(42);
const api = new StubAnalyticsApi(seedData, { latencyMinMs: 0, latencyMaxMs: 0 });

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

// ── Response type conformance ────────────────────────────

describe("getOverview", () => {
  it("returns valid OverviewResponse with all required fields", async () => {
    const res = await api.getOverview(defaultFilters);
    expect(res.kpis).toBeDefined();
    expect(typeof res.kpis.seatAdoptionRate).toBe("number");
    expect(typeof res.kpis.totalCostUsd).toBe("number");
    expect(typeof res.kpis.runSuccessRate).toBe("number");
    expect(typeof res.kpis.providerShareCodex).toBe("number");
    expect(typeof res.kpis.providerShareClaude).toBe("number");
    expect(typeof res.kpis.policyViolationCount).toBe("number");
    expect(res.runsTrend.length).toBeGreaterThan(0);
    expect(res.costTrend.length).toBeGreaterThan(0);
    expect(res.anomalies.length).toBe(3);
  });

  it("anomalies have valid fields", async () => {
    const res = await api.getOverview(defaultFilters);
    for (const a of res.anomalies) {
      expect(typeof a.runId).toBe("string");
      expect(["highest_cost", "longest_duration", "highest_tokens"]).toContain(a.type);
      expect(typeof a.label).toBe("string");
      expect(typeof a.value).toBe("number");
    }
  });
});

describe("getLiveAgentSessions", () => {
  it("returns only active sessions and required fields", async () => {
    const res = await api.getLiveAgentSessions(defaultFilters);
    expect(Array.isArray(res.activeSessions)).toBe(true);
    expect(res.activeSessions.length).toBeGreaterThan(0);
    for (const session of res.activeSessions) {
      expect(session.status === "running" || session.status === "queued").toBe(true);
      expect(typeof session.sessionId).toBe("string");
      expect(typeof session.runId).toBe("string");
      expect(typeof session.agentName).toBe("string");
      expect(typeof session.projectName).toBe("string");
      expect(typeof session.userName).toBe("string");
      expect(typeof session.currentTask).toBe("string");
    }
    expect(typeof res.lastUpdatedIso).toBe("string");
  });
});

describe("getUsage", () => {
  it("returns valid UsageResponse", async () => {
    const res = await api.getUsage(defaultFilters);
    expect(typeof res.wau).toBe("number");
    expect(typeof res.mau).toBe("number");
    expect(typeof res.activeSeats30d).toBe("number");
    expect(typeof res.seatAdoptionRate).toBe("number");
    expect(res.activeUsersTrend.length).toBeGreaterThan(0);
    expect(res.runsPerUserDistribution.length).toBeGreaterThan(0);
    expect(res.breakdownByTeam.length).toBeGreaterThan(0);
  });
});

describe("getOutcomes", () => {
  it("returns valid OutcomesResponse", async () => {
    const res = await api.getOutcomes(defaultFilters);
    expect(typeof res.prsCreated).toBe("number");
    expect(typeof res.prsMerged).toBe("number");
    expect(typeof res.prMergeRate).toBe("number");
    expect(typeof res.medianTimeToMergeHours).toBe("number");
    expect(typeof res.testsPassRate).toBe("number");
    expect(typeof res.codeAcceptanceRate).toBe("number");
    expect(typeof res.reworkRate).toBe("number");
    expect(res.outcomesTrend.length).toBeGreaterThan(0);
    expect(res.leaderboard.length).toBeGreaterThan(0);
  });
});

describe("getCost", () => {
  it("returns valid CostResponse", async () => {
    const res = await api.getCost(defaultFilters);
    expect(typeof res.totalCostUsd).toBe("number");
    expect(typeof res.averageCostPerRunUsd).toBe("number");
    expect(typeof res.costPerSuccessfulRunUsd).toBe("number");
    expect(res.costTrend.length).toBeGreaterThan(0);
    expect(res.costBreakdown.length).toBeGreaterThan(0);
    expect(typeof res.budget.budgetUsd).toBe("number");
    expect(typeof res.budget.spentUsd).toBe("number");
    expect(typeof res.budget.remainingUsd).toBe("number");
    expect(typeof res.budget.forecastMonthEndUsd).toBe("number");
  });

  it("budget remaining = budget - spent", async () => {
    const res = await api.getCost(defaultFilters);
    expect(res.budget.remainingUsd).toBeCloseTo(
      res.budget.budgetUsd - res.budget.spentUsd,
      1
    );
  });
});

describe("getReliability", () => {
  it("returns valid ReliabilityResponse", async () => {
    const res = await api.getReliability(defaultFilters);
    expect(typeof res.runSuccessRate).toBe("number");
    expect(typeof res.errorRate).toBe("number");
    expect(typeof res.p50RunDurationMs).toBe("number");
    expect(typeof res.p95RunDurationMs).toBe("number");
    expect(typeof res.p95QueueWaitMs).toBe("number");
    expect(typeof res.peakConcurrency).toBe("number");
    expect(res.failureCategoryBreakdown.length).toBeGreaterThan(0);
    expect(res.reliabilityTrend.length).toBeGreaterThan(0);
  });

  it("p95 >= p50 duration", async () => {
    const res = await api.getReliability(defaultFilters);
    expect(res.p95RunDurationMs).toBeGreaterThanOrEqual(res.p50RunDurationMs);
  });
});

describe("getGovernance", () => {
  it("returns valid GovernanceResponse", async () => {
    const res = await api.getGovernance(defaultFilters);
    expect(typeof res.policyViolationCount).toBe("number");
    expect(typeof res.policyViolationRate).toBe("number");
    expect(typeof res.blockedNetworkAttempts).toBe("number");
    expect(typeof res.auditEventsCount).toBe("number");
    expect(Array.isArray(res.violationsByTeam)).toBe(true);
    expect(Array.isArray(res.recentViolations)).toBe(true);
    expect(Array.isArray(res.securityEvents)).toBe(true);
    expect(Array.isArray(res.complianceItems)).toBe(true);
    expect(Array.isArray(res.policyChanges)).toBe(true);
    expect(Array.isArray(res.seatUserUsage)).toBe(true);
  });

  it("recentViolations sorted by timestampIso descending with deterministic ties", async () => {
    const res = await api.getGovernance(defaultFilters);
    for (let i = 1; i < res.recentViolations.length; i++) {
      const prev = res.recentViolations[i - 1]!;
      const curr = res.recentViolations[i]!;
      const cmp = prev.timestampIso.localeCompare(curr.timestampIso);
      if (cmp === 0) {
        expect(prev.id.localeCompare(curr.id)).toBeLessThanOrEqual(0);
      } else {
        expect(cmp).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("securityEvents sorted by timestampIso descending with deterministic ties", async () => {
    const res = await api.getGovernance(defaultFilters);
    for (let i = 1; i < res.securityEvents.length; i++) {
      const prev = res.securityEvents[i - 1]!;
      const curr = res.securityEvents[i]!;
      const cmp = prev.timestampIso.localeCompare(curr.timestampIso);
      if (cmp === 0) {
        expect(prev.id.localeCompare(curr.id)).toBeLessThanOrEqual(0);
      } else {
        expect(cmp).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("policyChanges sorted by timestampIso descending with deterministic ties", async () => {
    const res = await api.getGovernance(defaultFilters);
    for (let i = 1; i < res.policyChanges.length; i++) {
      const prev = res.policyChanges[i - 1]!;
      const curr = res.policyChanges[i]!;
      const cmp = prev.timestampIso.localeCompare(curr.timestampIso);
      if (cmp === 0) {
        expect(prev.id.localeCompare(curr.id)).toBeLessThanOrEqual(0);
      } else {
        expect(cmp).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("returns seat usage rows with full names sorted by usage", async () => {
    const res = await api.getGovernance(defaultFilters);
    expect(res.seatUserUsage.length).toBeGreaterThan(0);

    const first = res.seatUserUsage[0]!;
    expect(first.fullName).toContain(" ");
    expect(typeof first.runsCount).toBe("number");
    expect(typeof first.totalTokens).toBe("number");
    expect(typeof first.totalCostUsd).toBe("number");

    for (let i = 1; i < res.seatUserUsage.length; i++) {
      expect(res.seatUserUsage[i - 1]!.runsCount).toBeGreaterThanOrEqual(
        res.seatUserUsage[i]!.runsCount
      );
    }
  });
});

describe("getAgentsHub", () => {
  it("returns valid AgentsHubResponse with all sections", async () => {
    const res = await api.getAgentsHub(defaultFilters);
    // Reliability fields
    expect(typeof res.runSuccessRate).toBe("number");
    expect(typeof res.errorRate).toBe("number");
    expect(typeof res.p50RunDurationMs).toBe("number");
    expect(typeof res.p95RunDurationMs).toBe("number");
    expect(res.agentBreakdown.length).toBeGreaterThan(0);
    expect(res.reliabilityTrend.length).toBeGreaterThan(0);
    // Project fields
    expect(typeof res.totalProjects).toBe("number");
    expect(typeof res.activeProjects).toBe("number");
    expect(res.projectBreakdown.length).toBeGreaterThan(0);
    // Recent runs
    expect(res.recentRuns.length).toBeGreaterThan(0);
    expect(res.recentRuns.length).toBeLessThanOrEqual(25);
  });

  it("recent runs are sorted newest first", async () => {
    const res = await api.getAgentsHub(defaultFilters);
    for (let i = 1; i < res.recentRuns.length; i++) {
      expect(
        res.recentRuns[i - 1]!.startedAtIso >= res.recentRuns[i]!.startedAtIso
      ).toBe(true);
    }
  });

  it("project breakdown rows have valid fields", async () => {
    const res = await api.getAgentsHub(defaultFilters);
    const row = res.projectBreakdown[0]!;
    expect(typeof row.projectId).toBe("string");
    expect(typeof row.projectName).toBe("string");
    expect(typeof row.teamName).toBe("string");
    expect(typeof row.totalRuns).toBe("number");
    expect(typeof row.successRate).toBe("number");
    expect(typeof row.agentCount).toBe("number");
  });
});

// ── Search suggestions ──────────────────────────────────

describe("getSearchSuggestions", () => {
  it("returns empty groups for empty query", async () => {
    const res = await api.getSearchSuggestions({ query: "" });
    expect(res.groups).toEqual([]);
    expect(res.totalCount).toBe(0);
  });

  it("returns empty groups for whitespace-only query", async () => {
    const res = await api.getSearchSuggestions({ query: "   " });
    expect(res.groups).toEqual([]);
    expect(res.totalCount).toBe(0);
  });

  it("returns groups ordered as agent, project, team, human, run", async () => {
    // Use a broad query that matches across entity types
    const res = await api.getSearchSuggestions({ query: "a" });
    const entityTypes = res.groups.map((g) => g.entityType);
    const expectedOrder = ["agent", "project", "team", "human", "run"];
    for (let i = 0; i < entityTypes.length; i++) {
      const idx = expectedOrder.indexOf(entityTypes[i]!);
      expect(idx).toBeGreaterThanOrEqual(0);
      if (i > 0) {
        const prevIdx = expectedOrder.indexOf(entityTypes[i - 1]!);
        expect(prevIdx).toBeLessThan(idx);
      }
    }
  });

  it("respects per-group limit", async () => {
    const res = await api.getSearchSuggestions({ query: "a", limit: 2 });
    for (const group of res.groups) {
      expect(group.suggestions.length).toBeLessThanOrEqual(2);
    }
  });

  it("default per-group limit is 5", async () => {
    const res = await api.getSearchSuggestions({ query: "a" });
    for (const group of res.groups) {
      expect(group.suggestions.length).toBeLessThanOrEqual(5);
    }
  });

  it("totalCount equals sum of all group suggestion counts", async () => {
    const res = await api.getSearchSuggestions({ query: "a" });
    const sum = res.groups.reduce((s, g) => s + g.suggestions.length, 0);
    expect(res.totalCount).toBe(sum);
  });

  it("matches query case-insensitively", async () => {
    const lowerRes = await api.getSearchSuggestions({ query: "team" });
    const upperRes = await api.getSearchSuggestions({ query: "TEAM" });
    expect(lowerRes.totalCount).toBe(upperRes.totalCount);
  });

  it("each suggestion has required fields", async () => {
    const res = await api.getSearchSuggestions({ query: "a" });
    for (const group of res.groups) {
      expect(typeof group.entityType).toBe("string");
      expect(typeof group.label).toBe("string");
      for (const s of group.suggestions) {
        expect(typeof s.id).toBe("string");
        expect(typeof s.entityType).toBe("string");
        expect(typeof s.title).toBe("string");
        expect(s.entityType).toBe(group.entityType);
      }
    }
  });

  it("returns no groups when query matches nothing", async () => {
    const res = await api.getSearchSuggestions({ query: "zzzzxyznonexistent" });
    expect(res.groups).toEqual([]);
    expect(res.totalCount).toBe(0);
  });
});

// ── Failure injection ────────────────────────────────────

describe("failure injection", () => {
  it("debugFailureRate: 1 → every call rejects", async () => {
    const failApi = new StubAnalyticsApi(seedData, {
      debugFailureRate: 1,
      latencyMinMs: 0,
      latencyMaxMs: 0,
    });
    await expect(failApi.getOverview(defaultFilters)).rejects.toThrow();
  });

  it("debugFailureRate: 0 → no calls reject", async () => {
    const safeApi = new StubAnalyticsApi(seedData, {
      debugFailureRate: 0,
      latencyMinMs: 0,
      latencyMaxMs: 0,
    });
    await expect(safeApi.getOverview(defaultFilters)).resolves.toBeDefined();
    await expect(safeApi.getCost(defaultFilters)).resolves.toBeDefined();
    await expect(safeApi.getAgentsHub(defaultFilters)).resolves.toBeDefined();
  });
});
