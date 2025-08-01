/**
 * HTTP-specific error handling for API layer
 * Provides rich error context and proper status code mapping
 */

import { ERROR_CODES } from '@/domain/errors/error-codes';
import { SDKError, type SDKErrorContext } from '@/domain/errors/sdk-error';

export interface HttpErrorResponse {
  status: number;
  statusText: string;
  data?: unknown;
  headers?: Record<string, string>;
}

export interface HttpErrorContext extends SDKErrorContext {
  status: number;
  statusText: string;
  url?: string;
  method?: string;
  requestData?: unknown;
  responseData?: unknown;
  headers?: Record<string, string>;
}

/**
 * HTTP Error with rich context for debugging and monitoring
 */
export class HttpError extends SDKError {
  public readonly status: number;
  public readonly statusText: string;
  public readonly url?: string;
  public readonly method?: string;

  constructor(message: string, code: string, context: HttpErrorContext) {
    super(message, code, context);
    this.name = 'HttpError';
    this.status = context.status;
    this.statusText = context.statusText;
    this.url = context.url;
    this.method = context.method;
  }
}

/**
 * Creates appropriate error based on HTTP status code
 */
export const createHttpError = (
  response: HttpErrorResponse,
  context: {
    url?: string;
    method?: string;
    requestData?: unknown;
  } = {}
): HttpError => {
  const { status, statusText, data } = response;
  const { url, method, requestData } = context;

  const errorContext: HttpErrorContext = {
    status,
    statusText,
    url,
    method,
    requestData,
    responseData: data,
    headers: response.headers,
  };

  // Map status codes to specific error codes and messages
  switch (status) {
    case 400:
      return new HttpError(
        `Bad Request: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.VALIDATION_FAILED,
        errorContext
      );

    case 401:
      return new HttpError(
        `Authentication failed: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.AUTH_TOKEN_INVALID,
        errorContext
      );

    case 403:
      return new HttpError(
        `Access forbidden: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.AUTH_FAILED,
        errorContext
      );

    case 404:
      return new HttpError(
        `Resource not found: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.WORKOUT_NOT_FOUND, // or generic NOT_FOUND if we add it
        errorContext
      );

    case 408:
    case 504:
      return new HttpError(
        `Request timeout: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.NETWORK_TIMEOUT,
        errorContext
      );

    case 409:
      return new HttpError(
        `Conflict: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.VALIDATION_FAILED,
        errorContext
      );

    case 422:
      return new HttpError(
        `Validation error: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.VALIDATION_FAILED,
        errorContext
      );

    case 429:
      return new HttpError(
        `Rate limit exceeded: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.NETWORK_RATE_LIMITED,
        errorContext
      );

    case 500:
      return new HttpError(
        `Server error: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.NETWORK_SERVER_ERROR,
        errorContext
      );
    
    case 502:
      return new HttpError(
        `Bad gateway: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.NETWORK_RESPONSE_INVALID,
        errorContext
      );
    
    case 503:
      return new HttpError(
        `Service unavailable: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.NETWORK_SERVICE_UNAVAILABLE,
        errorContext
      );

    default:
      return new HttpError(
        `HTTP Error ${status}: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.NETWORK_REQUEST_FAILED,
        errorContext
      );
  }
};

/**
 * Extracts error message from API response data
 */
const getErrorMessage = (data: unknown): string | null => {
  if (!data || typeof data !== 'object') return null;

  const errorData = data as Record<string, unknown>;

  // Try common error message fields
  return (
    (errorData.message as string) ||
    (errorData.error as string) ||
    (errorData.detail as string) ||
    (errorData.description as string) ||
    null
  );
};

/**
 * Type guard to check if error is an HttpError
 */
export const isHttpError = (error: unknown): error is HttpError => {
  return error instanceof HttpError;
};

/**
 * Checks if error is a client error (4xx)
 */
export const isClientError = (error: unknown): boolean => {
  return isHttpError(error) && error.status >= 400 && error.status < 500;
};

/**
 * Checks if error is a server error (5xx)
 */
export const isServerError = (error: unknown): boolean => {
  return isHttpError(error) && error.status >= 500;
};

/**
 * Checks if error is retryable (temporary failures)
 */
export const isRetryableError = (error: unknown): boolean => {
  if (!isHttpError(error)) return false;

  // Retry on server errors, timeouts, and rate limits
  return (
    error.status >= 500 ||
    error.status === 408 ||
    error.status === 429 ||
    error.status === 502 ||
    error.status === 503 ||
    error.status === 504
  );
};
