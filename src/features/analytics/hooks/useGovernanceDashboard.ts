import { useMemo, useCallback } from "react";
import type { GovernanceResponse, TimeSeriesPoint } from "@/features/analytics/types";
import { useGetGovernanceQuery, useGetUsageQuery } from "@/store/api";
import { getApiErrorMessage } from "@/contracts/http/errors";
import { useDashboardFilters } from "./useDashboardFilters";

export interface GovernanceDashboardData extends GovernanceResponse {
  activeUsersTrend?: TimeSeriesPoint[];
  wauTrend?: TimeSeriesPoint[];
  mauTrend?: TimeSeriesPoint[];
}

export function useGovernanceDashboard() {
  const { filters } = useDashboardFilters();
  const governanceQuery = useGetGovernanceQuery(filters);
  const usageQuery = useGetUsageQuery(filters);
  const { refetch: refetchGovernance } = governanceQuery;
  const { refetch: refetchUsage } = usageQuery;

  const data = useMemo<GovernanceDashboardData | undefined>(() => {
    if (!governanceQuery.data) return undefined;
    return {
      ...governanceQuery.data,
      activeUsersTrend: usageQuery.data?.activeUsersTrend,
      wauTrend: usageQuery.data?.wauTrend,
      mauTrend: usageQuery.data?.mauTrend,
    };
  }, [governanceQuery.data, usageQuery.data]);

  const refetch = useCallback(async () => {
    await Promise.all([refetchGovernance(), refetchUsage()]);
  }, [refetchGovernance, refetchUsage]);

  return {
    data,
    loading: governanceQuery.isLoading || usageQuery.isLoading,
    error: governanceQuery.error ? getApiErrorMessage(governanceQuery.error) : undefined,
    refetch,
  };
}
