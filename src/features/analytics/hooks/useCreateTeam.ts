import { useCallback, useState } from "react";
import { useAppDependencies } from "@/core/di";
import type { CreateTeamRequest, CreateTeamResponse } from "@/features/analytics/types";

interface UseCreateTeamReturn {
  create: (request: CreateTeamRequest) => Promise<CreateTeamResponse>;
  loading: boolean;
  error: string | undefined;
  lastResult: CreateTeamResponse | undefined;
}

export function useCreateTeam(): UseCreateTeamReturn {
  const { analyticsService } = useAppDependencies();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [lastResult, setLastResult] = useState<CreateTeamResponse | undefined>(undefined);

  const create = useCallback(
    async (request: CreateTeamRequest): Promise<CreateTeamResponse> => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await analyticsService.createTeam(request);
        setLastResult(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create team";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [analyticsService],
  );

  return { create, loading, error, lastResult };
}
