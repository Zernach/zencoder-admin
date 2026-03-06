import { useGetGovernanceQuery } from "@/store/api";
import { useDashboardFilters } from "./useDashboardFilters";

export function useGovernanceDashboard() {
  const { filters } = useDashboardFilters();
  const query = useGetGovernanceQuery(filters);

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error ? String(query.error) : undefined,
    refetch: query.refetch,
  };
}
