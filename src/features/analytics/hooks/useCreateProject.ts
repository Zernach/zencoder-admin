import { useCallback, useState } from "react";
import { useAppDependencies } from "@/core/di";
import type { CreateProjectRequest, CreateProjectResponse } from "@/features/analytics/types";

interface UseCreateProjectReturn {
  create: (request: CreateProjectRequest) => Promise<CreateProjectResponse>;
  loading: boolean;
  error: string | undefined;
  lastResult: CreateProjectResponse | undefined;
}

export function useCreateProject(): UseCreateProjectReturn {
  const { analyticsService } = useAppDependencies();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [lastResult, setLastResult] = useState<CreateProjectResponse | undefined>(undefined);

  const create = useCallback(
    async (request: CreateProjectRequest): Promise<CreateProjectResponse> => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await analyticsService.createProject(request);
        setLastResult(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create project";
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
