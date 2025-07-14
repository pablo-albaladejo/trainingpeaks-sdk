/**
 * Logger Service Implementation
 * Implements the LoggerService contract with console-based logging
 */

import type {
  LogContext,
  LoggerServiceFactory,
  LogLevel,
} from '@/application/services/logger';

/**
 * Console colors for different log levels
 */
const LOG_COLORS = {
  info: '\x1b[36m', // Cyan
  error: '\x1b[31m', // Red
  warn: '\x1b[33m', // Yellow
  debug: '\x1b[90m', // Gray
  reset: '\x1b[0m', // Reset
};

/**
 * Log level priorities for filtering
 */
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Format timestamp for logging
 */
const formatTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Format log message with colors and timestamp
 */
const formatMessage = (
  level: LogLevel,
  message: string,
  context?: LogContext,
  options?: {
    enableTimestamp?: boolean;
    enableColors?: boolean;
    format?: 'json' | 'text';
  }
): string => {
  const timestamp = options?.enableTimestamp ? formatTimestamp() : '';
  const levelUpper = level.toUpperCase();

  if (options?.format === 'json') {
    return JSON.stringify({
      timestamp,
      level: levelUpper,
      message,
      context,
    });
  }

  // Text format
  const color = options?.enableColors ? LOG_COLORS[level] : '';
  const reset = options?.enableColors ? LOG_COLORS.reset : '';
  const timePrefix = timestamp ? `${timestamp} ` : '';
  const contextSuffix = context ? ` ${JSON.stringify(context)}` : '';

  return `${timePrefix}${color}[${levelUpper}]${reset} ${message}${contextSuffix}`;
};

/**
 * IMPLEMENTATION of LoggerService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createLoggerService: LoggerServiceFactory = (config = {}) => {
  const {
    level = 'info',
    enableTimestamp = true,
    enableColors = true,
    format = 'text',
  } = config;

  const shouldLog = (logLevel: LogLevel): boolean => {
    return LOG_LEVELS[logLevel] >= LOG_LEVELS[level];
  };

  const logMessage = (
    logLevel: LogLevel,
    message: string,
    context?: LogContext
  ) => {
    if (!shouldLog(logLevel)) {
      return;
    }

    const formattedMessage = formatMessage(logLevel, message, context, {
      enableTimestamp,
      enableColors,
      format,
    });

    switch (logLevel) {
      case 'error':
        console.error(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
      default:
        console.log(formattedMessage);
        break;
    }
  };

  return {
    info: (message: string, context?: LogContext) => {
      logMessage('info', message, context);
    },

    error: (message: string, context?: LogContext) => {
      logMessage('error', message, context);
    },

    warn: (message: string, context?: LogContext) => {
      logMessage('warn', message, context);
    },

    debug: (message: string, context?: LogContext) => {
      logMessage('debug', message, context);
    },

    log: (level: LogLevel, message: string, context?: LogContext) => {
      logMessage(level, message, context);
    },
  };
};

/**
 * Default logger instance for immediate use
 */
export const defaultLogger = createLoggerService();

/**
 * Create a logger with custom configuration
 */
export const createCustomLogger = (
  config: Parameters<LoggerServiceFactory>[0]
) => {
  return createLoggerService(config);
};
