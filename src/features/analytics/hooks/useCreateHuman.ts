import { useCallback } from "react";
import { useCreateSeatMutation } from "@/store/api";
import type { CreateSeatRequest, CreateSeatResponse } from "@/features/analytics/types";

interface UseCreateHumanReturn {
  create: (request: CreateSeatRequest) => Promise<CreateSeatResponse>;
  loading: boolean;
  error: string | undefined;
  lastResult: CreateSeatResponse | undefined;
}

export function useCreateHuman(): UseCreateHumanReturn {
  const [trigger, state] = useCreateSeatMutation();

  const create = useCallback(
    async (request: CreateSeatRequest): Promise<CreateSeatResponse> => {
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
