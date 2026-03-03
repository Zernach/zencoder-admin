import { StubAnalyticsApi } from "../StubAnalyticsApi";
import { generateSeedData } from "@/features/analytics/fixtures/seedData";
import type { AnalyticsFilters, RunsPageRequest } from "@/features/analytics/types";

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

const defaultPageRequest: RunsPageRequest = {
  filters: defaultFilters,
  page: 1,
  pageSize: 50,
  sortBy: "startedAtIso",
  sortDirection: "desc",
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

describe("getRunsPage", () => {
  it("returns valid RunsPageResponse", async () => {
    const res = await api.getRunsPage(defaultPageRequest);
    expect(typeof res.total).toBe("number");
    expect(res.page).toBe(1);
    expect(res.pageSize).toBe(50);
    expect(res.rows.length).toBeLessThanOrEqual(50);
    expect(res.rows.length).toBeGreaterThan(0);
  });

  it("rows have all required RunListRow fields", async () => {
    const res = await api.getRunsPage(defaultPageRequest);
    const row = res.rows[0]!;
    expect(typeof row.id).toBe("string");
    expect(typeof row.status).toBe("string");
    expect(typeof row.teamId).toBe("string");
    expect(typeof row.userId).toBe("string");
    expect(typeof row.provider).toBe("string");
    expect(typeof row.costUsd).toBe("number");
    expect(typeof row.durationMs).toBe("number");
    expect(typeof row.totalTokens).toBe("number");
    expect(typeof row.startedAtIso).toBe("string");
  });
});

describe("getRunDetail", () => {
  it("returns valid RunDetailResponse for a known run", async () => {
    const runId = seedData.runs[0]!.id;
    const res = await api.getRunDetail("org_zencoder_001", runId);
    expect(res.run.id).toBe(runId);
    expect(res.timeline.length).toBe(6);
    expect(typeof res.artifacts.linesAdded).toBe("number");
    expect(typeof res.artifacts.prCreated).toBe("boolean");
    expect(Array.isArray(res.policyContext.blockedActions)).toBe(true);
    expect(Array.isArray(res.policyContext.allowedActions)).toBe(true);
  });

  it("throws for unknown run", async () => {
    await expect(
      api.getRunDetail("org_zencoder_001", "nonexistent_run")
    ).rejects.toThrow("Run not found");
  });
});

// ── Filtering ────────────────────────────────────────────

describe("filtering", () => {
  it("teamIds narrows to specified teams", async () => {
    const teamId = seedData.teams[0]!.id;
    const res = await api.getRunsPage({
      ...defaultPageRequest,
      filters: { ...defaultFilters, teamIds: [teamId] },
    });
    res.rows.forEach((r) => expect(r.teamId).toBe(teamId));
  });

  it("providers: ['codex'] returns only codex runs", async () => {
    const res = await api.getRunsPage({
      ...defaultPageRequest,
      filters: { ...defaultFilters, providers: ["codex"] },
    });
    expect(res.rows.length).toBeGreaterThan(0);
    res.rows.forEach((r) => expect(r.provider).toBe("codex"));
  });

  it("statuses: ['failed'] returns only failed runs", async () => {
    const res = await api.getRunsPage({
      ...defaultPageRequest,
      filters: { ...defaultFilters, statuses: ["failed"] },
    });
    expect(res.rows.length).toBeGreaterThan(0);
    res.rows.forEach((r) => expect(r.status).toBe("failed"));
  });

  it("combined filters use AND logic", async () => {
    const teamId = seedData.teams[0]!.id;
    const res = await api.getRunsPage({
      ...defaultPageRequest,
      filters: {
        ...defaultFilters,
        teamIds: [teamId],
        providers: ["codex"],
        statuses: ["succeeded"],
      },
    });
    res.rows.forEach((r) => {
      expect(r.teamId).toBe(teamId);
      expect(r.provider).toBe("codex");
      expect(r.status).toBe("succeeded");
    });
  });

  it("empty filter arrays return full dataset", async () => {
    const res = await api.getRunsPage({
      ...defaultPageRequest,
      filters: { ...defaultFilters, teamIds: [], providers: [], statuses: [] },
      pageSize: 10,
    });
    const fullRes = await api.getRunsPage({
      ...defaultPageRequest,
      pageSize: 10,
    });
    expect(res.total).toBe(fullRes.total);
  });

  it("userIds filter works", async () => {
    const userId = seedData.users[0]!.id;
    const res = await api.getRunsPage({
      ...defaultPageRequest,
      filters: { ...defaultFilters, userIds: [userId] },
    });
    res.rows.forEach((r) => expect(r.userId).toBe(userId));
  });

  it("projectIds filter works", async () => {
    const projectId = seedData.projects[0]!.id;
    const res = await api.getRunsPage({
      ...defaultPageRequest,
      filters: { ...defaultFilters, projectIds: [projectId] },
    });
    res.rows.forEach((r) => expect(r.projectId).toBe(projectId));
  });
});

// ── Time-range boundaries ────────────────────────────────

describe("time-range boundaries", () => {
  it("runs outside time range are excluded", async () => {
    const dayStr = seedData.runs[0]!.startedAtIso.slice(0, 10);
    const narrowFilters: AnalyticsFilters = {
      ...defaultFilters,
      timeRange: { fromIso: `${dayStr}T00:00:00.000Z`, toIso: `${dayStr}T23:59:59.999Z` },
    };
    const res = await api.getRunsPage({
      ...defaultPageRequest,
      filters: narrowFilters,
      pageSize: 1000,
    });
    res.rows.forEach((r) => {
      expect(r.startedAtIso >= narrowFilters.timeRange.fromIso).toBe(true);
      expect(r.startedAtIso <= narrowFilters.timeRange.toIso).toBe(true);
    });
  });

  it("boundary dates are inclusive", async () => {
    const aRun = seedData.runs[Math.floor(seedData.runs.length / 2)];
    expect(aRun).toBeDefined();
    const filters: AnalyticsFilters = {
      ...defaultFilters,
      timeRange: { fromIso: aRun!.startedAtIso, toIso: aRun!.startedAtIso },
    };
    const res = await api.getRunsPage({
      ...defaultPageRequest,
      filters,
      pageSize: 1000,
    });
    expect(res.rows.some((r) => r.id === aRun!.id)).toBe(true);
  });

  it("different time ranges produce different counts", async () => {
    const dayStr = seedData.runs[0]!.startedAtIso.slice(0, 10);
    const oneDay = await api.getRunsPage({
      ...defaultPageRequest,
      filters: {
        ...defaultFilters,
        timeRange: { fromIso: `${dayStr}T00:00:00.000Z`, toIso: `${dayStr}T23:59:59.999Z` },
      },
    });
    const dayEnd = new Date(`${dayStr}T23:59:59.999Z`).getTime();
    const weekEnd = new Date(dayEnd + 7 * 86_400_000).toISOString();
    const oneWeek = await api.getRunsPage({
      ...defaultPageRequest,
      filters: {
        ...defaultFilters,
        timeRange: { fromIso: `${dayStr}T00:00:00.000Z`, toIso: weekEnd },
      },
    });
    expect(oneWeek.total).toBeGreaterThan(oneDay.total);
  });
});

// ── Pagination stability ─────────────────────────────────

describe("pagination stability", () => {
  it("same input returns same page content", async () => {
    const a = await api.getRunsPage(defaultPageRequest);
    const b = await api.getRunsPage(defaultPageRequest);
    expect(a.rows.map((r) => r.id)).toEqual(b.rows.map((r) => r.id));
  });

  it("page 1 + page 2 cover unique rows without overlap", async () => {
    const p1 = await api.getRunsPage({ ...defaultPageRequest, page: 1, pageSize: 20 });
    const p2 = await api.getRunsPage({ ...defaultPageRequest, page: 2, pageSize: 20 });
    const p1Ids = new Set(p1.rows.map((r) => r.id));
    const p2Ids = p2.rows.map((r) => r.id);
    p2Ids.forEach((id) => expect(p1Ids.has(id)).toBe(false));
  });

  it("total matches full filtered count", async () => {
    const res = await api.getRunsPage({ ...defaultPageRequest, pageSize: 10 });
    // Fetch all
    const all = await api.getRunsPage({ ...defaultPageRequest, pageSize: res.total });
    expect(all.rows.length).toBe(res.total);
  });

  it("requesting beyond last page returns empty rows", async () => {
    const res = await api.getRunsPage({ ...defaultPageRequest, pageSize: 10 });
    const lastPage = Math.ceil(res.total / 10);
    const beyond = await api.getRunsPage({
      ...defaultPageRequest,
      page: lastPage + 1,
      pageSize: 10,
    });
    expect(beyond.rows.length).toBe(0);
    expect(beyond.total).toBe(res.total);
  });
});

// ── Sorting ──────────────────────────────────────────────

describe("sorting", () => {
  it("sortBy: startedAtIso asc → oldest first", async () => {
    const res = await api.getRunsPage({
      ...defaultPageRequest,
      sortBy: "startedAtIso",
      sortDirection: "asc",
    });
    for (let i = 1; i < res.rows.length; i++) {
      expect(res.rows[i]!.startedAtIso >= res.rows[i - 1]!.startedAtIso).toBe(true);
    }
  });

  it("sortBy: costUsd desc → most expensive first", async () => {
    const res = await api.getRunsPage({
      ...defaultPageRequest,
      sortBy: "costUsd",
      sortDirection: "desc",
    });
    for (let i = 1; i < res.rows.length; i++) {
      expect(res.rows[i]!.costUsd).toBeLessThanOrEqual(res.rows[i - 1]!.costUsd);
    }
  });

  it("sortBy: durationMs asc → fastest first", async () => {
    const res = await api.getRunsPage({
      ...defaultPageRequest,
      sortBy: "durationMs",
      sortDirection: "asc",
    });
    for (let i = 1; i < res.rows.length; i++) {
      expect(res.rows[i]!.durationMs).toBeGreaterThanOrEqual(res.rows[i - 1]!.durationMs);
    }
  });

  it("sortBy: totalTokens desc → highest tokens first", async () => {
    const res = await api.getRunsPage({
      ...defaultPageRequest,
      sortBy: "totalTokens",
      sortDirection: "desc",
    });
    for (let i = 1; i < res.rows.length; i++) {
      expect(res.rows[i]!.totalTokens).toBeLessThanOrEqual(res.rows[i - 1]!.totalTokens);
    }
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
    await expect(safeApi.getRunsPage(defaultPageRequest)).resolves.toBeDefined();
  });
});
