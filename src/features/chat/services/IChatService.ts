import type {
  CreateChatRequest,
  CreateChatResponse,
  GetChatHistoryRequest,
  GetChatHistoryResponse,
  GetChatThreadRequest,
  GetChatThreadResponse,
  MarkAsReadRequest,
  MarkAsReadResponse,
  SendMessageRequest,
  SendMessageResponse,
} from "@/features/chat/types";

export interface IChatService {
  getChatHistory(request: GetChatHistoryRequest): Promise<GetChatHistoryResponse>;
  getChatThread(request: GetChatThreadRequest): Promise<GetChatThreadResponse>;
  createChat(request: CreateChatRequest): Promise<CreateChatResponse>;
  sendMessage(request: SendMessageRequest): Promise<SendMessageResponse>;
  markAsRead(request: MarkAsReadRequest): Promise<MarkAsReadResponse>;
}
