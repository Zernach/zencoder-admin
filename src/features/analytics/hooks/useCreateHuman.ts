import { useCallback, useMemo } from "react";
import { useCreateSeatMutation } from "@/store/api";
import { getApiErrorMessage } from "@/contracts/http/errors";
import type { CreateSeatRequest, CreateSeatResponse } from "@/features/analytics/types";
import { useDashboardOrgId } from "./useDashboardFilters";

type CreateHumanInput = Omit<CreateSeatRequest, "orgId">;

interface UseCreateHumanReturn {
  create: (request: CreateHumanInput) => Promise<CreateSeatResponse>;
  loading: boolean;
  error: string | undefined;
  lastResult: CreateSeatResponse | undefined;
}

export function useCreateHuman(): UseCreateHumanReturn {
  const orgId = useDashboardOrgId();
  const [trigger, state] = useCreateSeatMutation();

  const create = useCallback(
    async (request: CreateHumanInput): Promise<CreateSeatResponse> => {
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
