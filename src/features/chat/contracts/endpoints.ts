import type { EndpointMetadata } from "@/contracts/http/endpointTypes";
import { API_BASE_PATH } from "@/contracts/http/versioning";
import type { IChatApi } from "@/features/chat/api/IChatApi";

type ChatOperation = keyof IChatApi;

const COMMON_CHAT_ERRORS: EndpointMetadata["errorResponses"] = [
  { status: 400, code: "VALIDATION_FAILED", description: "Invalid request fields." },
  { status: 401, code: "UNAUTHORIZED", description: "Missing or invalid auth credentials." },
  { status: 403, code: "FORBIDDEN", description: "Caller cannot access this org." },
  { status: 404, code: "NOT_FOUND", description: "Chat thread not found." },
  { status: 500, code: "INTERNAL_ERROR", description: "Unexpected server error." },
] as const;

export const chatEndpointRegistry: Record<ChatOperation, EndpointMetadata> = {
  getChatHistory: {
    operationId: "chat.getChatHistory",
    feature: "chat",
    summary: "List chat conversations for a tab or all tabs.",
    method: "GET",
    path: `${API_BASE_PATH}/orgs/{orgId}/chat/conversations`,
    requestType: "GetChatHistoryRequest",
    responseType: "GetChatHistoryResponse",
    successStatus: 200,
    auth: "bearer",
    tenantScoped: true,
    errorResponses: COMMON_CHAT_ERRORS,
  },
  getChatThread: {
    operationId: "chat.getChatThread",
    feature: "chat",
    summary: "Fetch a single conversation thread.",
    method: "GET",
    path: `${API_BASE_PATH}/orgs/{orgId}/chat/conversations/{chatId}`,
    requestType: "GetChatThreadRequest",
    responseType: "GetChatThreadResponse",
    successStatus: 200,
    auth: "bearer",
    tenantScoped: true,
    errorResponses: COMMON_CHAT_ERRORS,
  },
  createChat: {
    operationId: "chat.createChat",
    feature: "chat",
    summary: "Create a new conversation thread.",
    method: "POST",
    path: `${API_BASE_PATH}/orgs/{orgId}/chat/conversations`,
    requestType: "CreateChatRequest",
    responseType: "CreateChatResponse",
    successStatus: 201,
    auth: "bearer",
    tenantScoped: true,
    errorResponses: COMMON_CHAT_ERRORS,
  },
  sendMessage: {
    operationId: "chat.sendMessage",
    feature: "chat",
    summary: "Send a message to an existing conversation.",
    method: "POST",
    path: `${API_BASE_PATH}/orgs/{orgId}/chat/conversations/{chatId}/messages`,
    requestType: "SendMessageRequest",
    responseType: "SendMessageResponse",
    successStatus: 201,
    auth: "bearer",
    tenantScoped: true,
    errorResponses: COMMON_CHAT_ERRORS,
  },
  markAsRead: {
    operationId: "chat.markAsRead",
    feature: "chat",
    summary: "Mark all messages in a conversation as read.",
    method: "POST",
    path: `${API_BASE_PATH}/orgs/{orgId}/chat/conversations/{chatId}/read`,
    requestType: "MarkAsReadRequest",
    responseType: "MarkAsReadResponse",
    successStatus: 200,
    auth: "bearer",
    tenantScoped: true,
    errorResponses: COMMON_CHAT_ERRORS,
  },
};
