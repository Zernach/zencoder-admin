import { useCallback, useMemo } from "react";
import { useCreateProjectMutation } from "@/store/api";
import { getApiErrorMessage } from "@/contracts/http/errors";
import type { CreateProjectRequest, CreateProjectResponse } from "@/features/analytics/types";
import { useDashboardOrgId } from "./useDashboardFilters";

type CreateProjectInput = Omit<CreateProjectRequest, "orgId">;

interface UseCreateProjectReturn {
  create: (request: CreateProjectInput) => Promise<CreateProjectResponse>;
  loading: boolean;
  error: string | undefined;
  lastResult: CreateProjectResponse | undefined;
}

export function useCreateProject(): UseCreateProjectReturn {
  const orgId = useDashboardOrgId();
  const [trigger, state] = useCreateProjectMutation();

  const create = useCallback(
    async (request: CreateProjectInput): Promise<CreateProjectResponse> => {
      const result = await trigger({ orgId, ...request }).unwrap();
      return result;
    },
    [orgId, trigger],
  );

  return useMemo(() => ({
    create,
    loading: state.isLoading,
    error: state.error ? getApiErrorMessage(state.error) : undefined,
    lastResult: state.data,
  }), [create, state.isLoading, state.error, state.data]);
}
