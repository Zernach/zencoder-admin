import type { IChatApi } from "@/features/chat/api";

// Keep the service contract locked to the API contract surface.
export interface IChatService extends IChatApi {}
