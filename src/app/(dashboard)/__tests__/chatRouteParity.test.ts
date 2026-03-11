jest.mock("@/components/routes", () => {
  const ChatHistoryRoute = () => null;
  const ChatThreadRoute = () => null;
  const CreateChatRoute = () => null;

  return {
    __esModule: true,
    ChatHistoryRoute,
    ChatThreadRoute,
    CreateChatRoute,
  };
});

import {
  ChatHistoryRoute,
  ChatThreadRoute,
  CreateChatRoute,
} from "@/components/routes";

import DashboardChatHistory from "../dashboard/chat/history/index";
import DashboardChatThread from "../dashboard/chat/history/[chatId]";
import DashboardCreateChat from "../dashboard/chat/create/index";

import AgentsChatHistory from "../agents/chat/history/index";
import AgentsChatThread from "../agents/chat/history/[chatId]";
import AgentsCreateChat from "../agents/chat/create/index";

import CostsChatHistory from "../costs/chat/history/index";
import CostsChatThread from "../costs/chat/history/[chatId]";
import CostsCreateChat from "../costs/chat/create/index";

import GovernanceChatHistory from "../governance/chat/history/index";
import GovernanceChatThread from "../governance/chat/history/[chatId]";
import GovernanceCreateChat from "../governance/chat/create/index";

import SettingsChatHistory from "../settings/chat/history/index";
import SettingsChatThread from "../settings/chat/history/[chatId]";
import SettingsCreateChat from "../settings/chat/create/index";

describe("chat route parity", () => {
  it("reuses the same history route wrapper across tab stacks", () => {
    expect(DashboardChatHistory).toBe(ChatHistoryRoute);
    expect(AgentsChatHistory).toBe(ChatHistoryRoute);
    expect(CostsChatHistory).toBe(ChatHistoryRoute);
    expect(GovernanceChatHistory).toBe(ChatHistoryRoute);
    expect(SettingsChatHistory).toBe(ChatHistoryRoute);
  });

  it("reuses the same thread route wrapper across tab stacks", () => {
    expect(DashboardChatThread).toBe(ChatThreadRoute);
    expect(AgentsChatThread).toBe(ChatThreadRoute);
    expect(CostsChatThread).toBe(ChatThreadRoute);
    expect(GovernanceChatThread).toBe(ChatThreadRoute);
    expect(SettingsChatThread).toBe(ChatThreadRoute);
  });

  it("reuses the same create chat route wrapper across tab stacks", () => {
    expect(DashboardCreateChat).toBe(CreateChatRoute);
    expect(AgentsCreateChat).toBe(CreateChatRoute);
    expect(CostsCreateChat).toBe(CreateChatRoute);
    expect(GovernanceCreateChat).toBe(CreateChatRoute);
    expect(SettingsCreateChat).toBe(CreateChatRoute);
  });
});
