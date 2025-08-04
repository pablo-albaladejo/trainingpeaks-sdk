/**
 * Client-level error handling
 * Provides the best developer experience with actionable error messages
 */

import { HttpError } from '@/adapters/errors/http-errors';
import { AuthenticationError, NetworkError, UserError, ValidationError } from '@/domain/errors/domain-errors';
import { ERROR_CODES } from '@/domain/errors/error-codes';
import { SDKError } from '@/domain/errors/sdk-error';

/**
 * Enhanced client error with actionable information for developers
 */
export class ClientError extends SDKError {
  public readonly operation: string;
  public readonly suggestions: string[];
  public readonly isRetryable: boolean;
  public readonly httpStatus?: number;

  constructor(
    message: string,
    code: string,
    operation: string,
    options: {
      suggestions?: string[];
      isRetryable?: boolean;
      httpStatus?: number;
      originalError?: Error;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message, code, { ...options.context, originalError: options.originalError });
    this.name = 'ClientError';
    this.operation = operation;
    this.suggestions = options.suggestions || [];
    this.isRetryable = options.isRetryable || false;
    this.httpStatus = options.httpStatus;
  }
}

/**
 * Wraps client operations with enhanced error handling
 */
export const withClientErrorHandling = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  context: Record<string, unknown> = {}
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    throw transformToClientError(error as Error, operationName, context);
  }
};

/**
 * Transforms any error into a client error with actionable information
 */
export const transformToClientError = (
  error: Error,
  operation: string,
  context: Record<string, unknown> = {}
): ClientError => {
  // Handle domain errors
  if (error instanceof AuthenticationError) {
    return new ClientError(
      error.message,
      ERROR_CODES.AUTH_FAILED,
      operation,
      {
        suggestions: getSuggestionsForCode(ERROR_CODES.AUTH_FAILED),
        isRetryable: false,
        originalError: error,
        context,
      }
    );
  }

  if (error instanceof ValidationError) {
    return new ClientError(
      error.message,
      ERROR_CODES.VALIDATION_FAILED,
      operation,
      {
        suggestions: getSuggestionsForCode(ERROR_CODES.VALIDATION_FAILED),
        isRetryable: false,
        originalError: error,
        context,
      }
    );
  }

  if (error instanceof NetworkError) {
    return new ClientError(
      error.message,
      ERROR_CODES.NETWORK_REQUEST_FAILED,
      operation,
      {
        suggestions: getSuggestionsForCode(ERROR_CODES.NETWORK_TIMEOUT),
        isRetryable: true,
        originalError: error,
        context,
      }
    );
  }

  if (error instanceof UserError) {
    return new ClientError(
      error.message,
      error.code,
      operation,
      {
        suggestions: getSuggestionsForCode(error.code),
        isRetryable: false,
        originalError: error,
        context,
      }
    );
  }

  // Handle HTTP errors
  if (error instanceof HttpError) {
    return new ClientError(
      error.message,
      error.code,
      operation,
      {
        suggestions: getSuggestionsForHttpError(error),
        isRetryable: error.status >= 500 || error.status === 429,
        httpStatus: error.status,
        originalError: error,
        context: { ...context, url: error.url, method: error.method },
      }
    );
  }

  // Handle SDK errors
  if (error instanceof SDKError) {
    return new ClientError(
      error.message,
      error.code,
      operation,
      {
        suggestions: getSuggestionsForCode(error.code),
        originalError: error,
        context,
      }
    );
  }

  // Handle generic errors
  return new ClientError(
    `${operation} failed: ${error.message}`,
    ERROR_CODES.UNKNOWN_ERROR,
    operation,
    {
      suggestions: ['Check network connection', 'Verify API credentials', 'Try again later'],
      originalError: error,
      context,
    }
  );
};


/**
 * Get actionable suggestions for HTTP errors
 */
const getSuggestionsForHttpError = (error: HttpError): string[] => {
  switch (error.status) {
    case 400:
      return [
        'Check request parameters for valid format',
        'Ensure all required fields are included',
        'Verify data types match API expectations',
      ];
    
    case 401:
      return [
        'Check if your authentication token is valid',
        'Try refreshing your authentication token',
        'Verify your API credentials are correct',
      ];
    
    case 403:
      return [
        'Verify you have permission to access this resource',
        'Check if your account has the required subscription plan',
        'Contact support if you believe this is an error',
      ];
    
    case 404:
      return [
        'Verify the resource ID exists',
        'Check if the resource has been deleted',
        'Ensure you have access to this resource',
      ];
    
    case 408:
    case 504:
      return [
        'The request timed out - try again',
        'Check your network connection',
        'Consider increasing timeout settings',
      ];
    
    case 429:
      return [
        'You have exceeded the rate limit',
        'Wait before making another request',
        'Consider implementing exponential backoff',
        'Check your subscription plan for higher limits',
      ];
    
    case 500:
    case 502:
    case 503:
      return [
        'This is a temporary server error',
        'Try again in a few moments',
        'Check the service status page',
        'Contact support if the issue persists',
      ];
    
    default:
      return [
        'Check the HTTP status code for specific guidance',
        'Verify your request format',
        'Try again if this seems like a temporary issue',
      ];
  }
};

/**
 * Get suggestions based on error codes
 */
const getSuggestionsForCode = (code: string): string[] => {
  switch (code) {
    case ERROR_CODES.AUTH_FAILED:
    case ERROR_CODES.AUTH_TOKEN_INVALID:
      return [
        'Verify your authentication credentials',
        'Check if your token has expired',
        'Try re-authenticating',
      ];
    
    case ERROR_CODES.NETWORK_TIMEOUT:
      return [
        'Check your network connection',
        'Try again with a longer timeout',
        'Verify the service is available',
      ];
    
    case ERROR_CODES.NETWORK_RATE_LIMITED:
      return [
        'Reduce the frequency of your requests',
        'Implement exponential backoff',
        'Check your rate limit allowance',
      ];
    
    case ERROR_CODES.VALIDATION_FAILED:
      return [
        'Check your input parameters',
        'Ensure required fields are provided',
        'Verify data formats are correct',
      ];
    
    default:
      return ['Check the error code documentation for specific guidance'];
  }
};

/**
 * Wraps client operations and returns structured responses instead of throwing
 */
export const withClientResponseHandling = async <TSuccess, TError>(
  operation: () => Promise<TSuccess>,
  operationName: string,
  errorResponseFactory: (error: string, code?: string) => TError,
  context: Record<string, unknown> = {}
): Promise<TSuccess | TError> => {
  try {
    return await withClientErrorHandling(operation, operationName, context);
  } catch (error) {
    const clientError = error as ClientError;
    return errorResponseFactory(clientError.message, clientError.code);
  }
};

/**
 * Helper to create user-friendly error messages for common scenarios
 */
export const createUserFriendlyMessage = (error: ClientError): string => {
  const baseMessage = `Operation "${error.operation}" failed`;
  
  if (error.httpStatus) {
    switch (error.httpStatus) {
      case 401:
        return `${baseMessage}: Authentication required. Please check your credentials.`;
      case 403:
        return `${baseMessage}: Access denied. You may not have permission for this resource.`;
      case 404:
        return `${baseMessage}: Resource not found. Please verify the ID is correct.`;
      case 429:
        return `${baseMessage}: Rate limit exceeded. Please wait before trying again.`;
      case 500:
      case 502:
      case 503:
        return `${baseMessage}: Server error. This is likely temporary - please try again.`;
      default:
        return `${baseMessage}: ${error.message}`;
    }
  }
  
  return `${baseMessage}: ${error.message}`;
};