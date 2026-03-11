import { TABS } from "@/constants/routes";
import type { ChatConversationSummary } from "@/features/chat/types";
import {
  CHAT_HISTORY_TOPIC_OPTIONS,
  filterChatHistoryByTopics,
  getDefaultTopicFiltersForTab,
} from "../topicFilters";

const FIXTURES: ChatConversationSummary[] = [
  {
    id: "a",
    tab: TABS.AGENTS,
    topics: ["Agents"],
    title: "Agents chat",
    preview: "p",
    updatedAtIso: "2026-03-10T12:00:00.000Z",
    messageCount: 4,
    unreadCount: 0,
    status: "active",
  },
  {
    id: "c",
    tab: TABS.COSTS,
    topics: ["Costs"],
    title: "Costs chat",
    preview: "p",
    updatedAtIso: "2026-03-10T11:00:00.000Z",
    messageCount: 4,
    unreadCount: 0,
    status: "completed",
  },
  {
    id: "g",
    tab: TABS.GOVERNANCE,
    topics: ["Governance"],
    title: "Governance chat",
    preview: "p",
    updatedAtIso: "2026-03-10T10:00:00.000Z",
    messageCount: 4,
    unreadCount: 0,
    status: "completed",
  },
  {
    id: "s",
    tab: TABS.SETTINGS,
    topics: ["Support"],
    title: "Support chat",
    preview: "p",
    updatedAtIso: "2026-03-10T09:00:00.000Z",
    messageCount: 4,
    unreadCount: 0,
    status: "completed",
  },
];

describe("chat history topic filters", () => {
  it("exposes the four supported topic options", () => {
    expect(CHAT_HISTORY_TOPIC_OPTIONS).toEqual([
      "Agents",
      "Costs",
      "Governance",
      "Support",
    ]);
  });

  it.each([
    [TABS.DASHBOARD, []],
    [TABS.AGENTS, ["Agents"]],
    [TABS.COSTS, ["Costs"]],
    [TABS.GOVERNANCE, ["Governance"]],
    [TABS.CHAT, []],
    [TABS.SETTINGS, ["Support"]],
  ])("returns default filters for %s", (tab, expected) => {
    expect(getDefaultTopicFiltersForTab(tab)).toEqual(expected);
  });

  it("returns all items when zero topics are selected", () => {
    expect(filterChatHistoryByTopics(FIXTURES, [])).toEqual(FIXTURES);
  });

  it("returns only matching selected topics", () => {
    const filtered = filterChatHistoryByTopics(FIXTURES, ["Costs", "Support"]);
    expect(filtered.map((item) => item.id)).toEqual(["c", "s"]);
  });
});
