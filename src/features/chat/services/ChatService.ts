import type { IChatApi } from "@/features/chat/api";
import type { IChatService } from "@/features/chat/services/IChatService";
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

export class ChatService implements IChatService {
  constructor(private readonly api: IChatApi) {}

  async getChatHistory(request: GetChatHistoryRequest): Promise<GetChatHistoryResponse> {
    return this.api.getChatHistory(request);
  }

  async getChatThread(request: GetChatThreadRequest): Promise<GetChatThreadResponse> {
    return this.api.getChatThread(request);
  }

  async createChat(request: CreateChatRequest): Promise<CreateChatResponse> {
    return this.api.createChat(request);
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    return this.api.sendMessage(request);
  }

  async markAsRead(request: MarkAsReadRequest): Promise<MarkAsReadResponse> {
    return this.api.markAsRead(request);
  }
}
