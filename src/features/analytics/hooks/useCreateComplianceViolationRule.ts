import { useCallback, useState } from "react";
import { useAppDependencies } from "@/core/di";
import type { CreateComplianceRuleRequest, CreateComplianceRuleResponse } from "@/features/analytics/types";

interface UseCreateComplianceViolationRuleReturn {
  create: (request: CreateComplianceRuleRequest) => Promise<CreateComplianceRuleResponse>;
  loading: boolean;
  error: string | undefined;
  lastResult: CreateComplianceRuleResponse | undefined;
}

export function useCreateComplianceViolationRule(): UseCreateComplianceViolationRuleReturn {
  const { analyticsService } = useAppDependencies();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [lastResult, setLastResult] = useState<CreateComplianceRuleResponse | undefined>(undefined);

  const create = useCallback(
    async (request: CreateComplianceRuleRequest): Promise<CreateComplianceRuleResponse> => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await analyticsService.createComplianceRule(request);
        setLastResult(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create rule";
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
