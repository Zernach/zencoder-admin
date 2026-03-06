import { useGetLiveAgentSessionsQuery } from "@/store/api";
import { useDashboardFilters } from "./useDashboardFilters";

export function useLiveAgentSessions() {
  const { filters } = useDashboardFilters();
  const { data, isLoading, error, refetch } = useGetLiveAgentSessionsQuery(filters, {
    pollingInterval: 4_000,
  });

  return {
    data: data?.activeSessions ?? [],
    lastUpdatedIso: data?.lastUpdatedIso,
    loading: isLoading,
    error: error ? String(error) : undefined,
    refetch,
  };
}
