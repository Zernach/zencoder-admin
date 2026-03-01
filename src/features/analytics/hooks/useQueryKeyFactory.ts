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
    projects: ["analytics", "projects", filters] as const,
    runsPage: (
      page: number,
      pageSize: number,
      sortBy: string,
      sortDir: string
    ) =>
      ["analytics", "runs", filters, page, pageSize, sortBy, sortDir] as const,
    runDetail: (runId: string) => ["analytics", "run", runId] as const,
  };
}
