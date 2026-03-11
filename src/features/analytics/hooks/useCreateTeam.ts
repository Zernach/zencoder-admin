import { useCallback, useMemo } from "react";
import { useCreateTeamMutation } from "@/store/api";
import { getApiErrorMessage } from "@/contracts/http/errors";
import type { CreateTeamRequest, CreateTeamResponse } from "@/features/analytics/types";
import { useDashboardFilters } from "./useDashboardFilters";

type CreateTeamInput = Omit<CreateTeamRequest, "orgId">;

interface UseCreateTeamReturn {
  create: (request: CreateTeamInput) => Promise<CreateTeamResponse>;
  loading: boolean;
  error: string | undefined;
  lastResult: CreateTeamResponse | undefined;
}

export function useCreateTeam(): UseCreateTeamReturn {
  const { filters } = useDashboardFilters();
  const [trigger, state] = useCreateTeamMutation();

  const create = useCallback(
    async (request: CreateTeamInput): Promise<CreateTeamResponse> => {
      const result = await trigger({ orgId: filters.orgId, ...request }).unwrap();
      return result;
    },
    [filters.orgId, trigger],
  );

  return useMemo(() => ({
    create,
    loading: state.isLoading,
    error: state.error ? getApiErrorMessage(state.error) : undefined,
    lastResult: state.data,
  }), [create, state.isLoading, state.error, state.data]);
}
