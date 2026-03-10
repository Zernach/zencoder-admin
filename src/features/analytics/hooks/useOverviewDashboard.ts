import { useMemo } from "react";
import { useGetOverviewQuery, useGetOutcomesQuery } from "@/store/api";
import { useDashboardFilters } from "./useDashboardFilters";
import { useCurrencyFormatter } from "./useCurrencyFormatter";
import { mapOverviewToViewModel } from "../mappers/overviewMappers";

export function useOverviewDashboard() {
  const { filters } = useDashboardFilters();
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

  return {
    data,
    loading: overviewQuery.isLoading,
    error: overviewQuery.error ? String(overviewQuery.error) : undefined,
    refetch: overviewQuery.refetch,
  };
}
