import { useCallback, useMemo } from "react";
import { useCreateEvaluationMutation } from "@/store/api";
import { getApiErrorMessage } from "@/contracts/http/errors";
import type { CreateEvaluationRequest, CreateEvaluationResponse } from "@/features/analytics/types";
import { useDashboardOrgId } from "./useDashboardFilters";

type CreateEvaluationInput = Omit<CreateEvaluationRequest, "orgId">;

interface UseCreateEvaluationReturn {
  create: (request: CreateEvaluationInput) => Promise<CreateEvaluationResponse>;
  loading: boolean;
  error: string | undefined;
  lastResult: CreateEvaluationResponse | undefined;
}

export function useCreateEvaluation(): UseCreateEvaluationReturn {
  const orgId = useDashboardOrgId();
  const [trigger, state] = useCreateEvaluationMutation();

  const create = useCallback(
    async (request: CreateEvaluationInput): Promise<CreateEvaluationResponse> => {
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
