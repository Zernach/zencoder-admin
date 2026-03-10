import { useCallback, useMemo } from "react";
import { useCreateAgentMutation } from "@/store/api";
import type { CreateAgentRequest, CreateAgentResponse } from "@/features/analytics/types";

interface UseCreateAgentReturn {
  create: (request: CreateAgentRequest) => Promise<CreateAgentResponse>;
  loading: boolean;
  error: string | undefined;
  lastResult: CreateAgentResponse | undefined;
}

export function useCreateAgent(): UseCreateAgentReturn {
  const [trigger, state] = useCreateAgentMutation();

  const create = useCallback(
    async (request: CreateAgentRequest): Promise<CreateAgentResponse> => {
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
