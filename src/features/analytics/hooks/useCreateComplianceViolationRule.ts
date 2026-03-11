import { useCallback, useMemo } from "react";
import { useCreateComplianceRuleMutation } from "@/store/api";
import { getApiErrorMessage } from "@/contracts/http/errors";
import type { CreateComplianceRuleRequest, CreateComplianceRuleResponse } from "@/features/analytics/types";
import { useDashboardFilters } from "./useDashboardFilters";

type CreateComplianceRuleInput = Omit<CreateComplianceRuleRequest, "orgId">;

interface UseCreateComplianceViolationRuleReturn {
  create: (request: CreateComplianceRuleInput) => Promise<CreateComplianceRuleResponse>;
  loading: boolean;
  error: string | undefined;
  lastResult: CreateComplianceRuleResponse | undefined;
}

export function useCreateComplianceViolationRule(): UseCreateComplianceViolationRuleReturn {
  const { filters } = useDashboardFilters();
  const [trigger, state] = useCreateComplianceRuleMutation();

  const create = useCallback(
    async (request: CreateComplianceRuleInput): Promise<CreateComplianceRuleResponse> => {
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
