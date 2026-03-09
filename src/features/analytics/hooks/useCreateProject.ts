import { useCallback, useMemo } from "react";
import { useCreateProjectMutation } from "@/store/api";
import type { CreateProjectRequest, CreateProjectResponse } from "@/features/analytics/types";

interface UseCreateProjectReturn {
  create: (request: CreateProjectRequest) => Promise<CreateProjectResponse>;
  loading: boolean;
  error: string | undefined;
  lastResult: CreateProjectResponse | undefined;
}

export function useCreateProject(): UseCreateProjectReturn {
  const [trigger, state] = useCreateProjectMutation();

  const create = useCallback(
    async (request: CreateProjectRequest): Promise<CreateProjectResponse> => {
      const result = await trigger(request).unwrap();
      return result;
    },
    [trigger],
  );

  return useMemo(() => ({
    create,
    loading: state.isLoading,
    error: state.error ? String(state.error) : undefined,
    lastResult: state.data,
  }), [create, state.isLoading, state.error, state.data]);
}
