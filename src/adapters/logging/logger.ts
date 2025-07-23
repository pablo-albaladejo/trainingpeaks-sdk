/**
 * Logger Adapter
 * Provides logging functionality for the SDK
 */

import { withRealConsole } from '@/test.setup';

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger configuration
 */
export type LoggerConfig = {
  level: LogLevel;
  enabled: boolean;
  prefix?: string;
};

/**
 * Logger interface
 */
export type Logger = {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
};

/**
 * Create logger instance
 */
export const createLogger = (config: LoggerConfig): Logger => {
  const logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  const currentLevel = logLevels[config.level];

  const shouldLog = (level: LogLevel): boolean => {
    return config.enabled && logLevels[level] >= currentLevel;
  };

  const formatMessage = (level: LogLevel, message: string): string => {
    const timestamp = new Date().toISOString();
    const prefix = config.prefix ? `[${config.prefix}]` : '[TrainingPeaks SDK]';
    return `${timestamp} ${prefix} [${level.toUpperCase()}] ${message}`;
  };

  const logWithRealConsole = (
    level: LogLevel,
    message: string,
    ...args: unknown[]
  ) => {
    if (shouldLog(level)) {
      withRealConsole(() => {
        const formattedMessage = formatMessage(level, message);
        switch (level) {
          case 'debug':
            console.debug(formattedMessage, ...args);
            break;
          case 'info':
            console.info(formattedMessage, ...args);
            break;
          case 'warn':
            console.warn(formattedMessage, ...args);
            break;
          case 'error':
            console.error(formattedMessage, ...args);
            break;
        }
      });
    }
  };

  return {
    debug: (message: string, ...args: unknown[]) => {
      logWithRealConsole('debug', message, ...args);
    },

    info: (message: string, ...args: unknown[]) => {
      logWithRealConsole('info', message, ...args);
    },

    warn: (message: string, ...args: unknown[]) => {
      logWithRealConsole('warn', message, ...args);
    },

    error: (message: string, ...args: unknown[]) => {
      logWithRealConsole('error', message, ...args);
    },
  };
};

/**
 * Default logger instance
 */
export const logger = createLogger({
  level: 'info',
  enabled: true,
  prefix: 'TrainingPeaks SDK',
});
