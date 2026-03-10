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

function hasHighAndLowSpikes(trend: { value: number }[]): { hasHighSpike: boolean; hasLowSpike: boolean } {
  if (trend.length < 5) return { hasHighSpike: false, hasLowSpike: false };
  const values = trend.map((point) => point.value);
  const hasHighSpike = values.slice(1, -1).some((value, index) => {
    const i = index + 1;
    const neighborMax = Math.max(values[i - 1]!, values[i + 1]!);
    return value > neighborMax * 1.18;
  });
  const hasLowSpike = values.slice(1, -1).some((value, index) => {
    const i = index + 1;
    const neighborMin = Math.min(values[i - 1]!, values[i + 1]!);
    if (neighborMin <= 0) {
      return value <= 0 && Math.max(values[i - 1]!, values[i + 1]!) > 0;
    }
    return value < neighborMin * 0.82;
  });
  return { hasHighSpike, hasLowSpike };
}

function hasNotableIntegerPeakAndDip(
  trend: { value: number }[],
): { hasPeak: boolean; hasDip: boolean } {
  if (trend.length < 5) return { hasPeak: false, hasDip: false };
  const values = trend.map((point) => point.value);
  const hasPeak = values.slice(1, -1).some((value, index) => {
    const i = index + 1;
    const neighborMax = Math.max(values[i - 1]!, values[i + 1]!);
    return value >= neighborMax + 1 || value >= neighborMax * 1.12;
  });
  const hasDip = values.slice(1, -1).some((value, index) => {
    const i = index + 1;
    const neighborMin = Math.min(values[i - 1]!, values[i + 1]!);
    return value <= neighborMin - 1 || value <= neighborMin * 0.88;
  });
  return { hasPeak, hasDip };
}

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

  it("runs and cost trends generally increase over time", async () => {
    const res = await api.getOverview(defaultFilters);
    const assertGenerallyIncreasing = (trend: { value: number }[]): void => {
      expect(trend.length).toBeGreaterThan(14);
      const midpoint = Math.floor(trend.length / 2);
      const firstHalf = trend.slice(0, midpoint);
      const secondHalf = trend.slice(midpoint);
      const avg = (points: { value: number }[]): number =>
        points.reduce((sum, point) => sum + point.value, 0) / points.length;

      expect(avg(secondHalf)).toBeGreaterThan(avg(firstHalf));
      expect(trend[trend.length - 1]!.value).toBeGreaterThanOrEqual(trend[0]!.value);
    };

    assertGenerallyIncreasing(res.runsTrend);
    assertGenerallyIncreasing(res.costTrend);
  });

  it("runs and cost trends are not identical in shape", async () => {
    const res = await api.getOverview(defaultFilters);
    expect(res.runsTrend.length).toBe(res.costTrend.length);

    const normalize = (trend: { value: number }[]): number[] => {
      const values = trend.map((point) => point.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = Math.max(max - min, 1);
      return values.map((value) => (value - min) / range);
    };

    const runsNormalized = normalize(res.runsTrend);
    const costNormalized = normalize(res.costTrend);
    const avgAbsoluteDelta =
      runsNormalized.reduce(
        (sum, value, index) => sum + Math.abs(value - costNormalized[index]!),
        0,
      ) / runsNormalized.length;

    expect(avgAbsoluteDelta).toBeGreaterThan(0.03);
  });

  it("runs trend includes one high spike and one low spike", async () => {
    const res = await api.getOverview(defaultFilters);
    const spikes = hasHighAndLowSpikes(res.runsTrend);
    expect(spikes.hasHighSpike).toBe(true);
    expect(spikes.hasLowSpike).toBe(true);
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
      expect(typeof session.teamId).toBe("string");
      expect(typeof session.teamName).toBe("string");
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
    expect(res.wauTrend.length).toBeGreaterThan(0);
    expect(res.mauTrend.length).toBeGreaterThan(0);
    expect(res.runsPerUserDistribution.length).toBeGreaterThan(0);
    expect(res.breakdownByTeam.length).toBeGreaterThan(0);
  });

  it("wauTrend values are <= mauTrend values for matching days", async () => {
    const res = await api.getUsage(defaultFilters);
    const mauByDay = new Map(res.mauTrend.map((p) => [p.tsIso, p.value]));
    for (const wauPoint of res.wauTrend) {
      const mauValue = mauByDay.get(wauPoint.tsIso);
      if (mauValue !== undefined) {
        expect(wauPoint.value).toBeLessThanOrEqual(mauValue + 5); // allow small smoothing variance
      }
    }
  });

  it("active users trend generally increases over time", async () => {
    const res = await api.getUsage(defaultFilters);
    const trend = res.activeUsersTrend;
    expect(trend.length).toBeGreaterThan(14);

    const midpoint = Math.floor(trend.length / 2);
    const firstHalf = trend.slice(0, midpoint);
    const secondHalf = trend.slice(midpoint);

    const avg = (points: { value: number }[]): number =>
      points.reduce((sum, point) => sum + point.value, 0) / points.length;

    // Active users can plateau near total seat capacity, so allow mild flattening.
    expect(avg(secondHalf)).toBeGreaterThanOrEqual(avg(firstHalf) - 1);
    expect(trend[trend.length - 1]!.value).toBeGreaterThanOrEqual(trend[0]!.value - 1);
  });

  it("active users trend includes one high spike and one low spike", async () => {
    const res = await api.getUsage(defaultFilters);
    const spikes = hasNotableIntegerPeakAndDip(res.activeUsersTrend);
    expect(spikes.hasPeak).toBe(true);
    expect(spikes.hasDip).toBe(true);
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

  it("outcomes trend generally increases over time", async () => {
    const res = await api.getOutcomes(defaultFilters);
    const trend = res.outcomesTrend;
    expect(trend.length).toBeGreaterThan(14);

    const midpoint = Math.floor(trend.length / 2);
    const firstHalf = trend.slice(0, midpoint);
    const secondHalf = trend.slice(midpoint);

    const avg = (points: { value: number }[]): number =>
      points.reduce((sum, point) => sum + point.value, 0) / points.length;

    expect(avg(secondHalf)).toBeGreaterThan(avg(firstHalf));
    expect(trend[trend.length - 1]!.value).toBeGreaterThanOrEqual(trend[0]!.value);
  });

  it("outcomes trend includes one high spike and one low spike", async () => {
    const res = await api.getOutcomes(defaultFilters);
    const spikes = hasHighAndLowSpikes(res.outcomesTrend);
    expect(spikes.hasHighSpike).toBe(true);
    expect(spikes.hasLowSpike).toBe(true);
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

  it("cost trend includes natural bumps/divots while trending up", async () => {
    const res = await api.getCost(defaultFilters);
    const trend = res.costTrend;
    expect(trend.length).toBeGreaterThan(14);

    const values = trend.map((point) => point.value);
    const directionChanges = values.slice(2).reduce((count, value, idx) => {
      const prevDelta = values[idx + 1]! - values[idx]!;
      const currDelta = value - values[idx + 1]!;
      const changedSign =
        (prevDelta > 0 && currDelta < 0) || (prevDelta < 0 && currDelta > 0);
      return changedSign ? count + 1 : count;
    }, 0);

    const midpoint = Math.floor(trend.length / 2);
    const firstHalfAvg =
      values.slice(0, midpoint).reduce((sum, value) => sum + value, 0) / midpoint;
    const secondHalfAvg =
      values.slice(midpoint).reduce((sum, value) => sum + value, 0) / (values.length - midpoint);

    expect(directionChanges).toBeGreaterThan(3);
    expect(secondHalfAvg).toBeGreaterThan(firstHalfAvg);
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

  it("reliability trend generally slopes upward", async () => {
    const res = await api.getReliability(defaultFilters);
    const trend = res.reliabilityTrend;
    expect(trend.length).toBeGreaterThan(10);

    const values = trend.map((point) => point.value);
    const midpoint = Math.floor(values.length / 2);
    const firstHalfAvg =
      values.slice(0, midpoint).reduce((sum, value) => sum + value, 0) / midpoint;
    const secondHalfAvg =
      values.slice(midpoint).reduce((sum, value) => sum + value, 0) / (values.length - midpoint);

    expect(secondHalfAvg).toBeGreaterThan(firstHalfAvg);
  });
});

describe("getGovernance", () => {
  it("returns valid GovernanceResponse", async () => {
    const res = await api.getGovernance(defaultFilters);
    expect(typeof res.policyViolationCount).toBe("number");
    expect(Array.isArray(res.violationsByTeam)).toBe(true);
    expect(Array.isArray(res.recentViolations)).toBe(true);
    expect(Array.isArray(res.securityEvents)).toBe(true);
    expect(Array.isArray(res.rules)).toBe(true);
    expect(Array.isArray(res.complianceItems)).toBe(true);
    expect(Array.isArray(res.policyChanges)).toBe(true);
    expect(Array.isArray(res.seatUserUsage)).toBe(true);
    expect(Array.isArray(res.teamPerformanceComparison)).toBe(true);
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

  it("returns seat usage rows with full names sorted by usage and valid teamId", async () => {
    const res = await api.getGovernance(defaultFilters);
    expect(res.seatUserUsage.length).toBeGreaterThan(0);

    const first = res.seatUserUsage[0]!;
    expect(first.fullName).toContain(" ");
    expect(typeof first.runsCount).toBe("number");
    expect(typeof first.totalTokens).toBe("number");
    expect(typeof first.totalCostUsd).toBe("number");
    expect(typeof first.teamId).toBe("string");
    expect(first.teamId.length).toBeGreaterThan(0);

    for (let i = 1; i < res.seatUserUsage.length; i++) {
      expect(res.seatUserUsage[i - 1]!.runsCount).toBeGreaterThanOrEqual(
        res.seatUserUsage[i]!.runsCount
      );
    }

    for (const row of res.seatUserUsage) {
      expect(typeof row.teamId).toBe("string");
      expect(row.teamId.length).toBeGreaterThan(0);
    }
  });

  it("returns team performance rows with compare/contrast metrics", async () => {
    const res = await api.getGovernance(defaultFilters);
    expect(res.teamPerformanceComparison.length).toBeGreaterThan(0);

    const row = res.teamPerformanceComparison[0]!;
    expect(typeof row.teamId).toBe("string");
    expect(typeof row.teamName).toBe("string");
    expect(typeof row.runsCount).toBe("number");
    expect(typeof row.successRate).toBe("number");
    expect(typeof row.policyViolationCount).toBe("number");
    expect(typeof row.rulesCount).toBe("number");
    expect(typeof row.policyViolationRate).toBe("number");
    expect(typeof row.totalCostUsd).toBe("number");
  });

  it("returns governance rules with created/edited timestamps and runs count", async () => {
    const res = await api.getGovernance(defaultFilters);
    expect(res.rules.length).toBeGreaterThan(0);

    const row = res.rules[0]!;
    expect(typeof row.id).toBe("string");
    expect(typeof row.title).toBe("string");
    expect(typeof row.description).toBe("string");
    expect(typeof row.createdAtIso).toBe("string");
    expect(typeof row.editedAtIso).toBe("string");
    expect(typeof row.runsCheckedCount).toBe("number");
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

  it("project breakdown rows have valid fields including teamId", async () => {
    const res = await api.getAgentsHub(defaultFilters);
    const row = res.projectBreakdown[0]!;
    expect(typeof row.projectId).toBe("string");
    expect(typeof row.projectName).toBe("string");
    expect(typeof row.teamId).toBe("string");
    expect(row.teamId.length).toBeGreaterThan(0);
    expect(typeof row.teamName).toBe("string");
    expect(typeof row.totalRuns).toBe("number");
    expect(typeof row.successRate).toBe("number");
    expect(typeof row.agentCount).toBe("number");
  });

  it("agent breakdown rows have valid projectId", async () => {
    const res = await api.getAgentsHub(defaultFilters);
    expect(res.agentBreakdown.length).toBeGreaterThan(0);
    for (const row of res.agentBreakdown) {
      expect(typeof row.projectId).toBe("string");
      expect(row.projectId.length).toBeGreaterThan(0);
    }
  });
});

// ── Entity detail endpoints ─────────────────────────────

describe("getAgentDetail", () => {
  it("returns valid agent detail for existing agent", async () => {
    const agentId = seedData.agents[0]!.id;
    const res = await api.getAgentDetail("org1", agentId);
    expect(res.agent.id).toBe(agentId);
    expect(typeof res.projectName).toBe("string");
    expect(typeof res.teamName).toBe("string");
    expect(typeof res.totalRuns).toBe("number");
    expect(typeof res.successRate).toBe("number");
    expect(typeof res.avgDurationMs).toBe("number");
    expect(typeof res.totalCostUsd).toBe("number");
    expect(Array.isArray(res.recentRuns)).toBe(true);
  });

  it("throws for unknown agent", async () => {
    await expect(api.getAgentDetail("org1", "nonexistent")).rejects.toThrow("Agent not found");
  });
});

describe("getProjectDetail", () => {
  it("returns valid project detail for existing project", async () => {
    const projectId = seedData.projects[0]!.id;
    const res = await api.getProjectDetail("org1", projectId);
    expect(res.project.id).toBe(projectId);
    expect(typeof res.teamName).toBe("string");
    expect(typeof res.agentCount).toBe("number");
    expect(typeof res.totalRuns).toBe("number");
    expect(typeof res.totalCostUsd).toBe("number");
    expect(Array.isArray(res.agents)).toBe(true);
    expect(Array.isArray(res.recentRuns)).toBe(true);
  });

  it("throws for unknown project", async () => {
    await expect(api.getProjectDetail("org1", "nonexistent")).rejects.toThrow("Project not found");
  });
});

describe("getTeamDetail", () => {
  it("returns valid team detail for existing team", async () => {
    const teamId = seedData.teams[0]!.id;
    const res = await api.getTeamDetail("org1", teamId);
    expect(res.team.id).toBe(teamId);
    expect(typeof res.memberCount).toBe("number");
    expect(typeof res.projectCount).toBe("number");
    expect(typeof res.totalRuns).toBe("number");
    expect(typeof res.totalCostUsd).toBe("number");
    expect(Array.isArray(res.members)).toBe(true);
    expect(Array.isArray(res.projects)).toBe(true);
  });

  it("throws for unknown team", async () => {
    await expect(api.getTeamDetail("org1", "nonexistent")).rejects.toThrow("Team not found");
  });
});

describe("getHumanDetail", () => {
  it("returns valid human detail for existing user", async () => {
    const userId = seedData.users[0]!.id;
    const res = await api.getHumanDetail("org1", userId);
    expect(res.user.id).toBe(userId);
    expect(typeof res.teamName).toBe("string");
    expect(typeof res.totalRuns).toBe("number");
    expect(typeof res.totalTokens).toBe("number");
    expect(typeof res.totalCostUsd).toBe("number");
    expect(Array.isArray(res.recentRuns)).toBe(true);
  });

  it("throws for unknown human", async () => {
    await expect(api.getHumanDetail("org1", "nonexistent")).rejects.toThrow("Human not found");
  });
});

describe("getRunDetail", () => {
  it("returns valid run detail for existing run", async () => {
    const runId = seedData.runs[0]!.id;
    const res = await api.getRunDetail("org1", runId);
    expect(res.run.id).toBe(runId);
    expect(typeof res.agentName).toBe("string");
    expect(typeof res.projectName).toBe("string");
    expect(typeof res.teamName).toBe("string");
    expect(typeof res.userName).toBe("string");
  });

  it("throws for unknown run", async () => {
    await expect(api.getRunDetail("org1", "nonexistent")).rejects.toThrow("Run not found");
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
