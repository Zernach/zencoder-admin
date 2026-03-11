import { TABS } from "@/constants/routes";
import { CHAT_TOPICS, type ChatConversationSummary, type ChatTopic } from "@/features/chat/types";

const DEFAULT_TOPIC_FILTERS_BY_TAB: Record<TABS, ChatTopic[]> = {
  [TABS.DASHBOARD]: [],
  [TABS.AGENTS]: [],
  [TABS.COSTS]: [],
  [TABS.GOVERNANCE]: [],
  [TABS.SETTINGS]: [],
};

export const CHAT_HISTORY_TOPIC_OPTIONS: readonly ChatTopic[] = CHAT_TOPICS;

export function getDefaultTopicFiltersForTab(tab: TABS): ChatTopic[] {
  return [...DEFAULT_TOPIC_FILTERS_BY_TAB[tab]];
}

export function filterChatHistoryByTopics(
  items: readonly ChatConversationSummary[],
  selectedTopics: readonly ChatTopic[],
): ChatConversationSummary[] {
  if (selectedTopics.length === 0) {
    return [...items];
  }

  const selected = new Set<ChatTopic>(selectedTopics);
  return items.filter((item) => item.topics.some((t) => selected.has(t)));
}
