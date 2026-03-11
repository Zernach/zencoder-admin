export const API_VERSION = "v1" as const;
export type ApiVersion = typeof API_VERSION;

export const API_BASE_PATH = `/${API_VERSION}`;
