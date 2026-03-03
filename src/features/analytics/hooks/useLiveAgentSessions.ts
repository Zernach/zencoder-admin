import { useQuery } from "@tanstack/react-query";
import { useAppDependencies } from "@/core/di";
import { useDashboardFilters } from "./useDashboardFilters";
import { useQueryKeyFactory } from "./useQueryKeyFactory";

export function useLiveAgentSessions() {
  const { analyticsService } = useAppDependencies();
  const queryKeys = useQueryKeyFactory();
  const { filters } = useDashboardFilters();

  const query = useQuery({
    queryKey: queryKeys.liveAgentSessions,
    queryFn: () => analyticsService.getLiveAgentSessions(filters),
    refetchInterval: 4_000,
    refetchIntervalInBackground: true,
    staleTime: 1_000,
  });

  return {
    data: query.data?.activeSessions ?? [],
    lastUpdatedIso: query.data?.lastUpdatedIso,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}
