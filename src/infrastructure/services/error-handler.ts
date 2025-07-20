/**
 * Error Handler Service Implementation
 * Provides centralized error handling with context enrichment and structured logging
 */

import {
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  RateLimitError,
  TrainingPeaksError,
  UploadError,
  ValidationError,
} from '@/domain/errors/index';
import {
  WorkoutError,
  WorkoutNotFoundError,
  WorkoutOperationNotAllowedError,
  WorkoutValidationError,
} from '@/domain/errors/workout-errors';

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
 * Default delay function using setTimeout
 */
const defaultDelayFn = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Error Handler Service Factory
 */
import type {
  LogDebug,
  LogError,
  LogInfo,
  LogWarn,
  LogWithLevel,
} from '@/application/services/logger';

export const createErrorHandlerService = (
  logger: {
    info: LogInfo;
    error: LogError;
    warn: LogWarn;
    debug: LogDebug;
    log: LogWithLevel;
  },
  config: Partial<ErrorHandlerConfig> = {}
) => {
  const defaultConfig: ErrorHandlerConfig = {
    enableStackTrace: false,
    enableContextEnrichment: true,
    logLevel: 'error',
    maxRetryAttempts: 3,
    retryDelay: 1000,
    delayFn: defaultDelayFn,
  };

  const finalConfig = { ...defaultConfig, ...config };

  /**
   * Classify error severity based on error type
   */
  const classifyErrorSeverity = (error: Error): ErrorSeverity => {
    if (
      error instanceof ValidationError ||
      error instanceof WorkoutValidationError
    ) {
      return ErrorSeverity.LOW;
    }

    if (
      error instanceof AuthenticationError ||
      error instanceof AuthorizationError
    ) {
      return ErrorSeverity.MEDIUM;
    }

    if (error instanceof NetworkError || error instanceof RateLimitError) {
      return ErrorSeverity.MEDIUM;
    }

    if (error instanceof WorkoutNotFoundError) {
      return ErrorSeverity.LOW;
    }

    if (
      error instanceof UploadError ||
      error instanceof WorkoutOperationNotAllowedError
    ) {
      return ErrorSeverity.HIGH;
    }

    return ErrorSeverity.CRITICAL;
  };

  /**
   * Get status code from error type
   */
  const getStatusCodeFromError = (error: Error): number => {
    if (error instanceof TrainingPeaksError) {
      return error.statusCode || 500;
    }

    if (
      error instanceof ValidationError ||
      error instanceof WorkoutValidationError
    ) {
      return 400;
    }

    if (error instanceof AuthenticationError) {
      return 401;
    }

    if (error instanceof AuthorizationError) {
      return 403;
    }

    if (error instanceof WorkoutNotFoundError) {
      return 404;
    }

    if (error instanceof RateLimitError) {
      return 429;
    }

    if (error instanceof NetworkError || error instanceof UploadError) {
      return 500;
    }

    return 500;
  };

  /**
   * Extract error code from error type
   */
  const getErrorCodeFromError = (error: Error): string => {
    if (error instanceof TrainingPeaksError) {
      return error.code;
    }

    if (error instanceof WorkoutError) {
      return error.constructor.name.replace('Error', '').toUpperCase();
    }

    // Handle generic Error class
    const className = error.constructor.name;
    if (className === 'Error') {
      return 'ERROR';
    }

    return className.replace('Error', '').toUpperCase();
  };

  /**
   * Enrich error context with additional information
   */
  const enrichErrorContext = (
    error: Error,
    context: ErrorContext = {}
  ): ErrorContext => {
    if (!finalConfig.enableContextEnrichment) {
      return context;
    }

    const enrichedContext: ErrorContext = {
      ...context,
      timestamp: new Date(),
      operation: context.operation || 'unknown',
    };

    // Add specific context based on error type
    if (error instanceof WorkoutError) {
      enrichedContext.metadata = {
        ...enrichedContext.metadata,
        errorType: 'workout',
        errorCategory: error.constructor.name,
      };
    }

    if (
      error instanceof AuthenticationError ||
      error instanceof AuthorizationError
    ) {
      enrichedContext.metadata = {
        ...enrichedContext.metadata,
        errorType: 'authentication',
        errorCategory: error.constructor.name,
      };
    }

    return enrichedContext;
  };

  /**
   * Log error with appropriate level and context
   */
  const logError = (
    error: Error,
    context: ErrorContext,
    severity: ErrorSeverity
  ) => {
    const logMessage = `${severity.toUpperCase()} - ${error.message}`;

    const logContext = {
      ...context,
      errorName: error.constructor.name,
      errorMessage: error.message,
      severity,
      ...(finalConfig.enableStackTrace && { stackTrace: error.stack }),
    };

    switch (severity) {
      case ErrorSeverity.LOW:
        logger.info(logMessage, logContext);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn(logMessage, logContext);
        break;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        logger.error(logMessage, logContext);
        break;
    }
  };

  /**
   * Handle error with full context and return structured response
   */
  const handleError = (
    error: Error,
    context: ErrorContext = {}
  ): ErrorResponse => {
    const enrichedContext = enrichErrorContext(error, context);
    const severity = classifyErrorSeverity(error);
    const statusCode = getStatusCodeFromError(error);
    const errorCode = getErrorCodeFromError(error);

    // Log the error
    logError(error, enrichedContext, severity);

    // Create structured error response
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
        context: enrichedContext,
        ...(finalConfig.enableStackTrace && { stackTrace: error.stack }),
      },
      statusCode,
      timestamp: new Date(),
    };

    // Add details for validation errors
    if (
      error instanceof ValidationError ||
      error instanceof WorkoutValidationError
    ) {
      errorResponse.error.details = [error.message];
    }

    return errorResponse;
  };

  /**
   * Handle success response
   */
  const handleSuccess = <T>(
    data: T,
    statusCode: number = 200
  ): SuccessResponse<T> => {
    return {
      success: true,
      data,
      statusCode,
      timestamp: new Date(),
    };
  };

  /**
   * Wrap async operations with error handling
   */
  const wrapAsyncOperation = <T>(
    operation: () => Promise<T>,
    context: ErrorContext = {}
  ) => {
    return async (): Promise<ApiResponse<T>> => {
      try {
        const result = await operation();
        return handleSuccess(result);
      } catch (error) {
        return handleError(error as Error, context);
      }
    };
  };

  /**
   * Retry operation with exponential backoff
   */
  const retryOperation = async <T>(
    operation: () => Promise<T>,
    context: ErrorContext = {},
    maxAttempts: number = finalConfig.maxRetryAttempts
  ): Promise<T> => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry validation errors or authentication errors
        if (
          error instanceof ValidationError ||
          error instanceof WorkoutValidationError ||
          error instanceof AuthenticationError ||
          error instanceof AuthorizationError
        ) {
          throw error;
        }

        if (attempt === maxAttempts) {
          break;
        }

        // Log retry attempt
        logger.warn(`Operation failed, retry ${attempt}/${maxAttempts}`, {
          ...context,
          attempt,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // Wait before retrying with exponential backoff
        await finalConfig.delayFn!(finalConfig.retryDelay * 2 ** (attempt - 1));
      }
    }

    throw lastError!;
  };

  /**
   * Create error from string message with context
   */
  const createError = (
    message: string,
    code: string,
    statusCode: number = 500,
    context?: ErrorContext
  ): TrainingPeaksError => {
    const error = new TrainingPeaksError(message, code, statusCode);

    if (context && finalConfig.enableContextEnrichment) {
      // Add context to error object
      Object.defineProperty(error, 'context', {
        value: context,
        writable: false,
        enumerable: true,
        configurable: false,
      });
    }

    return error;
  };

  /**
   * Validate and transform result
   */
  const validateResult =
    <T>(
      validator: (data: T) => boolean,
      errorMessage: string = 'Validation failed'
    ) =>
    (result: T): T => {
      if (!validator(result)) {
        throw new ValidationError(errorMessage);
      }
      return result;
    };

  return {
    handleError,
    handleSuccess,
    wrapAsyncOperation,
    retryOperation,
    createError,
    validateResult,
    classifyErrorSeverity,
    getStatusCodeFromError,
    getErrorCodeFromError,
    enrichErrorContext,
  };
};

/**
 * Error handler service type
 */
export type ErrorHandlerService = ReturnType<typeof createErrorHandlerService>;
