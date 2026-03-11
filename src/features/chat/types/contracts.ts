import type { TABS } from "@/constants/routes";

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

export interface GetChatHistoryRequest {
  tab: TABS;
  scope?: ChatHistoryScope;
  limit?: number;
}

export interface GetChatHistoryResponse {
  items: ChatConversationSummary[];
  totalCount: number;
}

export interface GetChatThreadRequest {
  tab: TABS;
  chatId: string;
}

export interface GetChatThreadResponse {
  chat: ChatConversationSummary;
  messages: ChatMessage[];
}

export interface CreateChatRequest {
  tab: TABS;
  title: string;
  firstMessage: string;
}

export interface CreateChatResponse {
  chat: ChatConversationSummary;
}

export interface SendMessageRequest {
  tab: TABS;
  chatId: string;
  content: string;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export interface MarkAsReadRequest {
  tab: TABS;
  chatId: string;
}

export interface MarkAsReadResponse {
  success: boolean;
}
