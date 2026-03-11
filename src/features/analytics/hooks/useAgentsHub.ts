import { useMemo } from "react";
import { useGetAgentsHubQuery } from "@/store/api";
import { getApiErrorMessage } from "@/contracts/http/errors";
import { useActiveDashboardFilters } from "./useDashboardFilters";

export function useAgentsHub() {
  const filters = useActiveDashboardFilters();
  const query = useGetAgentsHubQuery(filters);
  const errorMessage = query.error ? getApiErrorMessage(query.error) : undefined;

  return useMemo(() => ({
    data: query.data,
    loading: query.isLoading,
    error: errorMessage,
    refetch: query.refetch,
  }), [query.data, query.isLoading, errorMessage, query.refetch]);
}
