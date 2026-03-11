import { useCallback, useEffect, useRef, useState } from "react";
import type { TABS } from "@/constants/routes";
import { useAppDependencies } from "@/core/di";
import { useAppSelector } from "@/store/hooks";
import { selectOrgId } from "@/store/slices/filtersSlice";
import { getApiErrorMessage } from "@/contracts/http/errors";
import type { ChatHistoryScope, GetChatHistoryResponse } from "@/features/chat/types";

interface UseChatHistoryOptions {
  limit?: number;
  scope?: ChatHistoryScope;
}

interface UseChatHistoryResult {
  data: GetChatHistoryResponse | undefined;
  loading: boolean;
  error: string | undefined;
  refetch: () => Promise<void>;
}

export function useChatHistory(tab: TABS, options: UseChatHistoryOptions = {}): UseChatHistoryResult {
  const { chatService } = useAppDependencies();
  const orgId = useAppSelector(selectOrgId);
  const [data, setData] = useState<GetChatHistoryResponse>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>();
  const requestIdRef = useRef<number>(0);

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError(undefined);

    try {
      const response = await chatService.getChatHistory({
        orgId,
        tab,
        scope: options.scope,
        limit: options.limit,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setData(response);
    } catch (unknownError: unknown) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(
        getApiErrorMessage(unknownError, "Failed to load chat history."),
      );
      setData(undefined);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [chatService, options.limit, options.scope, orgId, tab]);

  useEffect(() => {
    void load();

    return () => {
      requestIdRef.current += 1;
    };
  }, [load]);

  return {
    data,
    loading,
    error,
    refetch: load,
  };
}
