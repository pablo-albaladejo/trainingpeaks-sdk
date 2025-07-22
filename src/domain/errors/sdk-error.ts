/**
 * SDK Error Class
 * Custom error class for consistent error handling across the SDK
 */

import {
  ERROR_CODES,
  ERROR_MESSAGES,
  ERROR_STATUS_CODES,
  type ErrorCode,
} from './error-codes';

export interface SDKErrorContext {
  operation?: string;
  resource?: string;
  userId?: string;
  workoutId?: string;
  fileName?: string;
  [key: string]: unknown;
}

export class SDKError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly context: SDKErrorContext;
  public readonly timestamp: Date;
  public readonly originalError?: Error;

  constructor(
    code: ErrorCode,
    message?: string,
    context: SDKErrorContext = {},
    originalError?: Error
  ) {
    const defaultMessage = ERROR_MESSAGES[code];
    const finalMessage = message || defaultMessage;

    super(finalMessage);

    this.name = 'SDKError';
    this.code = code;
    this.statusCode = ERROR_STATUS_CODES[code];
    this.context = context;
    this.timestamp = new Date();
    this.originalError = originalError;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, SDKError.prototype);
  }

  /**
   * Create an authentication error
   */
  static authFailed(
    message?: string,
    context?: SDKErrorContext,
    originalError?: Error
  ): SDKError {
    return new SDKError(
      ERROR_CODES.AUTH_FAILED,
      message,
      context,
      originalError
    );
  }

  /**
   * Create a token expired error
   */
  static tokenExpired(context?: SDKErrorContext): SDKError {
    return new SDKError(ERROR_CODES.AUTH_TOKEN_EXPIRED, undefined, context);
  }

  /**
   * Create an invalid credentials error
   */
  static invalidCredentials(context?: SDKErrorContext): SDKError {
    return new SDKError(
      ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      undefined,
      context
    );
  }

  /**
   * Create a user not found error
   */
  static userNotFound(context?: SDKErrorContext): SDKError {
    return new SDKError(ERROR_CODES.AUTH_USER_NOT_FOUND, undefined, context);
  }

  /**
   * Create a workout creation error
   */
  static workoutCreationFailed(
    message?: string,
    context?: SDKErrorContext,
    originalError?: Error
  ): SDKError {
    return new SDKError(
      ERROR_CODES.WORKOUT_CREATION_FAILED,
      message,
      context,
      originalError
    );
  }

  /**
   * Create a workout upload error
   */
  static workoutUploadFailed(
    message?: string,
    context?: SDKErrorContext,
    originalError?: Error
  ): SDKError {
    return new SDKError(
      ERROR_CODES.WORKOUT_UPLOAD_FAILED,
      message,
      context,
      originalError
    );
  }

  /**
   * Create a workout validation error
   */
  static workoutValidationFailed(
    message?: string,
    context?: SDKErrorContext
  ): SDKError {
    return new SDKError(
      ERROR_CODES.WORKOUT_VALIDATION_FAILED,
      message,
      context
    );
  }

  /**
   * Create a workout not found error
   */
  static workoutNotFound(
    workoutId: string,
    context?: SDKErrorContext
  ): SDKError {
    return new SDKError(ERROR_CODES.WORKOUT_NOT_FOUND, undefined, {
      workoutId,
      ...context,
    });
  }

  /**
   * Create a file error
   */
  static fileError(
    code: ErrorCode,
    message?: string,
    context?: SDKErrorContext,
    originalError?: Error
  ): SDKError {
    return new SDKError(code, message, context, originalError);
  }

  /**
   * Create a validation error
   */
  static validationFailed(
    message?: string,
    context?: SDKErrorContext
  ): SDKError {
    return new SDKError(ERROR_CODES.VALIDATION_FAILED, message, context);
  }

  /**
   * Create an internal error
   */
  static internalError(
    message?: string,
    context?: SDKErrorContext,
    originalError?: Error
  ): SDKError {
    return new SDKError(
      ERROR_CODES.INTERNAL_ERROR,
      message,
      context,
      originalError
    );
  }

  /**
   * Create an unknown error
   */
  static unknownError(
    message?: string,
    context?: SDKErrorContext,
    originalError?: Error
  ): SDKError {
    return new SDKError(
      ERROR_CODES.UNKNOWN_ERROR,
      message,
      context,
      originalError
    );
  }

  /**
   * Convert any error to SDKError
   */
  static fromError(
    error: Error,
    code: ErrorCode = ERROR_CODES.UNKNOWN_ERROR,
    context?: SDKErrorContext
  ): SDKError {
    if (error instanceof SDKError) {
      return error;
    }

    return new SDKError(code, error.message, context, error);
  }

  /**
   * Get error details for logging
   */
  toLogObject(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : undefined,
    };
  }

  /**
   * Get error response for API
   */
  toResponse(): {
    error: {
      code: string;
      message: string;
      statusCode: number;
      timestamp: string;
      context?: SDKErrorContext;
    };
  } {
    return {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp.toISOString(),
        context:
          Object.keys(this.context).length > 0 ? this.context : undefined,
      },
    };
  }
}
