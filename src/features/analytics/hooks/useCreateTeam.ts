import { useCallback } from "react";
import { useCreateTeamMutation } from "@/store/api";
import type { CreateTeamRequest, CreateTeamResponse } from "@/features/analytics/types";

interface UseCreateTeamReturn {
  create: (request: CreateTeamRequest) => Promise<CreateTeamResponse>;
  loading: boolean;
  error: string | undefined;
  lastResult: CreateTeamResponse | undefined;
}

export function useCreateTeam(): UseCreateTeamReturn {
  const [trigger, state] = useCreateTeamMutation();

  const create = useCallback(
    async (request: CreateTeamRequest): Promise<CreateTeamResponse> => {
      const result = await trigger(request).unwrap();
      return result;
    },
    [trigger],
  );

  return {
    create,
    loading: state.isLoading,
    error: state.error ? String(state.error) : undefined,
    lastResult: state.data,
  };
}
