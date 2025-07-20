/**
 * Logging Utilities
 * Helper functions for structured logging and performance tracking
 */

import { type LogContext, type LogLevel } from '@/application/services/logger';
import { createLoggerService } from '@/infrastructure/services/logger';

// Type alias for logger service instance
type LoggerInstance = ReturnType<typeof createLoggerService>;

/**
 * Performance measurement type
 */
export type PerformanceMetrics = {
  duration: number;
  startTime: number;
  endTime: number;
  operationName: string;
  metadata?: Record<string, unknown>;
};

/**
 * Context builder type for structured logging
 */
export type LogContextBuilderInterface = {
  userId?: string | number;
  sessionId?: string;
  requestId?: string;
  operationId?: string;
  traceId?: string;
  workoutId?: string;
  athleteId?: string | number;
  metadata?: Record<string, unknown>;
};

/**
 * Configuration for timing operations
 */
export type TimingOptions = {
  logger?: LoggerInstance;
  logLevel?: LogLevel;
  operationName?: string;
  enableAutoLogging?: boolean;
  includeArgs?: boolean;
  includeResult?: boolean;
  threshold?: number; // Log only if duration exceeds threshold (ms)
  onSuccess?: (metrics: PerformanceMetrics) => void;
  onError?: (error: Error, metrics: PerformanceMetrics) => void;
};

/**
 * Log formatter options
 */
export type LogFormatterOptions = {
  maxDepth?: number;
  maxStringLength?: number;
  excludeFields?: string[];
  includeStackTrace?: boolean;
  maskSensitiveData?: boolean;
  timestampFormat?: 'iso' | 'unix' | 'relative';
};

/**
 * Performance tracker class
 */
export class PerformanceTracker {
  private startTime: number;
  private operationName: string;
  private metadata: Record<string, unknown>;
  private logger: LoggerInstance;

  constructor(
    operationName: string,
    logger?: LoggerInstance,
    metadata?: Record<string, unknown>
  ) {
    this.operationName = operationName;
    this.metadata = metadata || {};
    this.logger = logger || createLoggerService({ level: 'info' });
    this.startTime = performance.now();

    this.logger.debug(`Started operation: ${operationName}`, {
      operation: operationName,
      startTime: this.startTime,
      ...this.metadata,
    });
  }

  /**
   * Add metadata to the performance tracking
   */
  addMetadata(key: string, value: unknown): void {
    this.metadata[key] = value;
  }

  /**
   * Add checkpoint with intermediate timing
   */
  checkpoint(name: string, additionalMetadata?: Record<string, unknown>): void {
    const currentTime = performance.now();
    const duration = currentTime - this.startTime;

    this.logger.debug(`Checkpoint: ${name}`, {
      operation: this.operationName,
      checkpoint: name,
      duration,
      timestamp: currentTime,
      ...this.metadata,
      ...additionalMetadata,
    });
  }

  /**
   * Finish tracking and log performance metrics
   */
  finish(additionalMetadata?: Record<string, unknown>): PerformanceMetrics {
    const endTime = performance.now();
    const duration = endTime - this.startTime;

    const metrics: PerformanceMetrics = {
      duration,
      startTime: this.startTime,
      endTime,
      operationName: this.operationName,
      metadata: { ...this.metadata, ...additionalMetadata },
    };

    this.logger.info(`Completed operation: ${this.operationName}`, {
      operation: this.operationName,
      duration,
      performance: 'completed',
      ...this.metadata,
      ...additionalMetadata,
    });

    return metrics;
  }

  /**
   * Finish with error and log performance metrics
   */
  finishWithError(
    error: Error,
    additionalMetadata?: Record<string, unknown>
  ): PerformanceMetrics {
    const endTime = performance.now();
    const duration = endTime - this.startTime;

    const metrics: PerformanceMetrics = {
      duration,
      startTime: this.startTime,
      endTime,
      operationName: this.operationName,
      metadata: { ...this.metadata, ...additionalMetadata },
    };

    this.logger.error(`Failed operation: ${this.operationName}`, {
      operation: this.operationName,
      duration,
      performance: 'failed',
      error: error.message,
      errorType: error.constructor.name,
      ...this.metadata,
      ...additionalMetadata,
    });

    return metrics;
  }
}

/**
 * Context builder for structured logging
 */
export class LogContextBuilder {
  private context: LogContext = {};

  /**
   * Set user ID
   */
  withUserId(userId: string | number): LogContextBuilder {
    this.context.userId = userId;
    return this;
  }

  /**
   * Set session ID
   */
  withSessionId(sessionId: string): LogContextBuilder {
    this.context.sessionId = sessionId;
    return this;
  }

  /**
   * Set request ID
   */
  withRequestId(requestId: string): LogContextBuilder {
    this.context.requestId = requestId;
    return this;
  }

  /**
   * Set operation ID
   */
  withOperationId(operationId: string): LogContextBuilder {
    this.context.operationId = operationId;
    return this;
  }

  /**
   * Set trace ID for distributed tracing
   */
  withTraceId(traceId: string): LogContextBuilder {
    this.context.traceId = traceId;
    return this;
  }

  /**
   * Set workout ID
   */
  withWorkoutId(workoutId: string): LogContextBuilder {
    this.context.workoutId = workoutId;
    return this;
  }

  /**
   * Set athlete ID
   */
  withAthleteId(athleteId: string | number): LogContextBuilder {
    this.context.athleteId = athleteId;
    return this;
  }

  /**
   * Add metadata
   */
  withMetadata(key: string, value: unknown): LogContextBuilder {
    if (!this.context.metadata) {
      this.context.metadata = {};
    }
    if (this.context.metadata && typeof this.context.metadata === 'object') {
      (this.context.metadata as Record<string, unknown>)[key] = value;
    }
    return this;
  }

  /**
   * Add multiple metadata entries
   */
  withMetadataObject(metadata: Record<string, unknown>): LogContextBuilder {
    if (!this.context.metadata) {
      this.context.metadata = {};
    }
    if (
      metadata &&
      typeof metadata === 'object' &&
      !Array.isArray(metadata) &&
      this.context.metadata &&
      typeof this.context.metadata === 'object'
    ) {
      Object.assign(this.context.metadata as Record<string, unknown>, metadata);
    }
    return this;
  }

  /**
   * Add performance metrics
   */
  withPerformanceMetrics(metrics: PerformanceMetrics): LogContextBuilder {
    return this.withMetadataObject({
      performance: {
        duration: metrics.duration,
        operationName: metrics.operationName,
        ...metrics.metadata,
      },
    });
  }

  /**
   * Add error information
   */
  withError(error: Error): LogContextBuilder {
    return this.withMetadataObject({
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      },
    });
  }

  /**
   * Build the context
   */
  build(): LogContext {
    return { ...this.context };
  }

  /**
   * Reset the builder
   */
  reset(): LogContextBuilder {
    this.context = {};
    return this;
  }
}

/**
 * Log formatter utilities
 */
export class LogFormatter {
  private options: LogFormatterOptions;

  constructor(options: LogFormatterOptions = {}) {
    this.options = {
      maxDepth: 3,
      maxStringLength: 1000,
      excludeFields: ['password', 'token', 'secret', 'apiKey'],
      includeStackTrace: false,
      maskSensitiveData: true,
      timestampFormat: 'iso',
      ...options,
    };
  }

  /**
   * Format log context with security and performance considerations
   */
  formatContext(context: LogContext): LogContext {
    return this.sanitizeObject(context, 0) as LogContext;
  }

  /**
   * Format error for logging
   */
  formatError(error: Error): LogContext {
    const errorContext: LogContext = {
      message: error.message,
      name: error.name,
      type: error.constructor.name,
    };

    if (this.options.includeStackTrace && error.stack) {
      errorContext.stack = error.stack;
    }

    return errorContext;
  }

  /**
   * Format performance metrics
   */
  formatPerformanceMetrics(metrics: PerformanceMetrics): LogContext {
    return {
      operationName: metrics.operationName,
      duration: metrics.duration,
      startTime: metrics.startTime,
      endTime: metrics.endTime,
      formattedDuration: this.formatDuration(metrics.duration),
      ...(this.sanitizeObject(metrics.metadata || {}, 0) as LogContext),
    };
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${Math.round(milliseconds)}ms`;
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(2)}s`;
    } else {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = ((milliseconds % 60000) / 1000).toFixed(2);
      return `${minutes}m ${seconds}s`;
    }
  }

  /**
   * Sanitize object for logging
   */
  private sanitizeObject(obj: unknown, depth: number): unknown {
    if (depth > (this.options.maxDepth || 3)) {
      return { _truncated: true };
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.truncateString(obj);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item, depth + 1));
    }

    if (typeof obj === 'object') {
      const result: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(obj)) {
        if (this.options.excludeFields?.includes(key)) {
          result[key] = this.options.maskSensitiveData ? '[REDACTED]' : value;
        } else {
          result[key] = this.sanitizeObject(value, depth + 1);
        }
      }

      return result;
    }

    return String(obj);
  }

  /**
   * Truncate string if too long
   */
  private truncateString(str: string): string {
    const maxLength = this.options.maxStringLength || 1000;
    if (str.length > maxLength) {
      return str.substring(0, maxLength) + '...[truncated]';
    }
    return str;
  }
}

/**
 * Timing decorator for functions
 */
export function withTiming<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: TimingOptions = {}
): T {
  const {
    logger = createLoggerService({ level: 'info' }),
    logLevel = 'info',
    operationName = fn.name || 'anonymous',
    includeArgs = false,
    includeResult = false,
    threshold = 0,
    onSuccess,
    onError,
  } = options;

  return (async (...args: Parameters<T>) => {
    const tracker = new PerformanceTracker(operationName, logger, {
      includeArgs: includeArgs ? args : undefined,
    });

    try {
      const result = await fn(...args);
      const metrics = tracker.finish({
        includeResult: includeResult ? result : undefined,
      });

      if (metrics.duration >= threshold) {
        logger.log(logLevel, `Operation completed: ${operationName}`, {
          metrics: new LogFormatter().formatPerformanceMetrics(metrics),
        });
      }

      if (onSuccess) {
        onSuccess(metrics);
      }

      return result;
    } catch (error) {
      const metrics = tracker.finishWithError(error as Error);

      if (onError) {
        onError(error as Error, metrics);
      }

      throw error;
    }
  }) as T;
}

/**
 * Create structured logger with context
 */
export function createStructuredLogger(
  baseContext: LogContext = {},
  options: LogFormatterOptions = {}
): LoggerInstance & {
  withContext: (context: LogContext) => LoggerInstance;
} {
  const logger = createLoggerService({ level: 'info' });
  const formatter = new LogFormatter(options);

  const logWithContext = (
    level: LogLevel,
    message: string,
    context?: LogContext
  ) => {
    const mergedContext = {
      ...baseContext,
      ...context,
    };

    const formattedContext = formatter.formatContext(mergedContext);
    logger.log(level, message, formattedContext);
  };

  return {
    info: (message: string, context?: LogContext) =>
      logWithContext('info', message, context),
    error: (message: string, context?: LogContext) =>
      logWithContext('error', message, context),
    warn: (message: string, context?: LogContext) =>
      logWithContext('warn', message, context),
    debug: (message: string, context?: LogContext) =>
      logWithContext('debug', message, context),
    log: (level: LogLevel, message: string, context?: LogContext) =>
      logWithContext(level, message, context),
    withContext: (context: LogContext) =>
      createStructuredLogger({ ...baseContext, ...context }, options),
  };
}

/**
 * Batch logger for high-throughput scenarios
 */
export class BatchLogger {
  private batch: Array<{
    level: LogLevel;
    message: string;
    context?: LogContext;
    timestamp: Date;
  }> = [];

  private batchSize: number;
  private flushInterval: number;
  private logger: LoggerInstance;
  private timer?: NodeJS.Timeout;

  constructor(
    logger: LoggerInstance,
    batchSize: number = 100,
    flushInterval: number = 5000
  ) {
    this.logger = logger;
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
    this.startFlushTimer();
  }

  /**
   * Add log entry to batch
   */
  log(level: LogLevel, message: string, context?: LogContext): void {
    this.batch.push({
      level,
      message,
      context,
      timestamp: new Date(),
    });

    if (this.batch.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Flush all batched logs
   */
  flush(): void {
    if (this.batch.length === 0) return;

    const batchToFlush = [...this.batch];
    this.batch = [];

    this.logger.info(`Flushing ${batchToFlush.length} batched log entries`, {
      batchSize: batchToFlush.length,
      flushTime: new Date().toISOString(),
    });

    batchToFlush.forEach((entry) => {
      this.logger.log(entry.level, entry.message, entry.context);
    });
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    this.timer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop batch logger and flush remaining logs
   */
  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.flush();
  }
}

/**
 * Utility functions
 */
export const createContextBuilder = (): LogContextBuilder =>
  new LogContextBuilder();
export const createPerformanceTracker = (
  operationName: string,
  logger?: LoggerInstance,
  metadata?: Record<string, unknown>
): PerformanceTracker =>
  new PerformanceTracker(operationName, logger, metadata);
export const createLogFormatter = (
  options?: LogFormatterOptions
): LogFormatter => new LogFormatter(options);
export const createBatchLogger = (
  logger: LoggerInstance,
  batchSize?: number,
  flushInterval?: number
): BatchLogger => new BatchLogger(logger, batchSize, flushInterval);
