import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDependencies } from "@/core/di";
import { useDashboardFilters } from "./useDashboardFilters";
import { useQueryKeyFactory } from "./useQueryKeyFactory";
import type { GovernanceResponse } from "@/features/analytics/types";

/** Sort by timestampIso descending, then id ascending for deterministic ties. */
function sortByTimestampDesc<T extends { timestampIso: string; id: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const cmp = b.timestampIso.localeCompare(a.timestampIso);
    return cmp !== 0 ? cmp : a.id.localeCompare(b.id);
  });
}

export function useGovernanceDashboard() {
  const { analyticsService } = useAppDependencies();
  const queryKeys = useQueryKeyFactory();
  const { filters } = useDashboardFilters();

  const query = useQuery({
    queryKey: queryKeys.governance,
    queryFn: () => analyticsService.getGovernance(filters),
  });

  const data = useMemo((): GovernanceResponse | undefined => {
    if (!query.data) return undefined;
    return {
      ...query.data,
      recentViolations: sortByTimestampDesc(query.data.recentViolations),
      securityEvents: sortByTimestampDesc(query.data.securityEvents),
      policyChanges: sortByTimestampDesc(query.data.policyChanges),
    };
  }, [query.data]);

  return {
    data,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}
