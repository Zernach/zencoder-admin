import { useQuery } from "@tanstack/react-query";
import { useAppDependencies } from "@/core/di";
import { useQueryKeyFactory } from "./useQueryKeyFactory";

export function useRunDetail(runId: string) {
  const { analyticsService } = useAppDependencies();
  const queryKeys = useQueryKeyFactory();

  const query = useQuery({
    queryKey: queryKeys.runDetail(runId),
    queryFn: () => analyticsService.getRunDetail("org_zencoder_001", runId),
    enabled: Boolean(runId),
  });

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}
