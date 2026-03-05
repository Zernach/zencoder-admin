import { useQuery } from "@tanstack/react-query";
import { useAppDependencies } from "@/core/di";
import { useDashboardFilters } from "@/features/analytics/hooks/useDashboardFilters";
import type {
  AgentDetailResponse,
  ProjectDetailResponse,
  TeamDetailResponse,
  HumanDetailResponse,
  RunDetailResponse,
} from "@/features/analytics/types";

interface DetailResult<T> {
  data: T | undefined;
  loading: boolean;
  error: string | undefined;
  refetch: () => void;
}

export function useAgentDetailScreen(agentId: string): DetailResult<AgentDetailResponse> {
  const { analyticsService } = useAppDependencies();
  const { filters } = useDashboardFilters();
  const query = useQuery({
    queryKey: ["agentDetail", filters.orgId, agentId],
    queryFn: () => analyticsService.getAgentDetail(filters.orgId, agentId),
    enabled: !!agentId,
  });
  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}

export function useProjectDetailScreen(projectId: string): DetailResult<ProjectDetailResponse> {
  const { analyticsService } = useAppDependencies();
  const { filters } = useDashboardFilters();
  const query = useQuery({
    queryKey: ["projectDetail", filters.orgId, projectId],
    queryFn: () => analyticsService.getProjectDetail(filters.orgId, projectId),
    enabled: !!projectId,
  });
  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}

export function useTeamDetailScreen(teamId: string): DetailResult<TeamDetailResponse> {
  const { analyticsService } = useAppDependencies();
  const { filters } = useDashboardFilters();
  const query = useQuery({
    queryKey: ["teamDetail", filters.orgId, teamId],
    queryFn: () => analyticsService.getTeamDetail(filters.orgId, teamId),
    enabled: !!teamId,
  });
  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}

export function useHumanDetailScreen(humanId: string): DetailResult<HumanDetailResponse> {
  const { analyticsService } = useAppDependencies();
  const { filters } = useDashboardFilters();
  const query = useQuery({
    queryKey: ["humanDetail", filters.orgId, humanId],
    queryFn: () => analyticsService.getHumanDetail(filters.orgId, humanId),
    enabled: !!humanId,
  });
  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}

export function useRunDetailScreen(runId: string): DetailResult<RunDetailResponse> {
  const { analyticsService } = useAppDependencies();
  const { filters } = useDashboardFilters();
  const query = useQuery({
    queryKey: ["runDetail", filters.orgId, runId],
    queryFn: () => analyticsService.getRunDetail(filters.orgId, runId),
    enabled: !!runId,
  });
  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}
