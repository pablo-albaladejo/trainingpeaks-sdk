/**
 * Logger Service Implementation
 * Individual function implementations that receive dependencies as parameters
 */

import type {
  LogContext,
  LogDebug,
  LogError,
  LoggerConfig,
  LogInfo,
  LogLevel,
  LogWarn,
  LogWithLevel,
} from '@/application/services/logger';

/**
 * Output target type for configurable logging
 */
export type LogOutputTarget = {
  write(level: LogLevel, message: string): void;
};

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

// Helper function to create logger logic
const createLoggerLogic = (
  config: LoggerConfig = {},
  outputTarget: LogOutputTarget = consoleOutputTarget
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

  return { logMessage };
};

export const logInfo =
  (
    config: LoggerConfig = {},
    outputTarget: LogOutputTarget = consoleOutputTarget
  ): LogInfo =>
  (message: string, context?: LogContext): void => {
    const { logMessage } = createLoggerLogic(config, outputTarget);
    logMessage('info', message, context);
  };

export const logError =
  (
    config: LoggerConfig = {},
    outputTarget: LogOutputTarget = consoleOutputTarget
  ): LogError =>
  (message: string, context?: LogContext): void => {
    const { logMessage } = createLoggerLogic(config, outputTarget);
    logMessage('error', message, context);
  };

export const logWarn =
  (
    config: LoggerConfig = {},
    outputTarget: LogOutputTarget = consoleOutputTarget
  ): LogWarn =>
  (message: string, context?: LogContext): void => {
    const { logMessage } = createLoggerLogic(config, outputTarget);
    logMessage('warn', message, context);
  };

export const logDebug =
  (
    config: LoggerConfig = {},
    outputTarget: LogOutputTarget = consoleOutputTarget
  ): LogDebug =>
  (message: string, context?: LogContext): void => {
    const { logMessage } = createLoggerLogic(config, outputTarget);
    logMessage('debug', message, context);
  };

export const logWithLevel =
  (
    config: LoggerConfig = {},
    outputTarget: LogOutputTarget = consoleOutputTarget
  ): LogWithLevel =>
  (level: LogLevel, message: string, context?: LogContext): void => {
    const { logMessage } = createLoggerLogic(config, outputTarget);
    logMessage(level, message, context);
  };

// Keep the existing grouped functions for backward compatibility
export const createLoggerService = (
  config: LoggerConfig = {},
  outputTarget: LogOutputTarget = consoleOutputTarget
) => {
  const { logMessage } = createLoggerLogic(config, outputTarget);

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
