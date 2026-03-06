import {
  useGetAgentDetailQuery,
  useGetProjectDetailQuery,
  useGetTeamDetailQuery,
  useGetHumanDetailQuery,
  useGetRunDetailQuery,
} from "@/store/api";
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
  const { filters } = useDashboardFilters();
  const query = useGetAgentDetailQuery(
    { orgId: filters.orgId, entityId: agentId },
    { skip: !agentId },
  );
  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error ? String(query.error) : undefined,
    refetch: query.refetch,
  };
}

export function useProjectDetailScreen(projectId: string): DetailResult<ProjectDetailResponse> {
  const { filters } = useDashboardFilters();
  const query = useGetProjectDetailQuery(
    { orgId: filters.orgId, entityId: projectId },
    { skip: !projectId },
  );
  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error ? String(query.error) : undefined,
    refetch: query.refetch,
  };
}

export function useTeamDetailScreen(teamId: string): DetailResult<TeamDetailResponse> {
  const { filters } = useDashboardFilters();
  const query = useGetTeamDetailQuery(
    { orgId: filters.orgId, entityId: teamId },
    { skip: !teamId },
  );
  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error ? String(query.error) : undefined,
    refetch: query.refetch,
  };
}

export function useHumanDetailScreen(humanId: string): DetailResult<HumanDetailResponse> {
  const { filters } = useDashboardFilters();
  const query = useGetHumanDetailQuery(
    { orgId: filters.orgId, entityId: humanId },
    { skip: !humanId },
  );
  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error ? String(query.error) : undefined,
    refetch: query.refetch,
  };
}

export function useRunDetailScreen(runId: string): DetailResult<RunDetailResponse> {
  const { filters } = useDashboardFilters();
  const query = useGetRunDetailQuery(
    { orgId: filters.orgId, entityId: runId },
    { skip: !runId },
  );
  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error ? String(query.error) : undefined,
    refetch: query.refetch,
  };
}
