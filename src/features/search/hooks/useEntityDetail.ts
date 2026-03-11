import { useMemo } from "react";
import {
  useGetAgentDetailQuery,
  useGetProjectDetailQuery,
  useGetTeamDetailQuery,
  useGetHumanDetailQuery,
  useGetRunDetailQuery,
  useGetRuleDetailQuery,
} from "@/store/api";
import { getApiErrorMessage } from "@/contracts/http/errors";
import { useDashboardOrgId } from "@/features/analytics/hooks/useDashboardFilters";
import type {
  AgentDetailResponse,
  ProjectDetailResponse,
  TeamDetailResponse,
  HumanDetailResponse,
  RunDetailResponse,
  RuleDetailResponse,
} from "@/features/analytics/types";

interface DetailResult<T> {
  data: T | undefined;
  loading: boolean;
  error: string | undefined;
  refetch: () => void;
}

function useStableDetailResult<T>(query: {
  data?: T;
  isLoading: boolean;
  error?: unknown;
  refetch: () => void;
}): DetailResult<T> {
  const errorMessage = query.error ? getApiErrorMessage(query.error) : undefined;
  return useMemo(() => ({
    data: query.data,
    loading: query.isLoading,
    error: errorMessage,
    refetch: query.refetch,
  }), [query.data, query.isLoading, errorMessage, query.refetch]);
}

export function useAgentDetailScreen(agentId: string): DetailResult<AgentDetailResponse> {
  const orgId = useDashboardOrgId();
  const query = useGetAgentDetailQuery(
    { orgId, agentId },
    { skip: !agentId },
  );
  return useStableDetailResult(query);
}

export function useProjectDetailScreen(projectId: string): DetailResult<ProjectDetailResponse> {
  const orgId = useDashboardOrgId();
  const query = useGetProjectDetailQuery(
    { orgId, projectId },
    { skip: !projectId },
  );
  return useStableDetailResult(query);
}

export function useTeamDetailScreen(teamId: string): DetailResult<TeamDetailResponse> {
  const orgId = useDashboardOrgId();
  const query = useGetTeamDetailQuery(
    { orgId, teamId },
    { skip: !teamId },
  );
  return useStableDetailResult(query);
}

export function useHumanDetailScreen(humanId: string): DetailResult<HumanDetailResponse> {
  const orgId = useDashboardOrgId();
  const query = useGetHumanDetailQuery(
    { orgId, humanId },
    { skip: !humanId },
  );
  return useStableDetailResult(query);
}

export function useRunDetailScreen(runId: string): DetailResult<RunDetailResponse> {
  const orgId = useDashboardOrgId();
  const query = useGetRunDetailQuery(
    { orgId, runId },
    { skip: !runId },
  );
  return useStableDetailResult(query);
}

export function useRuleDetailScreen(ruleId: string): DetailResult<RuleDetailResponse> {
  const orgId = useDashboardOrgId();
  const query = useGetRuleDetailQuery(
    { orgId, ruleId },
    { skip: !ruleId },
  );
  return useStableDetailResult(query);
}
