/**
 * Retry Handler Tests
 * Essential tests to validate retry mechanism functionality
 */

import {
  clientErrorBuilder,
  serverErrorBuilder,
} from '@fixtures/utils.fixture';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '../errors/http-errors';
import { DEFAULT_RETRY_CONFIG, RetryHandler } from './retry-handler';

describe('RetryHandler', () => {
  let retryHandler: RetryHandler;
  const originalProcessListeners: Record<string, NodeJS.EventListener[]> = {};

  beforeEach(() => {
    retryHandler = new RetryHandler(DEFAULT_RETRY_CONFIG);
    vi.clearAllTimers();
    vi.useFakeTimers();

    // Store original listeners
    originalProcessListeners.unhandledRejection =
      process.listeners('unhandledRejection');
    originalProcessListeners.rejectionHandled =
      process.listeners('rejectionHandled');

    // Remove all existing listeners to prevent warnings during tests
    process.removeAllListeners('unhandledRejection');
    process.removeAllListeners('rejectionHandled');

    // Add a quiet handler that does nothing
    process.on('unhandledRejection', () => {});
    process.on('rejectionHandled', () => {});
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();

    // Restore original listeners
    process.removeAllListeners('unhandledRejection');
    process.removeAllListeners('rejectionHandled');

    originalProcessListeners.unhandledRejection?.forEach((listener) => {
      process.on(
        'unhandledRejection',
        listener as NodeJS.UnhandledRejectionListener
      );
    });
    originalProcessListeners.rejectionHandled?.forEach((listener) => {
      process.on(
        'rejectionHandled',
        listener as NodeJS.RejectionHandledListener
      );
    });
  });

  describe('Successful Operations', () => {
    it('should return result on first try when operation succeeds', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await retryHandler.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Retryable Errors', () => {
    it('should retry on 500 server errors', async () => {
      // Arrange
      const serverError = serverErrorBuilder.build({
        message: 'Server Error',
        status: 500,
        statusText: 'Internal Server Error',
      });

      const operation = vi
        .fn()
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError)
        .mockResolvedValue('success');

      // Act
      const promise = retryHandler.execute(operation);
      await vi.runAllTimersAsync();
      const result = await promise;

      // Assert
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should retry on 503 service unavailable', async () => {
      // Arrange
      const serviceError = serverErrorBuilder.build({
        message: 'Service Unavailable',
        code: 'SERVICE_ERROR',
        status: 503,
        statusText: 'Service Unavailable',
      });

      const operation = vi
        .fn()
        .mockRejectedValueOnce(serviceError)
        .mockResolvedValue('success');

      // Act
      const promise = retryHandler.execute(operation);
      await vi.runAllTimersAsync();
      const result = await promise;

      // Assert
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should respect max retry attempts', async () => {
      // Arrange
      const serverError = serverErrorBuilder.build({
        message: 'Server Error',
        status: 500,
        statusText: 'Internal Server Error',
      });

      const operation = vi.fn().mockRejectedValue(serverError);

      // Act
      let caughtError: unknown = null;
      try {
        const promise = retryHandler.execute(operation);
        await vi.runAllTimersAsync();
        await promise;
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError).toEqual(serverError);
      expect(operation).toHaveBeenCalledTimes(DEFAULT_RETRY_CONFIG.attempts);
    });
  });

  describe('Non-retryable Errors', () => {
    it('should not retry on 400 client errors', async () => {
      // Arrange
      const clientError = clientErrorBuilder.build({
        message: 'Bad Request',
        status: 400,
        statusText: 'Bad Request',
      });

      const operation = vi.fn().mockRejectedValue(clientError);

      // Act & Assert
      await expect(retryHandler.execute(operation)).rejects.toThrow(
        clientError
      );
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should not retry on 401 unauthorized errors', async () => {
      // Arrange
      const authError = clientErrorBuilder.build({
        message: 'Unauthorized',
        code: 'AUTH_ERROR',
        status: 401,
        statusText: 'Unauthorized',
      });

      const operation = vi.fn().mockRejectedValue(authError);

      // Act & Assert
      await expect(retryHandler.execute(operation)).rejects.toThrow(authError);
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Exponential Backoff', () => {
    it('should implement exponential backoff with increasing delays', async () => {
      const handler = new RetryHandler({
        attempts: 3,
        delay: 1000,
        backoff: 2,
        jitter: false, // Disable jitter for predictable testing
      });

      const serverError = new HttpError('Server Error', 'SERVER_ERROR', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      const operation = vi.fn().mockRejectedValue(serverError);

      let caughtError: unknown = null;
      const promiseHandler = async () => {
        try {
          const promise = handler.execute(operation);

          // Initially called once
          expect(operation).toHaveBeenCalledTimes(1);

          // After first delay (1000ms), should be called second time
          await vi.advanceTimersByTimeAsync(1000);
          expect(operation).toHaveBeenCalledTimes(2);

          // After second delay (2000ms), should be called third time
          await vi.advanceTimersByTimeAsync(2000);
          expect(operation).toHaveBeenCalledTimes(3);

          await promise;
        } catch (error) {
          caughtError = error;
        }
      };

      await promiseHandler();
      expect(caughtError).toEqual(serverError);
    });
  });

  describe('Configuration', () => {
    it('should respect custom retry configuration', async () => {
      const customHandler = new RetryHandler({
        attempts: 2,
        delay: 500,
        backoff: 3,
        jitter: false,
      });

      const serverError = new HttpError('Server Error', 'SERVER_ERROR', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      const operation = vi.fn().mockRejectedValue(serverError);

      let caughtError: unknown = null;
      try {
        const promise = customHandler.execute(operation);
        await vi.runAllTimersAsync();
        await promise;
      } catch (error) {
        caughtError = error;
      }

      expect(caughtError).toEqual(serverError);
      expect(operation).toHaveBeenCalledTimes(2); // Custom attempts
    });
  });
});
