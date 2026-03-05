import { useQuery } from "@tanstack/react-query";
import { useAppDependencies } from "@/core/di";
import { useDashboardFilters } from "./useDashboardFilters";
import { useQueryKeyFactory } from "./useQueryKeyFactory";
import type { IAnalyticsService } from "../services/IAnalyticsService";
import type { AnalyticsFilters } from "@/features/analytics/types";

type QueryKeyName = keyof ReturnType<typeof useQueryKeyFactory>;

interface DashboardQueryOptions {
  refetchInterval?: number;
  refetchIntervalInBackground?: boolean;
  staleTime?: number;
}

export function useDashboardQuery<T>(
  keyName: QueryKeyName,
  queryFn: (service: IAnalyticsService, filters: AnalyticsFilters) => Promise<T>,
  options?: DashboardQueryOptions,
) {
  const { analyticsService } = useAppDependencies();
  const queryKeys = useQueryKeyFactory();
  const { filters } = useDashboardFilters();

  const query = useQuery({
    queryKey: queryKeys[keyName],
    queryFn: () => queryFn(analyticsService, filters),
    ...options,
  });

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}
