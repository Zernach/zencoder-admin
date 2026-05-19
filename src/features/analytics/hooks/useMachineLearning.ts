import { useMemo } from "react";
import { useGetMachineLearningQuery } from "@/store/api";
import { getApiErrorMessage } from "@/contracts/http/errors";
import { useActiveDashboardFilters } from "./useDashboardFilters";

/**
 * View-model hook for the Machine Learning section of the Systems screen.
 * Wraps the RTK Query endpoint and exposes the shared `{ data, loading, error, refetch }` shape.
 */
export function useMachineLearning() {
  const filters = useActiveDashboardFilters();
  const query = useGetMachineLearningQuery(filters);
  const errorMessage = query.error ? getApiErrorMessage(query.error) : undefined;

  return useMemo(() => ({
    data: query.data,
    loading: query.isLoading,
    error: errorMessage,
    refetch: query.refetch,
  }), [query.data, query.isLoading, errorMessage, query.refetch]);
}
