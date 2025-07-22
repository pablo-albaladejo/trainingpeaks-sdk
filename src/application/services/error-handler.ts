/**
 * Error Handler Service Contract
 * Defines the interface for error handling operations across the application
 */

/**
 * Error context type for enriching error information
 */
export type ErrorContext = {
  operation?: string;
  userId?: string | number;
  workoutId?: string;
  requestId?: string;
  timestamp?: Date;
  metadata?: Record<string, unknown>;
};

/**
 * Structured error response type
 */
export type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string[];
    context?: ErrorContext;
    stackTrace?: string;
  };
  statusCode: number;
  timestamp: Date;
};

/**
 * Success response type
 */
export type SuccessResponse<T = unknown> = {
  success: true;
  data: T;
  statusCode: number;
  timestamp: Date;
};

/**
 * Generic response type
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Error classification enum
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error handler configuration
 */
export type ErrorHandlerConfig = {
  enableStackTrace: boolean;
  enableContextEnrichment: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  maxRetryAttempts: number;
  retryDelay: number;
  delayFn?: (ms: number) => Promise<void>;
};

/**
 * Handle error with full context and return structured response
 */
export type HandleError = (
  error: Error,
  context?: ErrorContext
) => ErrorResponse;

/**
 * Handle success response
 */
export type HandleSuccess = <T>(
  data: T,
  statusCode?: number
) => SuccessResponse<T>;

/**
 * Wrap async operations with error handling
 */
export type WrapAsyncOperation = <T>(
  operation: () => Promise<T>,
  context?: ErrorContext
) => () => Promise<ApiResponse<T>>;

/**
 * Retry operation with exponential backoff
 */
export type RetryOperation = <T>(
  operation: () => Promise<T>,
  context?: ErrorContext,
  maxAttempts?: number
) => Promise<T>;

/**
 * Create error from string message with context
 */
export type CreateError = (
  message: string,
  code: string,
  statusCode?: number,
  context?: ErrorContext
) => Error;

/**
 * Validate and transform result
 */
export type ValidateResult = <T>(
  validator: (data: T) => boolean,
  errorMessage?: string
) => (result: T) => T;

/**
 * Classify error severity based on error type
 */
export type ClassifyErrorSeverity = (error: Error) => ErrorSeverity;

/**
 * Get status code from error type
 */
export type GetStatusCodeFromError = (error: Error) => number;

/**
 * Extract error code from error type
 */
export type GetErrorCodeFromError = (error: Error) => string;

/**
 * Enrich error context with additional information
 */
export type EnrichErrorContext = (
  error: Error,
  context?: ErrorContext
) => ErrorContext;
