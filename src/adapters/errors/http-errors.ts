/**
 * HTTP-specific error handling for API layer
 * Provides rich error context and proper status code mapping
 */

import { ERROR_CODES } from '@/domain/errors/error-codes';
import { SDKError } from '@/domain/errors/sdk-error';
import type {
  HttpError as IHttpError,
  HttpErrorContext,
  HttpErrorResponse,
} from '@/domain/types/http-error';

// Re-export types from domain
export type {
  HttpErrorContext,
  HttpErrorResponse,
} from '@/domain/types/http-error';

/**
 * HTTP Error with rich context for debugging and monitoring
 */
export class HttpError extends SDKError implements IHttpError {
  public readonly status: number;
  public readonly statusText: string;
  public readonly url?: string;
  public readonly method?: string;
  public readonly requestId?: string;
  public override readonly code: string;

  constructor(
    message: string,
    code: string,
    context: HttpErrorContext,
    options?: { cause?: unknown }
  ) {
    super(message, code, context, options);
    this.name = 'HttpError';
    this.code = code;
    this.status = context.status;
    this.statusText = context.statusText;
    this.url = context.url;
    this.method = context.method;
    this.requestId = context.requestId;
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
    requestId?: string;
  } = {},
  cause?: unknown
): HttpError => {
  const { status, statusText, data } = response;
  const { url, method, requestData, requestId } = context;

  const errorContext: HttpErrorContext = {
    status,
    statusText,
    url,
    method,
    requestData,
    responseData: data,
    headers: response.headers,
    requestId,
  };

  // Map status codes to specific error codes and messages
  switch (status) {
    case 400:
      return new HttpError(
        `Bad Request: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.VALIDATION_FAILED,
        errorContext,
        cause ? { cause } : undefined
      );

    case 401:
      return new HttpError(
        `Authentication failed: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.AUTH_TOKEN_INVALID,
        errorContext,
        cause ? { cause } : undefined
      );

    case 403:
      return new HttpError(
        `Access forbidden: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.AUTH_FAILED,
        errorContext,
        cause ? { cause } : undefined
      );

    case 404:
      return new HttpError(
        `Resource not found: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.WORKOUT_NOT_FOUND, // or generic NOT_FOUND if we add it
        errorContext,
        cause ? { cause } : undefined
      );

    case 408:
    case 504:
      return new HttpError(
        `Request timeout: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.NETWORK_TIMEOUT,
        errorContext,
        cause ? { cause } : undefined
      );

    case 409:
      return new HttpError(
        `Conflict: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.VALIDATION_FAILED,
        errorContext,
        cause ? { cause } : undefined
      );

    case 422:
      return new HttpError(
        `Validation error: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.VALIDATION_FAILED,
        errorContext,
        cause ? { cause } : undefined
      );

    case 429:
      return new HttpError(
        `Rate limit exceeded: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.NETWORK_RATE_LIMITED,
        errorContext,
        cause ? { cause } : undefined
      );

    case 500:
      return new HttpError(
        `Server error: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.NETWORK_SERVER_ERROR,
        errorContext,
        cause ? { cause } : undefined
      );

    case 502:
      return new HttpError(
        `Bad gateway: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.NETWORK_RESPONSE_INVALID,
        errorContext,
        cause ? { cause } : undefined
      );

    case 503:
      return new HttpError(
        `Service unavailable: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.NETWORK_SERVICE_UNAVAILABLE,
        errorContext,
        cause ? { cause } : undefined
      );

    default:
      return new HttpError(
        `HTTP Error ${status}: ${getErrorMessage(data) || statusText}`,
        ERROR_CODES.NETWORK_REQUEST_FAILED,
        errorContext,
        cause ? { cause } : undefined
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

// =====================================
// HIGH-LEVEL ERROR THROWING UTILITIES
// =====================================

import type { HttpResponse } from '@/application';

/**
 * Request context for better error reporting
 */
export type ErrorRequestContext = {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  requestData?: unknown;
  requestId?: string;
};

/**
 * Helper function to create and throw structured HttpError from response
 * Handles both existing HttpErrors and generic errors
 */
export const throwHttpErrorFromResponse: <T>(
  response: HttpResponse<T>,
  operation: string,
  context: ErrorRequestContext
) => never = <T>(
  response: HttpResponse<T>,
  operation: string,
  context: ErrorRequestContext
): never => {
  if (response.error && isHttpError(response.error)) {
    // Re-throw the existing HttpError
    throw response.error;
  }

  // Create structured HttpError for non-HTTP errors
  const errorMessage = response.error
    ? response.error instanceof Error
      ? response.error.message
      : String(response.error)
    : `${operation} failed`;

  const httpErrorResponse: HttpErrorResponse = {
    status: 500,
    statusText: 'Unknown Error',
    data: { message: errorMessage },
  };

  throw createHttpError(httpErrorResponse, context);
};

/**
 * Helper function to create and throw validation error
 */
export const throwValidationError: (
  message: string,
  context: ErrorRequestContext
) => never = (message: string, context: ErrorRequestContext): never => {
  const httpErrorResponse: HttpErrorResponse = {
    status: 400,
    statusText: 'Bad Request',
    data: { message },
  };

  throw createHttpError(httpErrorResponse, context);
};

/**
 * Helper function to create and throw missing data error
 */
export const throwMissingDataError: (
  message: string,
  context: ErrorRequestContext
) => never = (message: string, context: ErrorRequestContext): never => {
  const httpErrorResponse: HttpErrorResponse = {
    status: 502,
    statusText: 'Bad Gateway',
    data: { message },
  };

  throw createHttpError(httpErrorResponse, context);
};

/**
 * Helper function to create and throw generic server error
 */
export const throwServerError: (
  error: unknown,
  fallbackMessage: string,
  context: ErrorRequestContext
) => never = (
  error: unknown,
  fallbackMessage: string,
  context: ErrorRequestContext
): never => {
  // If it's already an HttpError, re-throw it
  if (isHttpError(error)) {
    throw error;
  }

  // Create structured HttpError for other errors
  const httpErrorResponse: HttpErrorResponse = {
    status: 500,
    statusText: 'Internal Server Error',
    data: {
      message: error instanceof Error ? error.message : fallbackMessage,
    },
  };

  throw createHttpError(httpErrorResponse, context, error);
};

/**
 * Helper function to create and throw authentication-specific errors
 */
export const throwAuthError: (
  message: string,
  context: ErrorRequestContext
) => never = (message: string, context: ErrorRequestContext): never => {
  const httpErrorResponse: HttpErrorResponse = {
    status: 401,
    statusText: 'Unauthorized',
    data: { message },
  };

  throw createHttpError(httpErrorResponse, context);
};

/**
 * Helper function to create and throw cookie not found error
 */
export const throwCookieNotFoundError: (
  cookieName: string,
  context: ErrorRequestContext
) => never = (cookieName: string, context: ErrorRequestContext): never => {
  const httpErrorResponse: HttpErrorResponse = {
    status: 401,
    statusText: 'Unauthorized',
    data: { message: `${cookieName} cookie not found` },
  };

  throw createHttpError(httpErrorResponse, context);
};

/**
 * Helper function to create and throw token expired error
 */
export const throwTokenExpiredError: (context: ErrorRequestContext) => never = (
  context: ErrorRequestContext
): never => {
  const httpErrorResponse: HttpErrorResponse = {
    status: 401,
    statusText: 'Unauthorized',
    data: { message: 'Received expired token from TrainingPeaks API' },
  };

  throw createHttpError(httpErrorResponse, context);
};

/**
 * Helper function to handle repository operation errors with logging
 * Logs the error and throws appropriate HttpError
 */
export const handleRepositoryError: (
  error: unknown,
  operation: string,
  context: ErrorRequestContext,
  logger: { error: (message: string, details?: unknown) => void },
  params?: unknown
) => never = (
  error: unknown,
  operation: string,
  context: ErrorRequestContext,
  logger: { error: (message: string, details?: unknown) => void },
  params?: unknown
): never => {
  logger.error(`Failed to ${operation}`, { error, params });
  if (isHttpError(error)) throw error;
  throwServerError(error, `Failed to ${operation}`, context);
};
