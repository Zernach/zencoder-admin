import { useCallback, useMemo } from "react";
import { useCreateAgentMutation } from "@/store/api";
import { getApiErrorMessage } from "@/contracts/http/errors";
import type { CreateAgentRequest, CreateAgentResponse } from "@/features/analytics/types";
import { useDashboardFilters } from "./useDashboardFilters";

type CreateAgentInput = Omit<CreateAgentRequest, "orgId">;

interface UseCreateAgentReturn {
  create: (request: CreateAgentInput) => Promise<CreateAgentResponse>;
  loading: boolean;
  error: string | undefined;
  lastResult: CreateAgentResponse | undefined;
}

export function useCreateAgent(): UseCreateAgentReturn {
  const { filters } = useDashboardFilters();
  const [trigger, state] = useCreateAgentMutation();

  const create = useCallback(
    async (request: CreateAgentInput): Promise<CreateAgentResponse> => {
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
