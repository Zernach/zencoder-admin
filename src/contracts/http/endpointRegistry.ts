import type { EndpointMetadata } from "./endpointTypes";
import { analyticsEndpointRegistry } from "@/features/analytics/contracts/endpoints";
import { chatEndpointRegistry } from "@/features/chat/contracts/endpoints";

export const endpointRegistry = {
  analytics: analyticsEndpointRegistry,
  chat: chatEndpointRegistry,
} as const;

export const allEndpointMetadata: EndpointMetadata[] = [
  ...Object.values(analyticsEndpointRegistry),
  ...Object.values(chatEndpointRegistry),
];
