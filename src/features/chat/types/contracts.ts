import type { TABS } from "@/constants/routes";
import type { CursorPageRequest, CursorPageResponse } from "@/contracts/http/pagination";

export type ChatMessageRole = "user" | "assistant" | "system";

export type ChatConversationStatus = "active" | "completed" | "archived";
export type ChatHistoryScope = "tab" | "all";

export const CHAT_TOPICS = [
  "Agents",
  "Costs",
  "Governance",
  "Support",
] as const;

export type ChatTopic = (typeof CHAT_TOPICS)[number];

export interface ChatConversationSummary {
  id: string;
  tab: TABS;
  topics: ChatTopic[];
  title: string;
  preview: string;
  updatedAtIso: string;
  messageCount: number;
  unreadCount: number;
  status: ChatConversationStatus;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: ChatMessageRole;
  authorName: string;
  content: string;
  createdAtIso: string;
}

export interface GetChatHistoryRequest extends CursorPageRequest {
  orgId: string;
  tab: TABS;
  scope?: ChatHistoryScope;
}

export interface GetChatHistoryResponse extends CursorPageResponse<ChatConversationSummary> {}

export interface GetChatThreadRequest {
  orgId: string;
  tab: TABS;
  chatId: string;
}

export interface GetChatThreadResponse {
  chat: ChatConversationSummary;
  messages: ChatMessage[];
}

export interface CreateChatRequest {
  orgId: string;
  tab: TABS;
  title: string;
  firstMessage: string;
}

export interface CreateChatResponse {
  chat: ChatConversationSummary;
}

export interface SendMessageRequest {
  orgId: string;
  tab: TABS;
  chatId: string;
  content: string;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export interface MarkAsReadRequest {
  orgId: string;
  tab: TABS;
  chatId: string;
}

export interface MarkAsReadResponse {
  success: boolean;
}
