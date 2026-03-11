import type { TFunction } from "i18next";
import { TABS } from "@/constants/routes";
import type { ChatTopic } from "@/features/chat/types";

export interface SuggestedPrompt {
  label: string;
  message: string;
}

const TOPIC_KEY_MAP: Record<ChatTopic, string> = {
  Agents: "agents",
  Costs: "costs",
  Governance: "governance",
  Support: "support",
};

const TOPIC_ORDER: ChatTopic[] = ["Agents", "Costs", "Governance", "Support"];

/** Returns one smart question per unique topic, padded to 4 when chat history has fewer topics. */
export function getSuggestedPromptsFromTopics(
  topics: readonly ChatTopic[],
  t: TFunction,
): SuggestedPrompt[] {
  const fromHistory = [...new Set(topics)].filter((topic) => TOPIC_ORDER.includes(topic));
  const prompts = fromHistory.map((topic) => ({
    label: t(`chat.topics.${TOPIC_KEY_MAP[topic]}.label`),
    message: t(`chat.topics.${TOPIC_KEY_MAP[topic]}.message`),
  }));
  if (prompts.length >= 4) return prompts.slice(0, 4);
  const used = new Set(fromHistory);
  for (const topic of TOPIC_ORDER) {
    if (prompts.length >= 4) break;
    if (!used.has(topic)) {
      prompts.push({
        label: t(`chat.topics.${TOPIC_KEY_MAP[topic]}.label`),
        message: t(`chat.topics.${TOPIC_KEY_MAP[topic]}.message`),
      });
    }
  }
  return prompts;
}

type PromptTab = Exclude<TABS, TABS.CHAT>;

const PROMPT_KEYS_BY_TAB: Record<PromptTab, readonly string[]> = {
  [TABS.DASHBOARD]: ["performance", "activity", "teams", "issues"],
  [TABS.AGENTS]: ["errors", "compare", "inactive", "history"],
  [TABS.COSTS]: ["trending", "breakdown", "unusual", "reduce"],
  [TABS.GOVERNANCE]: ["violations", "compliance", "unresolved", "rules"],
  [TABS.SETTINGS]: ["addMember", "integrations", "notifications", "configure"],
};

export function getSuggestedPrompts(tab: TABS, t: TFunction): SuggestedPrompt[] {
  const promptTab: PromptTab = tab === TABS.CHAT ? TABS.DASHBOARD : tab;
  return PROMPT_KEYS_BY_TAB[promptTab].map((key) => ({
    label: t(`chat.prompts.${promptTab}.${key}.label`),
    message: t(`chat.prompts.${promptTab}.${key}.message`),
  }));
}

export function getWelcomeTitle(t: TFunction): string {
  return t("chat.welcomeTitle");
}

export function getWelcomeSubtitle(tab: TABS, t: TFunction): string {
  const promptTab: PromptTab = tab === TABS.CHAT ? TABS.DASHBOARD : tab;
  return t(`chat.welcomeSubtitle.${promptTab}`);
}
