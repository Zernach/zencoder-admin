export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface EndpointErrorDefinition {
  status: number;
  code: string;
  description: string;
}

export interface EndpointMetadata {
  operationId: string;
  feature: "analytics" | "chat";
  summary: string;
  method: HttpMethod;
  path: string;
  requestType: string;
  responseType: string;
  successStatus: number;
  auth: "bearer";
  tenantScoped: boolean;
  errorResponses: readonly EndpointErrorDefinition[];
}
