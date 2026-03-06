import { useCallback, useState } from "react";
import { useAppDependencies } from "@/core/di";
import type { CreateSeatRequest, CreateSeatResponse } from "@/features/analytics/types";

interface UseCreateHumanReturn {
  create: (request: CreateSeatRequest) => Promise<CreateSeatResponse>;
  loading: boolean;
  error: string | undefined;
  lastResult: CreateSeatResponse | undefined;
}

export function useCreateHuman(): UseCreateHumanReturn {
  const { analyticsService } = useAppDependencies();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [lastResult, setLastResult] = useState<CreateSeatResponse | undefined>(undefined);

  const create = useCallback(
    async (request: CreateSeatRequest): Promise<CreateSeatResponse> => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await analyticsService.createSeat(request);
        setLastResult(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create seat";
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
