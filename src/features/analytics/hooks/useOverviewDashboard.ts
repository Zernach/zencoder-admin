import { useMemo } from "react";
import { useGetOverviewQuery, useGetOutcomesQuery } from "@/store/api";
import { getApiErrorMessage } from "@/contracts/http/errors";
import { useActiveDashboardFilters } from "./useDashboardFilters";
import { useCurrencyFormatter } from "./useCurrencyFormatter";
import { mapOverviewToViewModel } from "../mappers/overviewMappers";

export function useOverviewDashboard() {
  const filters = useActiveDashboardFilters();
  const { formatCurrency } = useCurrencyFormatter();

  const overviewQuery = useGetOverviewQuery(filters);
  const outcomesQuery = useGetOutcomesQuery(filters);

  const data = useMemo(
    () =>
      overviewQuery.data
        ? mapOverviewToViewModel(overviewQuery.data, outcomesQuery.data, formatCurrency)
        : undefined,
    [overviewQuery.data, outcomesQuery.data, formatCurrency],
  );

  const errorMessage = overviewQuery.error ? getApiErrorMessage(overviewQuery.error) : undefined;

  return useMemo(() => ({
    data,
    loading: overviewQuery.isLoading,
    error: errorMessage,
    refetch: overviewQuery.refetch,
  }), [data, overviewQuery.isLoading, errorMessage, overviewQuery.refetch]);
}
