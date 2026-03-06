import { useMemo } from "react";
import { useGetOverviewQuery, useGetUsageQuery, useGetOutcomesQuery } from "@/store/api";
import { useDashboardFilters } from "./useDashboardFilters";
import { mapOverviewToViewModel } from "../mappers/overviewMappers";

export function useOverviewDashboard() {
  const { filters } = useDashboardFilters();

  const overviewQuery = useGetOverviewQuery(filters);
  const usageQuery = useGetUsageQuery(filters);
  const outcomesQuery = useGetOutcomesQuery(filters);

  const data = useMemo(
    () =>
      overviewQuery.data
        ? mapOverviewToViewModel(overviewQuery.data, usageQuery.data, outcomesQuery.data)
        : undefined,
    [overviewQuery.data, usageQuery.data, outcomesQuery.data],
  );

  return {
    data,
    loading: overviewQuery.isLoading,
    error: overviewQuery.error ? String(overviewQuery.error) : undefined,
    refetch: overviewQuery.refetch,
  };
}
