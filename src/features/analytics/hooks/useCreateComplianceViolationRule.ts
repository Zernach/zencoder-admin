import { useCallback } from "react";
import { useCreateComplianceRuleMutation } from "@/store/api";
import type { CreateComplianceRuleRequest, CreateComplianceRuleResponse } from "@/features/analytics/types";

interface UseCreateComplianceViolationRuleReturn {
  create: (request: CreateComplianceRuleRequest) => Promise<CreateComplianceRuleResponse>;
  loading: boolean;
  error: string | undefined;
  lastResult: CreateComplianceRuleResponse | undefined;
}

export function useCreateComplianceViolationRule(): UseCreateComplianceViolationRuleReturn {
  const [trigger, state] = useCreateComplianceRuleMutation();

  const create = useCallback(
    async (request: CreateComplianceRuleRequest): Promise<CreateComplianceRuleResponse> => {
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
