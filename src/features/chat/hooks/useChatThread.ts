import { useCallback, useEffect, useRef, useState } from "react";
import type { TABS } from "@/constants/routes";
import { useAppDependencies } from "@/core/di";
import type { GetChatThreadResponse } from "@/features/chat/types";

interface UseChatThreadResult {
  data: GetChatThreadResponse | undefined;
  loading: boolean;
  error: string | undefined;
  refetch: () => Promise<void>;
}

export function useChatThread(tab: TABS, chatId: string): UseChatThreadResult {
  const { chatService } = useAppDependencies();
  const [data, setData] = useState<GetChatThreadResponse>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>();
  const requestIdRef = useRef<number>(0);

  const load = useCallback(async () => {
    if (!chatId) {
      setLoading(false);
      setData(undefined);
      setError("Missing chatId parameter.");
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError(undefined);

    try {
      const response = await chatService.getChatThread({ tab, chatId });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setData(response);
    } catch (unknownError: unknown) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Failed to load chat thread.",
      );
      setData(undefined);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [chatId, chatService, tab]);

  useEffect(() => {
    void load();

    return () => {
      requestIdRef.current += 1;
    };
  }, [load]);

  // Mark as read when the thread loads with unread messages
  const markedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!data || data.chat.unreadCount === 0) return;
    if (markedRef.current === data.chat.id) return;

    markedRef.current = data.chat.id;
    void chatService.markAsRead({ tab, chatId: data.chat.id });
  }, [data, chatService, tab]);

  return {
    data,
    loading,
    error,
    refetch: load,
  };
}
