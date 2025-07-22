/**
 * Error Handler Service Implementation
 * Individual function implementations that receive dependencies as parameters
 */

import type {
  ApiResponse,
  ClassifyErrorSeverity,
  CreateError,
  EnrichErrorContext,
  ErrorContext,
  ErrorHandlerConfig,
  ErrorResponse,
  GetErrorCodeFromError,
  GetStatusCodeFromError,
  HandleError,
  HandleSuccess,
  RetryOperation,
  SuccessResponse,
  ValidateResult,
  WrapAsyncOperation,
} from '@/application/services/error-handler';
import { ErrorSeverity } from '@/application/services/error-handler';
import type {
  LogDebug,
  LogError,
  LogInfo,
  LogWarn,
  LogWithLevel,
} from '@/application/services/logger';
import {
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  RateLimitError,
  TrainingPeaksError,
  UploadError,
  ValidationError,
} from '@/domain/errors/index';
import { WorkoutValidationError } from '@/domain/errors/workout-errors';

/**
 * Default delay function using setTimeout
 */
const defaultDelayFn = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Classify error severity based on error type
 */
export const classifyErrorSeverity =
  (): ClassifyErrorSeverity =>
  (error: Error): ErrorSeverity => {
    // Check for validation errors
    if (
      error instanceof ValidationError ||
      error.constructor.name === 'WorkoutValidationError'
    ) {
      return ErrorSeverity.LOW;
    }

    // Check for authentication/authorization errors
    if (
      error instanceof AuthenticationError ||
      error instanceof AuthorizationError
    ) {
      return ErrorSeverity.MEDIUM;
    }

    // Check for network/rate limit errors
    if (error instanceof NetworkError || error instanceof RateLimitError) {
      return ErrorSeverity.MEDIUM;
    }

    // Check for workout not found errors
    if (error.constructor.name === 'WorkoutNotFoundError') {
      return ErrorSeverity.LOW;
    }

    // Check for upload/operation errors
    if (
      error instanceof UploadError ||
      error.constructor.name === 'WorkoutOperationNotAllowedError'
    ) {
      return ErrorSeverity.HIGH;
    }

    return ErrorSeverity.CRITICAL;
  };

/**
 * Get status code from error type
 */
export const getStatusCodeFromError =
  (): GetStatusCodeFromError =>
  (error: Error): number => {
    if (error instanceof TrainingPeaksError) {
      return error.statusCode || 500;
    }

    if (
      error instanceof ValidationError ||
      error.constructor.name === 'WorkoutValidationError'
    ) {
      return 400;
    }

    if (error instanceof AuthenticationError) {
      return 401;
    }

    if (error instanceof AuthorizationError) {
      return 403;
    }

    if (error.constructor.name === 'WorkoutNotFoundError') {
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
export const getErrorCodeFromError =
  (): GetErrorCodeFromError =>
  (error: Error): string => {
    if (error instanceof TrainingPeaksError) {
      return error.code;
    }

    // Handle workout errors specifically
    if (
      error.constructor.name === 'WorkoutError' ||
      error.constructor.name === 'WorkoutValidationError' ||
      error.constructor.name === 'WorkoutNotFoundError' ||
      error.constructor.name === 'WorkoutOperationNotAllowedError' ||
      error.constructor.name === 'WorkoutUploadError' ||
      error.constructor.name === 'WorkoutFileProcessingError' ||
      error.constructor.name === 'WorkoutStructureError' ||
      error.constructor.name === 'WorkoutServiceUnavailableError' ||
      error.constructor.name === 'WorkoutDataCorruptionError' ||
      error.constructor.name === 'WorkoutQuotaExceededError' ||
      error.constructor.name === 'WorkoutSyncError'
    ) {
      return (error as TrainingPeaksError).code;
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
export const enrichErrorContext =
  (config: ErrorHandlerConfig): EnrichErrorContext =>
  (error: Error, context: ErrorContext = {}): ErrorContext => {
    if (!config.enableContextEnrichment) {
      return context;
    }

    const enrichedContext: ErrorContext = {
      ...context,
      timestamp: new Date(),
      operation: context.operation || 'unknown',
    };

    // Add specific context based on error type
    if (
      error.constructor.name === 'WorkoutError' ||
      error.constructor.name === 'WorkoutValidationError' ||
      error.constructor.name === 'WorkoutNotFoundError' ||
      error.constructor.name === 'WorkoutOperationNotAllowedError' ||
      error.constructor.name === 'WorkoutUploadError' ||
      error.constructor.name === 'WorkoutFileProcessingError' ||
      error.constructor.name === 'WorkoutStructureError' ||
      error.constructor.name === 'WorkoutServiceUnavailableError' ||
      error.constructor.name === 'WorkoutDataCorruptionError' ||
      error.constructor.name === 'WorkoutQuotaExceededError' ||
      error.constructor.name === 'WorkoutSyncError'
    ) {
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
 * Handle error with full context and return structured response
 */
export const handleError =
  (
    logger: {
      info: LogInfo;
      error: LogError;
      warn: LogWarn;
      debug: LogDebug;
      log: LogWithLevel;
    },
    config: ErrorHandlerConfig
  ): HandleError =>
  (error: Error, context: ErrorContext = {}): ErrorResponse => {
    const enrichedContext = enrichErrorContext(config)(error, context);
    const severity = classifyErrorSeverity()(error);
    const statusCode = getStatusCodeFromError()(error);
    const errorCode = getErrorCodeFromError()(error);

    // Log the error
    const logMessage = `${severity.toUpperCase()} - ${error.message}`;
    const logContext = {
      ...enrichedContext,
      errorName: error.constructor.name,
      errorMessage: error.message,
      severity,
      ...(config.enableStackTrace && { stackTrace: error.stack }),
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

    // Create structured error response
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
        context: enrichedContext,
        ...(config.enableStackTrace && { stackTrace: error.stack }),
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
export const handleSuccess =
  (): HandleSuccess =>
  <T>(data: T, statusCode: number = 200): SuccessResponse<T> => {
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
export const wrapAsyncOperation =
  (
    logger: {
      info: LogInfo;
      error: LogError;
      warn: LogWarn;
      debug: LogDebug;
      log: LogWithLevel;
    },
    config: ErrorHandlerConfig
  ): WrapAsyncOperation =>
  <T>(operation: () => Promise<T>, context: ErrorContext = {}) =>
  async (): Promise<ApiResponse<T>> => {
    try {
      const result = await operation();
      return handleSuccess()(result);
    } catch (error) {
      return handleError(logger, config)(error as Error, context);
    }
  };

/**
 * Retry operation with exponential backoff
 */
export const retryOperation =
  (
    logger: {
      info: LogInfo;
      error: LogError;
      warn: LogWarn;
      debug: LogDebug;
      log: LogWithLevel;
    },
    config: ErrorHandlerConfig
  ): RetryOperation =>
  async <T>(
    operation: () => Promise<T>,
    context: ErrorContext = {},
    maxAttempts: number = config.maxRetryAttempts
  ): Promise<T> => {
    let lastError: Error;
    const delayFn = config.delayFn || defaultDelayFn;

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
        await delayFn(config.retryDelay * 2 ** (attempt - 1));
      }
    }

    throw lastError!;
  };

/**
 * Create error from string message with context
 */
export const createError =
  (config: ErrorHandlerConfig): CreateError =>
  (
    message: string,
    code: string,
    statusCode: number = 500,
    context?: ErrorContext
  ): TrainingPeaksError => {
    const error = new TrainingPeaksError(message, code, statusCode);

    if (context && config.enableContextEnrichment) {
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
export const validateResult =
  (): ValidateResult =>
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

// Keep the existing grouped function for backward compatibility
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

  return {
    handleError: handleError(logger, finalConfig),
    handleSuccess: handleSuccess(),
    wrapAsyncOperation: wrapAsyncOperation(logger, finalConfig),
    retryOperation: retryOperation(logger, finalConfig),
    createError: createError(finalConfig),
    validateResult: validateResult(),
    classifyErrorSeverity: classifyErrorSeverity(),
    getStatusCodeFromError: getStatusCodeFromError(),
    getErrorCodeFromError: getErrorCodeFromError(),
    enrichErrorContext: enrichErrorContext(finalConfig),
  };
};

/**
 * Error handler service type
 */
export type ErrorHandlerService = ReturnType<typeof createErrorHandlerService>;
