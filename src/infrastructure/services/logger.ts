/**
 * Logger Service Implementation
 * Implements the LoggerService contract with configurable logging outputs
 */

import type {
  LogContext,
  LoggerConfig,
  LogLevel,
} from '@/application/services/logger';

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
 * IMPLEMENTATION of LoggerService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createLoggerService = (config: LoggerConfig = {}) => {
  const logLevel = config.level || 'info';
  const enableTimestamp = config.enableTimestamp ?? true;
  const enableColors = config.enableColors ?? true;
  const format = config.format || 'text';
  const prefix = config.prefix || '';

  const colors = {
    info: '\x1b[36m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
    debug: '\x1b[35m',
    reset: '\x1b[0m',
  };

  const levelPriority = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  const shouldLog = (level: LogLevel): boolean => {
    return levelPriority[level] >= levelPriority[logLevel];
  };

  const formatMessage = (
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string => {
    const timestamp = enableTimestamp ? new Date().toISOString() : '';
    const color = enableColors ? colors[level] : '';
    const reset = enableColors ? colors.reset : '';
    const prefixStr = prefix ? `[${prefix}] ` : '';

    if (format === 'json') {
      return JSON.stringify({
        timestamp,
        level,
        message,
        context,
        prefix: prefix || undefined,
      });
    }

    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `${color}${timestamp} ${prefixStr}[${level.toUpperCase()}] ${message}${contextStr}${reset}`;
  };

  const logMessage = (
    level: LogLevel,
    message: string,
    context?: LogContext
  ): void => {
    if (!shouldLog(level)) {
      return;
    }

    const formatted = formatMessage(level, message, context);

    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else if (level === 'debug') {
      console.debug(formatted);
    } else {
      console.log(formatted);
    }
  };

  return {
    info: (message: string, context?: LogContext): void => {
      logMessage('info', message, context);
    },

    error: (message: string, context?: LogContext): void => {
      logMessage('error', message, context);
    },

    warn: (message: string, context?: LogContext): void => {
      logMessage('warn', message, context);
    },

    debug: (message: string, context?: LogContext): void => {
      logMessage('debug', message, context);
    },

    log: (level: LogLevel, message: string, context?: LogContext): void => {
      logMessage(level, message, context);
    },
  };
};

/**
 * Create a logger with custom output target
 */
export const createLoggerWithTarget = (
  outputTarget: LogOutputTarget,
  config: LoggerConfig = {}
) => {
  const logLevel = config.level || 'info';
  const enableTimestamp = config.enableTimestamp ?? true;
  const enableColors = config.enableColors ?? true;
  const format = config.format || 'text';
  const prefix = config.prefix || '';

  const colors = {
    info: '\x1b[36m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
    debug: '\x1b[35m',
    reset: '\x1b[0m',
  };

  const levelPriority = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  const shouldLog = (level: LogLevel): boolean => {
    return levelPriority[level] >= levelPriority[logLevel];
  };

  const formatMessage = (
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string => {
    const timestamp = enableTimestamp ? new Date().toISOString() : '';
    const color = enableColors ? colors[level] : '';
    const reset = enableColors ? colors.reset : '';
    const prefixStr = prefix ? `[${prefix}] ` : '';

    if (format === 'json') {
      return JSON.stringify({
        timestamp,
        level,
        message,
        context,
        prefix: prefix || undefined,
      });
    }

    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `${color}${timestamp} ${prefixStr}[${level.toUpperCase()}] ${message}${contextStr}${reset}`;
  };

  const logMessage = (
    level: LogLevel,
    message: string,
    context?: LogContext
  ): void => {
    if (!shouldLog(level)) {
      return;
    }

    const formatted = formatMessage(level, message, context);
    outputTarget.write(level, formatted);
  };

  return {
    info: (message: string, context?: LogContext): void => {
      logMessage('info', message, context);
    },

    error: (message: string, context?: LogContext): void => {
      logMessage('error', message, context);
    },

    warn: (message: string, context?: LogContext): void => {
      logMessage('warn', message, context);
    },

    debug: (message: string, context?: LogContext): void => {
      logMessage('debug', message, context);
    },

    log: (level: LogLevel, message: string, context?: LogContext): void => {
      logMessage(level, message, context);
    },
  };
};

/**
 * Create a silent logger (useful for testing)
 */
export const createSilentLogger = () => {
  return createLoggerWithTarget(silentOutputTarget);
};
