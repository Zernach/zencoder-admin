import { useGetCostQuery } from "@/store/api";
import { getApiErrorMessage } from "@/contracts/http/errors";
import { useDashboardFilters } from "./useDashboardFilters";

export function useCostDashboard() {
  const { filters } = useDashboardFilters();
  const query = useGetCostQuery(filters);

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error ? getApiErrorMessage(query.error) : undefined,
    refetch: query.refetch,
  };
}
