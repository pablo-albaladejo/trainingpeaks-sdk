/**
 * Simple but effective retry handler for HTTP requests
 * Implements exponential backoff with jitter to prevent thundering herd
 */

import { isRetryableError } from '@/adapters/errors/http-errors';
import type { Logger } from '@/adapters/logging/logger';

export type RetryConfig = {
  attempts: number;
  delay: number;
  backoff: number;
  maxDelay?: number;
  jitter?: boolean;
};

export class RetryHandler {
  constructor(private config: RetryConfig) {
    this.config = {
      maxDelay: 30000, // 30 seconds max
      jitter: true,
      ...config,
    };
  }

  async execute<T>(
    operation: () => Promise<T>,
    context?: {
      url?: string;
      method?: string;
      requestId?: string;
      logger?: Logger;
    }
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.config.attempts; attempt++) {
      try {
        if (attempt > 1 && context?.logger) {
          context.logger.warn('Retrying HTTP request', {
            requestId: context.requestId,
            attempt,
            totalAttempts: this.config.attempts,
            url: context.url,
            method: context.method,
          });
        }

        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry on last attempt or non-retryable errors
        if (attempt === this.config.attempts || !isRetryableError(error)) {
          if (context?.logger) {
            context.logger.error('HTTP request failed after retries', {
              requestId: context.requestId,
              finalAttempt: attempt,
              totalAttempts: this.config.attempts,
              url: context.url,
              method: context.method,
              error: error instanceof Error ? error.message : String(error),
              errorCode:
                error && typeof error === 'object' && 'code' in error
                  ? (error as { code: unknown }).code
                  : undefined,
              retryable: isRetryableError(error),
            });
          }
          throw error;
        }

        const delay = this.calculateDelay(attempt);
        if (context?.logger) {
          context.logger.info('HTTP request failed, will retry', {
            requestId: context.requestId,
            attempt,
            totalAttempts: this.config.attempts,
            nextRetryIn: `${Math.round(delay)}ms`,
            url: context.url,
            method: context.method,
            error: error instanceof Error ? error.message : String(error),
            errorCode:
              error && typeof error === 'object' && 'code' in error
                ? (error as { code: unknown }).code
                : undefined,
          });
        }

        await this.delay(attempt);
      }
    }

    // Should never reach here, but TypeScript needs it
    throw lastError;
  }

  private calculateDelay(attempt: number): number {
    let delay = this.config.delay * Math.pow(this.config.backoff, attempt - 1);

    // Apply max delay limit
    if (this.config.maxDelay) {
      delay = Math.min(delay, this.config.maxDelay);
    }

    // Add jitter to prevent thundering herd
    if (this.config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return delay;
  }

  private async delay(attempt: number): Promise<void> {
    const delay = this.calculateDelay(attempt);
    return new Promise((resolve) => setTimeout(resolve, Math.round(delay)));
  }
}

/**
 * Default retry configuration for most use cases
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  attempts: 3,
  delay: 1000, // 1 second
  backoff: 2, // Double each time
  maxDelay: 10000, // 10 seconds max
  jitter: true,
};
