import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDependencies } from "@/core/di";
import { useDashboardFilters } from "./useDashboardFilters";
import { useQueryKeyFactory } from "./useQueryKeyFactory";
import { mapOverviewToViewModel } from "../mappers/overviewMappers";

export function useOverviewDashboard() {
  const { analyticsService } = useAppDependencies();
  const queryKeys = useQueryKeyFactory();
  const { filters } = useDashboardFilters();

  const overviewQuery = useQuery({
    queryKey: queryKeys.overview,
    queryFn: () => analyticsService.getOverview(filters),
  });

  const usageQuery = useQuery({
    queryKey: queryKeys.usage,
    queryFn: () => analyticsService.getUsage(filters),
  });

  const outcomesQuery = useQuery({
    queryKey: queryKeys.outcomes,
    queryFn: () => analyticsService.getOutcomes(filters),
  });

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
    error: overviewQuery.error instanceof Error ? overviewQuery.error.message : undefined,
    refetch: overviewQuery.refetch,
  };
}
