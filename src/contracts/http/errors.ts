export interface ValidationIssue {
  field: string;
  code: string;
  message: string;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  requestId?: string;
  details?: ValidationIssue[];
  retryable?: boolean;
}

export class ApiContractError extends Error {
  public readonly apiError: ApiError;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = "ApiContractError";
    this.apiError = apiError;
  }
}

export function isApiError(value: unknown): value is ApiError {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.status === "number" &&
    typeof record.code === "string" &&
    typeof record.message === "string"
  );
}

export function toApiError(error: unknown, fallbackStatus = 500): ApiError {
  if (error instanceof ApiContractError) {
    return error.apiError;
  }

  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return {
      status: fallbackStatus,
      code: "UNEXPECTED_ERROR",
      message: error.message,
    };
  }

  return {
    status: fallbackStatus,
    code: "UNEXPECTED_ERROR",
    message: String(error),
  };
}

export function getApiErrorMessage(error: unknown, fallback = "Request failed."): string {
  if (!error) {
    return fallback;
  }

  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof ApiContractError) {
    return error.apiError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function validationError(message: string, details: ValidationIssue[]): ApiContractError {
  return new ApiContractError({
    status: 400,
    code: "VALIDATION_FAILED",
    message,
    details,
    retryable: false,
  });
}

export function notFoundError(resource: string, identifier: string): ApiContractError {
  return new ApiContractError({
    status: 404,
    code: "NOT_FOUND",
    message: `${resource} not found: ${identifier}`,
    retryable: false,
  });
}

export function conflictError(message: string): ApiContractError {
  return new ApiContractError({
    status: 409,
    code: "CONFLICT",
    message,
    retryable: false,
  });
}

export function internalError(message: string): ApiContractError {
  return new ApiContractError({
    status: 500,
    code: "INTERNAL_ERROR",
    message,
    retryable: true,
  });
}
