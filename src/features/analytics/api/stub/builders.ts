import type {
  RunListRow,
  Agent,
  Project,
  Team,
  AgentBreakdownRow,
  ProjectBreakdownRow,
  KeyValueMetric,
  FailureCategoryMetric,
} from "@/features/analytics/types";
import { round2, round4 } from "../../utils/metricFormulas";
import { groupBy, countBy, sumField, safeRate, countSucceeded } from "./helpers";

export function buildAgentBreakdown(
  runs: RunListRow[],
  agents: Agent[],
  projects: Project[],
): AgentBreakdownRow[] {
  const runsByAgent = groupBy(runs, (r) => r.agentId);
  return agents
    .map((agent) => {
      const agentRuns = runsByAgent.get(agent.id) ?? [];
      if (agentRuns.length === 0) return null;
      const project = projects.find((p) => p.id === agent.projectId);
      return {
        agentId: agent.id,
        agentName: agent.name,
        projectId: agent.projectId,
        projectName: project?.name ?? agent.projectId,
        totalRuns: agentRuns.length,
        successRate: safeRate(countSucceeded(agentRuns), agentRuns.length),
        avgDurationMs: Math.round(sumField(agentRuns, "durationMs") / agentRuns.length),
        totalCostUsd: round2(sumField(agentRuns, "costUsd")),
      };
    })
    .filter((row): row is AgentBreakdownRow => row !== null)
    .sort((a, b) => b.totalRuns - a.totalRuns);
}

export function buildProjectBreakdown(
  runs: RunListRow[],
  projects: Project[],
  teams: Team[],
): ProjectBreakdownRow[] {
  const runsByProject = groupBy(runs, (r) => r.projectId);
  const agentsByProject = new Map<string, Set<string>>();
  for (const run of runs) {
    const set = agentsByProject.get(run.projectId) ?? new Set();
    set.add(run.agentId);
    agentsByProject.set(run.projectId, set);
  }

  return projects
    .map((project) => {
      const projRuns = runsByProject.get(project.id) ?? [];
      if (projRuns.length === 0) return null;
      const projCost = sumField(projRuns, "costUsd");
      const team = teams.find((t) => t.id === project.teamId);
      return {
        projectId: project.id,
        projectName: project.name,
        teamId: project.teamId,
        teamName: team?.name ?? project.teamId,
        totalRuns: projRuns.length,
        successRate: safeRate(countSucceeded(projRuns), projRuns.length),
        totalCostUsd: round2(projCost),
        avgCostPerRunUsd: round4(projCost / projRuns.length),
        agentCount: agentsByProject.get(project.id)?.size ?? 0,
      };
    })
    .filter((row): row is ProjectBreakdownRow => row !== null)
    .sort((a, b) => b.totalRuns - a.totalRuns);
}

export function buildFailureCategoryBreakdown(
  runs: RunListRow[],
  agents: Agent[],
): FailureCategoryMetric[] {
  const agentMap = new Map(agents.map((a) => [a.id, a.name]));
  const categoryRuns = groupBy(runs, (r) => r.failureCategory ?? "none");
  return Array.from(categoryRuns.entries())
    .filter(([key]) => key !== "none")
    .map(([key, catRuns]) => {
      const agentCounts = countBy(catRuns, (r) => r.agentId);
      const agentBreakdown = Array.from(agentCounts.entries())
        .map(([agentId, count]) => ({
          key: agentMap.get(agentId) ?? agentId,
          value: count,
        }))
        .sort((a, b) => b.value - a.value);
      return { key, value: catRuns.length, agentBreakdown };
    });
}

export function computePeakConcurrency(runs: RunListRow[]): number {
  const minuteCounts = countBy(runs, (r) => r.startedAtIso.slice(0, 16));
  return Math.max(0, ...minuteCounts.values());
}
