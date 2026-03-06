import { useGetCostQuery } from "@/store/api";
import { useDashboardFilters } from "./useDashboardFilters";

export function useCostDashboard() {
  const { filters } = useDashboardFilters();
  const query = useGetCostQuery(filters);

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error ? String(query.error) : undefined,
    refetch: query.refetch,
  };
}
