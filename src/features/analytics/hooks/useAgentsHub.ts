import { useGetAgentsHubQuery } from "@/store/api";
import { useDashboardFilters } from "./useDashboardFilters";

export function useAgentsHub() {
  const { filters } = useDashboardFilters();
  const query = useGetAgentsHubQuery(filters);

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error ? String(query.error) : undefined,
    refetch: query.refetch,
  };
}
