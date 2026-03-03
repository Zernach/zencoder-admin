import { useDashboardFilters } from "./useDashboardFilters";

export function useQueryKeyFactory() {
  const { filters } = useDashboardFilters();

  return {
    overview: ["analytics", "overview", filters] as const,
    usage: ["analytics", "usage", filters] as const,
    outcomes: ["analytics", "outcomes", filters] as const,
    cost: ["analytics", "cost", filters] as const,
    reliability: ["analytics", "reliability", filters] as const,
    governance: ["analytics", "governance", filters] as const,
    agentsHub: ["analytics", "agents-hub", filters] as const,
    liveAgentSessions: ["analytics", "live-agent-sessions", filters] as const,
  };
}
