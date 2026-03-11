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

import ChatHistory from "../chat/index";
import ChatThread from "../chat/[chatId]";
import CreateChat from "../chat/create/index";

describe("chat route stack", () => {
  it("uses the shared chat history route wrapper", () => {
    expect(ChatHistory).toBe(ChatHistoryRoute);
  });

  it("uses the shared chat thread route wrapper", () => {
    expect(ChatThread).toBe(ChatThreadRoute);
  });

  it("uses the shared create chat route wrapper", () => {
    expect(CreateChat).toBe(CreateChatRoute);
  });
});
