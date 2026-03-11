import { usePathname, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { resolveTabFromPathname } from "@/constants/routes";
import { ChatHistoryScreen } from "@/features/chat/screens";
import { CHAT_HISTORY_TOPIC_OPTIONS } from "@/features/chat/filters";
import type { ChatTopic } from "@/features/chat/types";

function parseTopicsParam(raw: string | string[] | undefined): ChatTopic[] | undefined {
  if (raw == null) return undefined;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return undefined;
  const validSet = new Set<string>(CHAT_HISTORY_TOPIC_OPTIONS);
  const parsed = value.split(",").filter((t): t is ChatTopic => validSet.has(t));
  return parsed.length > 0 ? parsed : undefined;
}

export function ChatHistoryRoute() {
  const pathname = usePathname();
  const { topics: topicsParam } = useLocalSearchParams<{ topics?: string }>();
  const tab = resolveTabFromPathname(pathname);

  const initialTopics = useMemo(() => parseTopicsParam(topicsParam), [topicsParam]);

  return <ChatHistoryScreen tab={tab} initialTopics={initialTopics} />;
}
