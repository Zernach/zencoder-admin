import { useQuery } from "@tanstack/react-query";
import { useAppDependencies } from "@/core/di";
import { useDashboardFilters } from "./useDashboardFilters";
import { useQueryKeyFactory } from "./useQueryKeyFactory";
import { mapOverviewToViewModel } from "../mappers/overviewMappers";

export function useOverviewDashboard() {
  const { analyticsService } = useAppDependencies();
  const queryKeys = useQueryKeyFactory();
  const { filters } = useDashboardFilters();

  const query = useQuery({
    queryKey: queryKeys.overview,
    queryFn: () => analyticsService.getOverview(filters),
  });

  return {
    data: query.data ? mapOverviewToViewModel(query.data) : undefined,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}
