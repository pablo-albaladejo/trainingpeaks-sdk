/**
 * Logger Service Implementation
 * Implements the LoggerService contract with configurable logging outputs
 */

import type {
  LoggerConfig as BaseLoggerConfig,
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
 * Output target interface for configurable logging
 */
export interface LogOutputTarget {
  write(level: LogLevel, message: string): void;
}

/**
 * Console output target (default)
 */
export const consoleOutputTarget: LogOutputTarget = {
  write: (level: LogLevel, message: string) => {
    switch (level) {
      case 'error':
        console.error(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'debug':
        console.debug(message);
        break;
      case 'info':
      default:
        console.log(message);
        break;
    }
  },
};

/**
 * Silent output target (for testing or disabled logging)
 */
export const silentOutputTarget: LogOutputTarget = {
  write: () => {
    // Do nothing
  },
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
 * Enhanced logger configuration interface
 * Extends the application layer contract with infrastructure-specific options
 */
export interface LoggerConfig extends BaseLoggerConfig {
  outputTarget?: LogOutputTarget;
}

/**
 * IMPLEMENTATION of LoggerService
 * This is an ADAPTER - implements the port defined in application layer
 * Now with configurable output targets for package consumers
 */
export const createLoggerService: LoggerServiceFactory = (
  config: BaseLoggerConfig = {}
) => {
  // Cast to extended config for infrastructure-specific options
  const extendedConfig = config as LoggerConfig;

  const {
    level = 'info',
    enableTimestamp = true,
    enableColors = true,
    format = 'text',
    outputTarget = consoleOutputTarget,
    prefix = '',
  } = extendedConfig;

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

    const prefixedMessage = prefix ? `[${prefix}] ${message}` : message;
    const formattedMessage = formatMessage(logLevel, prefixedMessage, context, {
      enableTimestamp,
      enableColors,
      format,
    });

    // Use configurable output target instead of direct console calls
    outputTarget.write(logLevel, formattedMessage);
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
 * Create a logger with custom configuration for package consumers
 */
export const createCustomLogger = (config: LoggerConfig) => {
  return createLoggerService(config);
};

/**
 * Create a logger with custom output target (for advanced use cases)
 */
export const createLoggerWithTarget = (
  outputTarget: LogOutputTarget,
  config: Omit<BaseLoggerConfig, 'outputTarget'> = {}
) => {
  const extendedConfig: LoggerConfig = {
    ...config,
    outputTarget,
  };
  return createLoggerService(extendedConfig);
};

/**
 * Create a silent logger (useful for testing)
 */
export const createSilentLogger = () => {
  const extendedConfig: LoggerConfig = { outputTarget: silentOutputTarget };
  return createLoggerService(extendedConfig);
};
