/**
 * Error Handler Service Tests
 * Comprehensive test suite for the Error Handler Service
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorSeverity } from '../../application/services/error-handler';
import {
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  RateLimitError,
  TrainingPeaksError,
  UploadError,
  ValidationError,
} from '../../domain/errors/index';
import {
  WorkoutError,
  WorkoutNotFoundError,
  WorkoutOperationNotAllowedError,
  WorkoutValidationError,
} from '../../domain/errors/workout-errors';
import { createErrorHandlerService } from './error-handler';

// Mock logger
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  log: vi.fn(),
};

// Mock delay function that doesn't actually delay
const mockDelayFn = vi.fn().mockResolvedValue(undefined);

describe('Error Handler Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDelayFn.mockClear();
  });

  describe('createErrorHandlerService', () => {
    it('should create error handler service with default configuration', () => {
      const errorHandler = createErrorHandlerService(mockLogger);

      expect(errorHandler).toBeDefined();
      expect(errorHandler.handleError).toBeDefined();
      expect(errorHandler.handleSuccess).toBeDefined();
      expect(errorHandler.wrapAsyncOperation).toBeDefined();
      expect(errorHandler.retryOperation).toBeDefined();
      expect(errorHandler.createError).toBeDefined();
      expect(errorHandler.validateResult).toBeDefined();
    });

    it('should create error handler service with custom configuration', () => {
      const customConfig = {
        enableStackTrace: true,
        enableContextEnrichment: false,
        logLevel: 'warn' as const,
        maxRetryAttempts: 5,
        retryDelay: 2000,
      };

      const errorHandler = createErrorHandlerService(mockLogger, customConfig);

      expect(errorHandler).toBeDefined();
    });
  });

  describe('classifyErrorSeverity', () => {
    const errorHandler = createErrorHandlerService(mockLogger);

    it('should classify validation errors as LOW severity', () => {
      const validationError = new ValidationError('Invalid input');
      const workoutValidationError = new WorkoutValidationError(
        'Invalid workout'
      );

      expect(errorHandler.classifyErrorSeverity(validationError)).toBe(
        ErrorSeverity.LOW
      );
      expect(errorHandler.classifyErrorSeverity(workoutValidationError)).toBe(
        ErrorSeverity.LOW
      );
    });

    it('should classify authentication errors as MEDIUM severity', () => {
      const authError = new AuthenticationError('Invalid credentials');
      const authzError = new AuthorizationError('Insufficient permissions');

      expect(errorHandler.classifyErrorSeverity(authError)).toBe(
        ErrorSeverity.MEDIUM
      );
      expect(errorHandler.classifyErrorSeverity(authzError)).toBe(
        ErrorSeverity.MEDIUM
      );
    });

    it('should classify network errors as MEDIUM severity', () => {
      const networkError = new NetworkError('Network timeout');
      const rateLimitError = new RateLimitError('Rate limit exceeded');

      expect(errorHandler.classifyErrorSeverity(networkError)).toBe(
        ErrorSeverity.MEDIUM
      );
      expect(errorHandler.classifyErrorSeverity(rateLimitError)).toBe(
        ErrorSeverity.MEDIUM
      );
    });

    it('should classify workout not found as LOW severity', () => {
      const notFoundError = new WorkoutNotFoundError('workout-123');

      expect(errorHandler.classifyErrorSeverity(notFoundError)).toBe(
        ErrorSeverity.LOW
      );
    });

    it('should classify upload errors as HIGH severity', () => {
      const uploadError = new UploadError('Upload failed');
      const operationError = new WorkoutOperationNotAllowedError(
        'delete',
        'Workout is locked'
      );

      expect(errorHandler.classifyErrorSeverity(uploadError)).toBe(
        ErrorSeverity.HIGH
      );
      expect(errorHandler.classifyErrorSeverity(operationError)).toBe(
        ErrorSeverity.HIGH
      );
    });

    it('should classify unknown errors as CRITICAL severity', () => {
      const unknownError = new Error('Unknown error');

      expect(errorHandler.classifyErrorSeverity(unknownError)).toBe(
        ErrorSeverity.CRITICAL
      );
    });
  });

  describe('getStatusCodeFromError', () => {
    const errorHandler = createErrorHandlerService(mockLogger);

    it('should return correct status codes for different error types', () => {
      expect(
        errorHandler.getStatusCodeFromError(new ValidationError('test'))
      ).toBe(400);
      expect(
        errorHandler.getStatusCodeFromError(new AuthenticationError('test'))
      ).toBe(401);
      expect(
        errorHandler.getStatusCodeFromError(new AuthorizationError('test'))
      ).toBe(403);
      expect(
        errorHandler.getStatusCodeFromError(new WorkoutNotFoundError('test'))
      ).toBe(404);
      expect(
        errorHandler.getStatusCodeFromError(new RateLimitError('test'))
      ).toBe(429);
      expect(
        errorHandler.getStatusCodeFromError(new NetworkError('test'))
      ).toBe(500);
      expect(errorHandler.getStatusCodeFromError(new UploadError('test'))).toBe(
        500
      );
      expect(errorHandler.getStatusCodeFromError(new Error('test'))).toBe(500);
    });

    it('should return status code from TrainingPeaksError', () => {
      const tpError = new TrainingPeaksError('test', 'TEST_ERROR', 418);
      expect(errorHandler.getStatusCodeFromError(tpError)).toBe(418);
    });
  });

  describe('getErrorCodeFromError', () => {
    const errorHandler = createErrorHandlerService(mockLogger);

    it('should return correct error codes for different error types', () => {
      expect(
        errorHandler.getErrorCodeFromError(new ValidationError('test'))
      ).toBe('VALIDATION_ERROR');
      expect(
        errorHandler.getErrorCodeFromError(new AuthenticationError('test'))
      ).toBe('AUTHENTICATION_ERROR');
      expect(
        errorHandler.getErrorCodeFromError(new WorkoutNotFoundError('test-id'))
      ).toBe('WORKOUT_NOT_FOUND');
      expect(errorHandler.getErrorCodeFromError(new Error('test'))).toBe(
        'ERROR'
      );
    });

    it('should return code from TrainingPeaksError', () => {
      const tpError = new TrainingPeaksError('test', 'CUSTOM_ERROR', 500);
      expect(errorHandler.getErrorCodeFromError(tpError)).toBe('CUSTOM_ERROR');
    });
  });

  describe('enrichErrorContext', () => {
    it('should enrich error context with additional information', () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const error = new WorkoutValidationError('Test workout validation error');
      const context = {
        userId: '123',
        operation: 'createWorkout',
      };

      const enrichedContext = errorHandler.enrichErrorContext(error, context);

      expect(enrichedContext.userId).toBe('123');
      expect(enrichedContext.operation).toBe('createWorkout');
      expect(enrichedContext.timestamp).toBeInstanceOf(Date);
      expect(enrichedContext.metadata?.errorType).toBe('workout');
      expect(enrichedContext.metadata?.errorCategory).toBe(
        'WorkoutValidationError'
      );
    });

    it('should not enrich context when enrichment is disabled', () => {
      const errorHandler = createErrorHandlerService(mockLogger, {
        enableContextEnrichment: false,
      });
      const error = new WorkoutError('Test workout error');
      const context = {
        userId: '123',
        operation: 'createWorkout',
      };

      const enrichedContext = errorHandler.enrichErrorContext(error, context);

      expect(enrichedContext).toEqual(context);
    });
  });

  describe('handleError', () => {
    it('should handle error and return structured response', () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const error = new ValidationError('Invalid input');
      const context = {
        userId: '123',
        operation: 'createWorkout',
      };

      const result = errorHandler.handleError(error, context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Invalid input');
      expect(result.error.context).toBeDefined();
      expect(result.error.context?.userId).toBe('123');
      expect(result.error.context?.operation).toBe('createWorkout');
      expect(result.statusCode).toBe(400);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should include stack trace when enabled', () => {
      const errorHandler = createErrorHandlerService(mockLogger, {
        enableStackTrace: true,
      });
      const error = new ValidationError('Invalid input');

      const result = errorHandler.handleError(error);

      expect(result.error.stackTrace).toBeDefined();
    });

    it('should include details for validation errors', () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const error = new ValidationError('Invalid input');

      const result = errorHandler.handleError(error);

      expect(result.error.details).toEqual(['Invalid input']);
    });

    it('should log error with appropriate severity', () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const error = new ValidationError('Invalid input');

      errorHandler.handleError(error);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'LOW - Invalid input',
        expect.objectContaining({
          errorName: 'ValidationError',
          errorMessage: 'Invalid input',
          severity: ErrorSeverity.LOW,
        })
      );
    });
  });

  describe('handleSuccess', () => {
    it('should handle success response with data', () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const data = { id: 1, name: 'Test' };

      const result = errorHandler.handleSuccess(data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.statusCode).toBe(200);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should handle success response with custom status code', () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const data = { id: 1 };

      const result = errorHandler.handleSuccess(data, 201);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.statusCode).toBe(201);
    });

    it('should validate and return valid result', () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const result = { valid: true };
      const validator = (data: { valid: boolean }) => data.valid === true;

      const validatedResult = errorHandler.validateResult(validator)(result);

      expect(validatedResult).toEqual(result);
    });

    it('should throw validation error for invalid result', () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const result = { valid: false };
      const validator = (data: { valid: boolean }) => data.valid === true;

      expect(() => errorHandler.validateResult(validator)(result)).toThrow(
        ValidationError
      );
    });

    it('should throw validation error with custom message', () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const result = { valid: false };
      const validator = (data: { valid: boolean }) => data.valid === true;

      expect(() =>
        errorHandler.validateResult(
          validator,
          'Custom validation error'
        )(result)
      ).toThrow('Custom validation error');
    });
  });

  describe('wrapAsyncOperation', () => {
    it('should wrap successful async operation', async () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const operation = vi.fn().mockResolvedValue({ success: true });
      const context = { operation: 'test' };

      const wrappedOperation = errorHandler.wrapAsyncOperation(
        operation,
        context
      );
      const result = await wrappedOperation();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ success: true });
      }
      expect(operation).toHaveBeenCalledOnce();
    });

    it('should wrap failed async operation', async () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const operation = vi
        .fn()
        .mockRejectedValue(new ValidationError('Invalid input'));
      const context = { operation: 'test' };

      const wrappedOperation = errorHandler.wrapAsyncOperation(
        operation,
        context
      );
      const result = await wrappedOperation();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('VALIDATION_ERROR');
        expect(result.error?.message).toBe('Invalid input');
      }
      expect(operation).toHaveBeenCalledOnce();
    });
  });

  describe('retryOperation', () => {
    it('should succeed on first attempt', async () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const operation = vi.fn().mockResolvedValue('success');
      const context = { operation: 'test' };

      const result = await errorHandler.retryOperation(operation, context, 3);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const errorHandler = createErrorHandlerService(mockLogger, {
        delayFn: mockDelayFn,
      });
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new NetworkError('Network timeout'))
        .mockRejectedValueOnce(new NetworkError('Network timeout'))
        .mockResolvedValue('success');
      const context = { operation: 'test' };

      const result = await errorHandler.retryOperation(operation, context, 3);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
      expect(mockLogger.warn).toHaveBeenCalledTimes(2);
      expect(mockDelayFn).toHaveBeenCalledTimes(2);
      expect(mockDelayFn).toHaveBeenCalledWith(1000); // First retry delay
      expect(mockDelayFn).toHaveBeenCalledWith(2000); // Second retry delay
    });

    it('should not retry validation errors', async () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const operation = vi
        .fn()
        .mockRejectedValue(new ValidationError('Invalid input'));
      const context = { operation: 'test' };

      await expect(
        errorHandler.retryOperation(operation, context, 3)
      ).rejects.toThrow('Invalid input');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should not retry authentication errors', async () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const operation = vi
        .fn()
        .mockRejectedValue(new AuthenticationError('Invalid credentials'));
      const context = { operation: 'test' };

      await expect(
        errorHandler.retryOperation(operation, context, 3)
      ).rejects.toThrow('Invalid credentials');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should exhaust retries and throw last error', async () => {
      const errorHandler = createErrorHandlerService(mockLogger, {
        delayFn: mockDelayFn,
      });
      const operation = vi
        .fn()
        .mockRejectedValue(new NetworkError('Network timeout'));
      const context = { operation: 'test' };

      await expect(
        errorHandler.retryOperation(operation, context, 3)
      ).rejects.toThrow('Network timeout');
      expect(operation).toHaveBeenCalledTimes(3);
      expect(mockLogger.warn).toHaveBeenCalledTimes(2);
      expect(mockDelayFn).toHaveBeenCalledTimes(2);
      expect(mockDelayFn).toHaveBeenCalledWith(1000); // First retry delay
      expect(mockDelayFn).toHaveBeenCalledWith(2000); // Second retry delay
    });
  });

  describe('createError', () => {
    it('should create TrainingPeaksError with context', () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const context = { userId: '123', operation: 'test' };

      const error = errorHandler.createError(
        'Test error',
        'TEST_ERROR',
        400,
        context
      );

      expect(error).toBeInstanceOf(TrainingPeaksError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(
        (error as TrainingPeaksError & { context: unknown }).context
      ).toEqual(context);
    });

    it('should create error without context when enrichment is disabled', () => {
      const errorHandler = createErrorHandlerService(mockLogger, {
        enableContextEnrichment: false,
      });
      const context = { userId: '123', operation: 'test' };

      const error = errorHandler.createError(
        'Test error',
        'TEST_ERROR',
        400,
        context
      );

      expect(error).toBeInstanceOf(TrainingPeaksError);
      expect(
        (error as TrainingPeaksError & { context?: unknown }).context
      ).toBeUndefined();
    });
  });

  describe('validateResult', () => {
    it('should validate and return valid result', () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const result = { valid: true };
      const validator = (data: { valid: boolean }) => data.valid === true;

      const validatedResult = errorHandler.validateResult(validator)(result);

      expect(validatedResult).toEqual(result);
    });

    it('should throw validation error for invalid result', () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const result = { valid: false };
      const validator = (data: { valid: boolean }) => data.valid === true;

      expect(() => errorHandler.validateResult(validator)(result)).toThrow(
        ValidationError
      );
    });

    it('should throw validation error with custom message', () => {
      const errorHandler = createErrorHandlerService(mockLogger);
      const result = { valid: false };
      const validator = (data: { valid: boolean }) => data.valid === true;

      expect(() =>
        errorHandler.validateResult(
          validator,
          'Custom validation error'
        )(result)
      ).toThrow('Custom validation error');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex error scenarios with full context', async () => {
      const errorHandler = createErrorHandlerService(mockLogger, {
        enableStackTrace: true,
        enableContextEnrichment: true,
        maxRetryAttempts: 2,
        delayFn: mockDelayFn,
      });

      const operation = vi
        .fn()
        .mockRejectedValueOnce(new NetworkError('Temporary failure'))
        .mockRejectedValue(new WorkoutValidationError('Invalid workout data'));

      const context = {
        userId: '123',
        workoutId: 'workout-456',
        operation: 'createWorkout',
        metadata: { title: 'Test Workout' },
      };

      await expect(
        errorHandler.retryOperation(operation, context, 2)
      ).rejects.toThrow('Invalid workout data');

      expect(operation).toHaveBeenCalledTimes(2);
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
      expect(mockDelayFn).toHaveBeenCalledTimes(1);
      expect(mockDelayFn).toHaveBeenCalledWith(1000); // First retry delay
    });

    it('should handle wrapped operation with success after retry', async () => {
      const errorHandler = createErrorHandlerService(mockLogger, {
        delayFn: mockDelayFn,
      });
      let attempts = 0;
      const operation = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts === 1) {
          return Promise.reject(new NetworkError('Network failure'));
        }
        return Promise.resolve({ data: 'success' });
      });

      const context = { operation: 'test' };

      // Since wrapAsyncOperation doesn't retry by default, we need to test retry separately
      const result = await errorHandler.retryOperation(operation, context, 2);

      expect(result).toEqual({ data: 'success' });
      expect(operation).toHaveBeenCalledTimes(2);
      expect(mockDelayFn).toHaveBeenCalledTimes(1);
      expect(mockDelayFn).toHaveBeenCalledWith(1000); // First retry delay
    });
  });
});
