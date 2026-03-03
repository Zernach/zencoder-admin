import type { IAnalyticsApi } from "../IAnalyticsApi";
import type {
  AnalyticsFilters,
  OverviewResponse,
  OverviewDeltas,
  UsageResponse,
  OutcomesResponse,
  CostResponse,
  ReliabilityResponse,
  GovernanceResponse,
  AgentsHubResponse,
  LiveAgentSessionsResponse,
  RunListRow,
  TimeSeriesPoint,
  SeedData,
  RunAnomaly,
  KeyValueMetric,
  AgentBreakdownRow,
  ProjectBreakdownRow,
  ProviderCostRow,
  ModelProvider,
  LiveAgentSession,
  SeatUserUsageRow,
} from "@/features/analytics/types";

interface StubConfig {
  latencyMinMs?: number;
  latencyMaxMs?: number;
  debugFailureRate?: number;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)]!;
}

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

const LIVE_TASKS = [
  "Analyzing repository changes",
  "Generating implementation plan",
  "Running focused unit tests",
  "Executing lint and type checks",
  "Refactoring service layer",
  "Applying dashboard UI updates",
  "Validating pull request changes",
  "Summarizing runtime findings",
] as const;

export class StubAnalyticsApi implements IAnalyticsApi {
  private seed: SeedData;
  private latencyMin: number;
  private latencyMax: number;
  private failureRate: number;

  constructor(seedData: SeedData, config: StubConfig = {}) {
    this.seed = seedData;
    this.latencyMin = config.latencyMinMs ?? 250;
    this.latencyMax = config.latencyMaxMs ?? 900;
    this.failureRate = config.debugFailureRate ?? 0;
  }

  private async simulate(): Promise<void> {
    if (this.failureRate > 0 && Math.random() < this.failureRate) {
      throw new Error("StubAnalyticsApi: simulated failure");
    }
    const ms =
      this.latencyMin +
      Math.random() * (this.latencyMax - this.latencyMin);
    await new Promise((r) => setTimeout(r, ms));
  }

  private filterRuns(filters: AnalyticsFilters): RunListRow[] {
    return this.seed.runs.filter((run) => {
      if (run.startedAtIso < filters.timeRange.fromIso) return false;
      if (run.startedAtIso > filters.timeRange.toIso) return false;
      if (filters.teamIds?.length && !filters.teamIds.includes(run.teamId))
        return false;
      if (filters.userIds?.length && !filters.userIds.includes(run.userId))
        return false;
      if (
        filters.projectIds?.length &&
        !filters.projectIds.includes(run.projectId)
      )
        return false;
      if (
        filters.providers?.length &&
        !filters.providers.includes(run.provider)
      )
        return false;
      if (filters.modelIds?.length && !filters.modelIds.includes(run.modelId))
        return false;
      if (filters.statuses?.length && !filters.statuses.includes(run.status))
        return false;
      return true;
    });
  }

  private bucketByDay(
    runs: RunListRow[],
    valueFn: (dayRuns: RunListRow[]) => number
  ): TimeSeriesPoint[] {
    const map = new Map<string, RunListRow[]>();
    for (const run of runs) {
      const day = run.startedAtIso.slice(0, 10);
      const arr = map.get(day);
      if (arr) arr.push(run);
      else map.set(day, [run]);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, dayRuns]) => ({
        tsIso: `${day}T00:00:00.000Z`,
        value: valueFn(dayRuns),
      }));
  }

  /** Compute previous period filters for delta comparisons */
  private previousPeriodFilters(filters: AnalyticsFilters): AnalyticsFilters {
    const fromMs = new Date(filters.timeRange.fromIso).getTime();
    const toMs = new Date(filters.timeRange.toIso).getTime();
    const duration = toMs - fromMs;
    return {
      ...filters,
      timeRange: {
        fromIso: new Date(fromMs - duration).toISOString(),
        toIso: new Date(fromMs).toISOString(),
      },
    };
  }

  /** Percentage change: ((current - prev) / prev) * 100, or 0 if prev=0 */
  private pctChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  }

  async getOverview(filters: AnalyticsFilters): Promise<OverviewResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);
    const total = runs.length || 1;
    const succeeded = runs.filter((r) => r.status === "succeeded").length;
    const totalCost = runs.reduce((s, r) => s + r.costUsd, 0);
    const codexCount = runs.filter((r) => r.provider === "codex").length;
    const claudeCount = runs.filter((r) => r.provider === "claude").length;

    const uniqueUsers = new Set(runs.map((r) => r.userId)).size;
    const seatAdoptionRate = this.seed.users.length
      ? uniqueUsers / this.seed.users.length
      : 0;

    const violations = this.seed.policyViolations.filter(
      (v) =>
        v.timestampIso >= filters.timeRange.fromIso &&
        v.timestampIso <= filters.timeRange.toIso
    );

    // Compute previous-period KPIs for delta calculations
    const prevFilters = this.previousPeriodFilters(filters);
    const prevRuns = this.filterRuns(prevFilters);
    const prevTotal = prevRuns.length || 1;
    const prevSucceeded = prevRuns.filter((r) => r.status === "succeeded").length;
    const prevTotalCost = prevRuns.reduce((s, r) => s + r.costUsd, 0);
    const prevUniqueUsers = new Set(prevRuns.map((r) => r.userId)).size;
    const prevSeatAdoption = this.seed.users.length
      ? prevUniqueUsers / this.seed.users.length
      : 0;
    const prevViolations = this.seed.policyViolations.filter(
      (v) =>
        v.timestampIso >= prevFilters.timeRange.fromIso &&
        v.timestampIso <= prevFilters.timeRange.toIso
    );

    const deltas: OverviewDeltas = {
      seatAdoptionRate: this.pctChange(seatAdoptionRate, prevSeatAdoption),
      runSuccessRate: this.pctChange(succeeded / total, prevSucceeded / prevTotal),
      totalCostUsd: this.pctChange(totalCost, prevTotalCost),
      policyViolationCount: this.pctChange(violations.length, prevViolations.length),
    };

    // Anomalies: top by cost, duration, tokens
    const byCost = [...runs].sort((a, b) => b.costUsd - a.costUsd);
    const byDuration = [...runs].sort((a, b) => b.durationMs - a.durationMs);
    const byTokens = [...runs].sort((a, b) => b.totalTokens - a.totalTokens);

    const anomalies: RunAnomaly[] = [];
    if (byCost[0])
      anomalies.push({
        runId: byCost[0].id,
        type: "highest_cost",
        label: `$${byCost[0].costUsd.toFixed(2)}`,
        value: byCost[0].costUsd,
      });
    if (byDuration[0])
      anomalies.push({
        runId: byDuration[0].id,
        type: "longest_duration",
        label: `${(byDuration[0].durationMs / 1000).toFixed(1)}s`,
        value: byDuration[0].durationMs,
      });
    if (byTokens[0])
      anomalies.push({
        runId: byTokens[0].id,
        type: "highest_tokens",
        label: `${byTokens[0].totalTokens.toLocaleString()} tokens`,
        value: byTokens[0].totalTokens,
      });

    return {
      kpis: {
        seatAdoptionRate,
        runSuccessRate: succeeded / total,
        totalCostUsd: Math.round(totalCost * 100) / 100,
        providerShareCodex: codexCount / total,
        providerShareClaude: claudeCount / total,
        policyViolationCount: violations.length,
      },
      deltas,
      runsTrend: this.bucketByDay(runs, (d) => d.length),
      costTrend: this.bucketByDay(runs, (d) =>
        Math.round(d.reduce((s, r) => s + r.costUsd, 0) * 100) / 100
      ),
      anomalies,
    };
  }

  async getUsage(filters: AnalyticsFilters): Promise<UsageResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);
    const toDate = new Date(filters.timeRange.toIso);
    const d7 = new Date(toDate.getTime() - 7 * 86_400_000).toISOString();
    const d30 = new Date(toDate.getTime() - 30 * 86_400_000).toISOString();

    const usersLast7d = new Set(
      runs.filter((r) => r.startedAtIso >= d7).map((r) => r.userId)
    );
    const usersLast30d = new Set(
      runs.filter((r) => r.startedAtIso >= d30).map((r) => r.userId)
    );
    const seatAdoptionRate = this.seed.users.length
      ? usersLast30d.size / this.seed.users.length
      : 0;

    // Runs per user distribution
    const userRunCounts = new Map<string, number>();
    for (const run of runs) {
      userRunCounts.set(run.userId, (userRunCounts.get(run.userId) ?? 0) + 1);
    }
    const buckets: Record<string, number> = {
      "1-10": 0,
      "11-50": 0,
      "51-100": 0,
      "101-500": 0,
      "500+": 0,
    };
    for (const count of userRunCounts.values()) {
      if (count <= 10) buckets["1-10"]!++;
      else if (count <= 50) buckets["11-50"]!++;
      else if (count <= 100) buckets["51-100"]!++;
      else if (count <= 500) buckets["101-500"]!++;
      else buckets["500+"]!++;
    }
    const runsPerUserDistribution: KeyValueMetric[] = Object.entries(
      buckets
    ).map(([key, value]) => ({ key, value }));

    // Breakdown by team
    const teamMap = new Map<string, RunListRow[]>();
    for (const run of runs) {
      const arr = teamMap.get(run.teamId);
      if (arr) arr.push(run);
      else teamMap.set(run.teamId, [run]);
    }
    const breakdownByTeam = this.seed.teams.map((team) => {
      const teamRuns = teamMap.get(team.id) ?? [];
      const succeeded = teamRuns.filter(
        (r) => r.status === "succeeded"
      ).length;
      return {
        teamId: team.id,
        teamName: team.name,
        activeUsers: new Set(teamRuns.map((r) => r.userId)).size,
        runsStarted: teamRuns.length,
        runSuccessRate: teamRuns.length ? succeeded / teamRuns.length : 0,
      };
    });

    return {
      wau: usersLast7d.size,
      mau: usersLast30d.size,
      activeSeats30d: usersLast30d.size,
      seatAdoptionRate,
      activeUsersTrend: this.bucketByDay(
        runs,
        (d) => new Set(d.map((r) => r.userId)).size
      ),
      runsPerUserDistribution,
      breakdownByTeam,
    };
  }

  async getOutcomes(filters: AnalyticsFilters): Promise<OutcomesResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);
    const succeeded = runs.filter((r) => r.status === "succeeded");

    const prsCreated = succeeded.filter((r) => r.prCreated).length;
    const prsMerged = succeeded.filter((r) => r.prMerged).length;
    const prMergeRate = prsCreated ? prsMerged / prsCreated : 0;

    const withTests = succeeded.filter(
      (r) => r.testsExecuted != null && r.testsExecuted > 0
    );
    const testsPassRate = withTests.length
      ? withTests.reduce(
          (s, r) => s + (r.testsPassed ?? 0) / (r.testsExecuted ?? 1),
          0
        ) / withTests.length
      : 0;

    const codeAcceptanceRate = prMergeRate;
    const reworkRate = Math.max(0, 1 - codeAcceptanceRate) * 0.3;

    // Leaderboard: top 5 teams by PRs merged
    const teamMerges = new Map<string, number>();
    for (const run of succeeded) {
      if (run.prMerged) {
        teamMerges.set(run.teamId, (teamMerges.get(run.teamId) ?? 0) + 1);
      }
    }
    const leaderboard = Array.from(teamMerges.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([teamId, merged]) => {
        const team = this.seed.teams.find((t) => t.id === teamId);
        const teamSucceeded = succeeded.filter((r) => r.teamId === teamId);
        const teamWithTests = teamSucceeded.filter(
          (r) => r.testsExecuted != null && r.testsExecuted > 0
        );
        return {
          key: team?.name ?? teamId,
          prsMerged: merged,
          testsPassRate: teamWithTests.length
            ? teamWithTests.reduce(
                (s, r) =>
                  s + (r.testsPassed ?? 0) / (r.testsExecuted ?? 1),
                0
              ) / teamWithTests.length
            : 0,
          codeAcceptanceRate: teamSucceeded.filter((r) => r.prCreated).length
            ? merged /
              teamSucceeded.filter((r) => r.prCreated).length
            : 0,
        };
      });

    return {
      prsCreated,
      prsMerged,
      prMergeRate,
      medianTimeToMergeHours: 4.2,
      testsPassRate,
      codeAcceptanceRate,
      reworkRate,
      outcomesTrend: this.bucketByDay(
        succeeded,
        (d) => d.filter((r) => r.prMerged).length
      ),
      leaderboard,
    };
  }

  async getCost(filters: AnalyticsFilters): Promise<CostResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);
    const totalCost = runs.reduce((s, r) => s + r.costUsd, 0);
    const succeeded = runs.filter((r) => r.status === "succeeded");

    // Breakdown by project
    const projMap = new Map<string, RunListRow[]>();
    for (const run of runs) {
      const arr = projMap.get(run.projectId);
      if (arr) arr.push(run);
      else projMap.set(run.projectId, [run]);
    }
    const costBreakdown = Array.from(projMap.entries())
      .map(([projId, projRuns]) => {
        const projCost = projRuns.reduce((s, r) => s + r.costUsd, 0);
        const proj = this.seed.projects.find((p) => p.id === projId);
        return {
          key: proj?.name ?? projId,
          totalCostUsd: Math.round(projCost * 100) / 100,
          runsStarted: projRuns.length,
          averageCostPerRunUsd:
            Math.round((projCost / (projRuns.length || 1)) * 10000) / 10000,
          percentOfTotal: totalCost ? projCost / totalCost : 0,
        };
      })
      .sort((a, b) => b.totalCostUsd - a.totalCostUsd);

    // Provider breakdown
    const providerMap = new Map<ModelProvider, { cost: number; count: number; tokens: number }>();
    for (const run of runs) {
      const entry = providerMap.get(run.provider) ?? { cost: 0, count: 0, tokens: 0 };
      entry.cost += run.costUsd;
      entry.count++;
      entry.tokens += run.totalTokens;
      providerMap.set(run.provider, entry);
    }
    const providerBreakdown: ProviderCostRow[] = (["codex", "claude", "other"] as ModelProvider[])
      .filter((p) => providerMap.has(p))
      .map((provider) => {
        const entry = providerMap.get(provider)!;
        return {
          provider,
          totalCostUsd: Math.round(entry.cost * 100) / 100,
          runCount: entry.count,
          totalTokens: entry.tokens,
          percentOfTotal: totalCost ? entry.cost / totalCost : 0,
        };
      });

    // Budget
    const dayCount = this.bucketByDay(runs, () => 0).length || 1;
    const dailySpend = totalCost / dayCount;
    const budgetUsd = 60000;
    const forecastMonthEndUsd = dailySpend * 30;

    return {
      totalCostUsd: Math.round(totalCost * 100) / 100,
      averageCostPerRunUsd:
        Math.round((totalCost / (runs.length || 1)) * 10000) / 10000,
      costPerSuccessfulRunUsd:
        Math.round((totalCost / (succeeded.length || 1)) * 10000) / 10000,
      costTrend: this.bucketByDay(runs, (d) =>
        Math.round(d.reduce((s, r) => s + r.costUsd, 0) * 100) / 100
      ),
      costBreakdown,
      providerBreakdown,
      budget: {
        budgetUsd,
        spentUsd: Math.round(totalCost * 100) / 100,
        remainingUsd: Math.round((budgetUsd - totalCost) * 100) / 100,
        forecastMonthEndUsd: Math.round(forecastMonthEndUsd * 100) / 100,
      },
    };
  }

  async getReliability(
    filters: AnalyticsFilters
  ): Promise<ReliabilityResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);
    const total = runs.length || 1;
    const succeeded = runs.filter((r) => r.status === "succeeded").length;
    const failed = runs.filter((r) => r.status === "failed").length;

    const durations = runs.map((r) => r.durationMs).sort((a, b) => a - b);
    const queueWaits = runs.map((r) => r.queueWaitMs).sort((a, b) => a - b);

    // Failure category breakdown
    const catMap = new Map<string, number>();
    for (const run of runs) {
      if (run.failureCategory) {
        catMap.set(
          run.failureCategory,
          (catMap.get(run.failureCategory) ?? 0) + 1
        );
      }
    }
    const failureCategoryBreakdown: KeyValueMetric[] = Array.from(
      catMap.entries()
    ).map(([key, value]) => ({ key, value }));

    // Peak concurrency: approximate from runs per minute
    const minuteMap = new Map<string, number>();
    for (const run of runs) {
      const min = run.startedAtIso.slice(0, 16);
      minuteMap.set(min, (minuteMap.get(min) ?? 0) + 1);
    }
    const peakConcurrency = Math.max(0, ...minuteMap.values());

    // Agent breakdown
    const agentRunMap = new Map<string, RunListRow[]>();
    for (const run of runs) {
      const arr = agentRunMap.get(run.agentId);
      if (arr) arr.push(run);
      else agentRunMap.set(run.agentId, [run]);
    }
    const agentBreakdown: AgentBreakdownRow[] = this.seed.agents
      .map((agent) => {
        const agentRuns = agentRunMap.get(agent.id) ?? [];
        if (agentRuns.length === 0) return null;
        const agentSucceeded = agentRuns.filter((r) => r.status === "succeeded").length;
        const project = this.seed.projects.find((p) => p.id === agent.projectId);
        return {
          agentId: agent.id,
          agentName: agent.name,
          projectName: project?.name ?? agent.projectId,
          totalRuns: agentRuns.length,
          successRate: agentRuns.length ? agentSucceeded / agentRuns.length : 0,
          avgDurationMs: Math.round(
            agentRuns.reduce((s, r) => s + r.durationMs, 0) / agentRuns.length
          ),
          totalCostUsd: Math.round(
            agentRuns.reduce((s, r) => s + r.costUsd, 0) * 100
          ) / 100,
        };
      })
      .filter((row): row is AgentBreakdownRow => row !== null)
      .sort((a, b) => b.totalRuns - a.totalRuns);

    return {
      runSuccessRate: succeeded / total,
      errorRate: failed / total,
      p50RunDurationMs: percentile(durations, 50),
      p95RunDurationMs: percentile(durations, 95),
      p95QueueWaitMs: percentile(queueWaits, 95),
      peakConcurrency,
      failureCategoryBreakdown,
      reliabilityTrend: this.bucketByDay(runs, (d) => {
        const s = d.filter((r) => r.status === "succeeded").length;
        return d.length ? s / d.length : 0;
      }),
      agentBreakdown,
    };
  }

  async getGovernance(
    filters: AnalyticsFilters
  ): Promise<GovernanceResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);

    const violations = this.seed.policyViolations.filter(
      (v) =>
        v.timestampIso >= filters.timeRange.fromIso &&
        v.timestampIso <= filters.timeRange.toIso
    );
    const secEvents = this.seed.securityEvents.filter(
      (e) =>
        e.timestampIso >= filters.timeRange.fromIso &&
        e.timestampIso <= filters.timeRange.toIso
    );
    const changes = this.seed.policyChanges.filter(
      (c) =>
        c.timestampIso >= filters.timeRange.fromIso &&
        c.timestampIso <= filters.timeRange.toIso
    );

    // Violations by team (via agentId -> projectId -> teamId)
    const teamViolMap = new Map<string, number>();
    for (const v of violations) {
      const agent = this.seed.agents.find((a) => a.id === v.agentId);
      if (agent) {
        const project = this.seed.projects.find(
          (p) => p.id === agent.projectId
        );
        if (project) {
          const team = this.seed.teams.find((t) => t.id === project.teamId);
          const name = team?.name ?? project.teamId;
          teamViolMap.set(name, (teamViolMap.get(name) ?? 0) + 1);
        }
      }
    }
    const violationsByTeam: KeyValueMetric[] = Array.from(
      teamViolMap.entries()
    ).map(([key, value]) => ({ key, value }));

    const blockedNetworkAttempts = violations.filter((v) =>
      v.reason.toLowerCase().includes("unauthorized")
    ).length;

    const teamNameById = new Map(this.seed.teams.map((team) => [team.id, team.name]));
    const userUsageMap = new Map<string, { runsCount: number; totalTokens: number; totalCostUsd: number }>();
    for (const run of runs) {
      const usage = userUsageMap.get(run.userId) ?? {
        runsCount: 0,
        totalTokens: 0,
        totalCostUsd: 0,
      };
      usage.runsCount += 1;
      usage.totalTokens += run.totalTokens;
      usage.totalCostUsd += run.costUsd;
      userUsageMap.set(run.userId, usage);
    }

    const seatUserUsage: SeatUserUsageRow[] = Array.from(userUsageMap.entries())
      .map(([userId, usage]) => {
        const user = this.seed.users.find((seedUser) => seedUser.id === userId);
        if (!user) return null;
        return {
          userId,
          fullName: user.name,
          teamName: teamNameById.get(user.teamId) ?? user.teamId,
          runsCount: usage.runsCount,
          totalTokens: usage.totalTokens,
          totalCostUsd: Math.round(usage.totalCostUsd * 100) / 100,
        };
      })
      .filter((row): row is SeatUserUsageRow => row !== null)
      .sort((a, b) => {
        if (b.runsCount !== a.runsCount) return b.runsCount - a.runsCount;
        if (b.totalTokens !== a.totalTokens) return b.totalTokens - a.totalTokens;
        if (b.totalCostUsd !== a.totalCostUsd) return b.totalCostUsd - a.totalCostUsd;
        return a.fullName.localeCompare(b.fullName);
      });

    return {
      policyViolationCount: violations.length,
      policyViolationRate: runs.length
        ? violations.length / runs.length
        : 0,
      blockedNetworkAttempts,
      auditEventsCount: changes.length + violations.length,
      violationsByTeam,
      recentViolations: violations
        .sort((a, b) => {
          const cmp = b.timestampIso.localeCompare(a.timestampIso);
          return cmp !== 0 ? cmp : a.id.localeCompare(b.id);
        })
        .slice(0, 20),
      securityEvents: secEvents
        .sort((a, b) => {
          const cmp = b.timestampIso.localeCompare(a.timestampIso);
          return cmp !== 0 ? cmp : a.id.localeCompare(b.id);
        })
        .slice(0, 20),
      complianceItems: this.seed.complianceItems,
      policyChanges: changes
        .sort((a, b) => {
          const cmp = b.timestampIso.localeCompare(a.timestampIso);
          return cmp !== 0 ? cmp : a.id.localeCompare(b.id);
        })
        .slice(0, 20),
      seatUserUsage,
    };
  }

  async getAgentsHub(filters: AnalyticsFilters): Promise<AgentsHubResponse> {
    await this.simulate();
    const runs = this.filterRuns(filters);
    const total = runs.length || 1;
    const succeeded = runs.filter((r) => r.status === "succeeded").length;
    const failed = runs.filter((r) => r.status === "failed").length;
    const totalCost = runs.reduce((s, r) => s + r.costUsd, 0);

    const durations = runs.map((r) => r.durationMs).sort((a, b) => a - b);
    const queueWaits = runs.map((r) => r.queueWaitMs).sort((a, b) => a - b);

    // Failure category breakdown
    const catMap = new Map<string, number>();
    for (const run of runs) {
      if (run.failureCategory) {
        catMap.set(run.failureCategory, (catMap.get(run.failureCategory) ?? 0) + 1);
      }
    }
    const failureCategoryBreakdown: KeyValueMetric[] = Array.from(catMap.entries()).map(
      ([key, value]) => ({ key, value })
    );

    // Peak concurrency
    const minuteMap = new Map<string, number>();
    for (const run of runs) {
      const min = run.startedAtIso.slice(0, 16);
      minuteMap.set(min, (minuteMap.get(min) ?? 0) + 1);
    }
    const peakConcurrency = Math.max(0, ...minuteMap.values());

    // Agent breakdown
    const agentRunMap = new Map<string, RunListRow[]>();
    for (const run of runs) {
      const arr = agentRunMap.get(run.agentId);
      if (arr) arr.push(run);
      else agentRunMap.set(run.agentId, [run]);
    }
    const agentBreakdown: AgentBreakdownRow[] = this.seed.agents
      .map((agent) => {
        const agentRuns = agentRunMap.get(agent.id) ?? [];
        if (agentRuns.length === 0) return null;
        const agentSucceeded = agentRuns.filter((r) => r.status === "succeeded").length;
        const project = this.seed.projects.find((p) => p.id === agent.projectId);
        return {
          agentId: agent.id,
          agentName: agent.name,
          projectName: project?.name ?? agent.projectId,
          totalRuns: agentRuns.length,
          successRate: agentRuns.length ? agentSucceeded / agentRuns.length : 0,
          avgDurationMs: Math.round(
            agentRuns.reduce((s, r) => s + r.durationMs, 0) / agentRuns.length
          ),
          totalCostUsd: Math.round(agentRuns.reduce((s, r) => s + r.costUsd, 0) * 100) / 100,
        };
      })
      .filter((row): row is AgentBreakdownRow => row !== null)
      .sort((a, b) => b.totalRuns - a.totalRuns);

    // Project breakdown
    const projRunMap = new Map<string, RunListRow[]>();
    for (const run of runs) {
      const arr = projRunMap.get(run.projectId);
      if (arr) arr.push(run);
      else projRunMap.set(run.projectId, [run]);
    }
    const projAgentCount = new Map<string, Set<string>>();
    for (const run of runs) {
      const set = projAgentCount.get(run.projectId) ?? new Set();
      set.add(run.agentId);
      projAgentCount.set(run.projectId, set);
    }
    const projectBreakdown: ProjectBreakdownRow[] = this.seed.projects
      .map((project) => {
        const projRuns = projRunMap.get(project.id) ?? [];
        if (projRuns.length === 0) return null;
        const projSucceeded = projRuns.filter((r) => r.status === "succeeded").length;
        const projCost = projRuns.reduce((s, r) => s + r.costUsd, 0);
        const team = this.seed.teams.find((t) => t.id === project.teamId);
        return {
          projectId: project.id,
          projectName: project.name,
          teamName: team?.name ?? project.teamId,
          totalRuns: projRuns.length,
          successRate: projRuns.length ? projSucceeded / projRuns.length : 0,
          totalCostUsd: Math.round(projCost * 100) / 100,
          avgCostPerRunUsd: Math.round((projCost / projRuns.length) * 10000) / 10000,
          agentCount: projAgentCount.get(project.id)?.size ?? 0,
        };
      })
      .filter((row): row is ProjectBreakdownRow => row !== null)
      .sort((a, b) => b.totalRuns - a.totalRuns);
    const activeProjects = projectBreakdown.length;

    // Recent runs (latest 25)
    const recentRuns = [...runs]
      .sort((a, b) => b.startedAtIso.localeCompare(a.startedAtIso))
      .slice(0, 25);

    return {
      runSuccessRate: succeeded / total,
      errorRate: failed / total,
      p50RunDurationMs: percentile(durations, 50),
      p95RunDurationMs: percentile(durations, 95),
      p95QueueWaitMs: percentile(queueWaits, 95),
      peakConcurrency,
      failureCategoryBreakdown,
      reliabilityTrend: this.bucketByDay(runs, (d) => {
        const s = d.filter((r) => r.status === "succeeded").length;
        return d.length ? s / d.length : 0;
      }),
      agentBreakdown,
      totalProjects: this.seed.projects.length,
      activeProjects,
      totalRuns: runs.length,
      overallSuccessRate: runs.length ? succeeded / runs.length : 0,
      totalCostUsd: Math.round(totalCost * 100) / 100,
      projectBreakdown,
      recentRuns,
    };
  }

  async getLiveAgentSessions(filters: AnalyticsFilters): Promise<LiveAgentSessionsResponse> {
    await this.simulate();
    const filteredRuns = this.filterRuns({ ...filters, statuses: ["queued", "running"] });
    const orgWideActive = this.seed.runs.filter(
      (run) => run.status === "queued" || run.status === "running"
    );
    const sourcePool = filteredRuns.length > 0 ? filteredRuns : orgWideActive;
    const safePool = sourcePool.length > 0 ? sourcePool : this.seed.runs;
    if (safePool.length === 0) {
      return {
        activeSessions: [],
        lastUpdatedIso: new Date().toISOString(),
      };
    }

    const baseSessions: LiveAgentSession[] = safePool
      .sort((a, b) => b.startedAtIso.localeCompare(a.startedAtIso))
      .slice(0, 10)
      .map((run) => {
        const agent = this.seed.agents.find((item) => item.id === run.agentId);
        const project = this.seed.projects.find((item) => item.id === run.projectId);
        const user = this.seed.users.find((item) => item.id === run.userId);
        const taskIndex = hashString(run.id + run.agentId) % LIVE_TASKS.length;

        return {
          sessionId: `seed_${run.id}`,
          runId: run.id,
          agentId: run.agentId,
          agentName: agent?.name ?? run.agentId,
          projectName: project?.name ?? run.projectId,
          userName: user?.name ?? run.userId,
          status: run.status === "queued" ? "queued" : "running",
          startedAtIso: run.startedAtIso,
          currentTask: LIVE_TASKS[taskIndex]!,
        };
      });

    const nowMs = Date.now();
    const window = Math.floor(nowMs / 12_000);
    const syntheticCount = 6 + (window % 5);
    const fallbackRun = safePool[0]!;
    const syntheticSessions: LiveAgentSession[] = Array.from({ length: syntheticCount }).map(
      (_, index) => {
        const run = safePool[(window + index) % safePool.length] ?? fallbackRun;
        const agent = this.seed.agents.find((item) => item.id === run.agentId) ?? this.seed.agents[0]!;
        const project = this.seed.projects.find((item) => item.id === run.projectId) ?? this.seed.projects[0]!;
        const user = this.seed.users.find((item) => item.id === run.userId) ?? this.seed.users[0]!;
        const taskIndex = (window + index) % LIVE_TASKS.length;
        const startedAgoMs = 40_000 + index * 55_000 + ((window + index) % 5) * 10_000;

        return {
          sessionId: `live_${window}_${index}_${agent.id}`,
          runId: `live_run_${window}_${index}`,
          agentId: agent.id,
          agentName: agent.name,
          projectName: project.name,
          userName: user.name,
          status: (window + index) % 4 === 0 ? "queued" : "running",
          startedAtIso: new Date(nowMs - startedAgoMs).toISOString(),
          currentTask: LIVE_TASKS[taskIndex]!,
        };
      }
    );

    const sessionsById = new Map<string, LiveAgentSession>();
    for (const session of [...syntheticSessions, ...baseSessions]) {
      sessionsById.set(session.sessionId, session);
    }
    const sessions = Array.from(sessionsById.values())
      .sort((a, b) => b.startedAtIso.localeCompare(a.startedAtIso))
      .slice(0, 18);

    return {
      activeSessions: sessions,
      lastUpdatedIso: new Date().toISOString(),
    };
  }

}
