/**
 * Configurable Logger System for TrainingPeaks SDK
 *
 * Allows users of the npm package to configure logging behavior
 * or provide their own logger implementation.
 */

import { getSDKConfig } from '@/config';

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

/**
 * Log categories for different parts of the system
 */
export enum LogCategory {
  AUTH = 'auth',
  NETWORK = 'network',
  BROWSER = 'browser',
  WORKOUT = 'workout',
  GENERAL = 'general',
}

/**
 * Log entry structure
 */
export type LogEntry = {
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: unknown;
  timestamp: Date;
};

/**
 * Output target type for configurable logging
 */
export type LogOutputTarget = {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
};

/**
 * External logger type that users can implement
 */
export type ExternalLogger = LogOutputTarget;

/**
 * Logger configuration type
 */
export type LoggerConfig = {
  /** Minimum log level to output */
  level: LogLevel;
  /** Enable/disable specific categories */
  categories: {
    [LogCategory.AUTH]: boolean;
    [LogCategory.NETWORK]: boolean;
    [LogCategory.BROWSER]: boolean;
    [LogCategory.WORKOUT]: boolean;
    [LogCategory.GENERAL]: boolean;
  };
  /** External logger implementation (optional) */
  externalLogger?: ExternalLogger;
  /** Output target for logging (optional, defaults to console) */
  outputTarget?: LogOutputTarget;
  /** Enable JSON format for structured logging */
  jsonFormat: boolean;
  /** Custom prefix for all log messages */
  prefix: string;
};

/**
 * Default console output target implementation
 */
export const consoleOutputTarget: LogOutputTarget = {
  debug: (message: string, data?: unknown): void => {
    if (data !== undefined) {
      console.debug(message, data);
    } else {
      console.debug(message);
    }
  },

  info: (message: string, data?: unknown): void => {
    if (data !== undefined) {
      console.info(message, data);
    } else {
      console.info(message);
    }
  },

  warn: (message: string, data?: unknown): void => {
    if (data !== undefined) {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  },

  error: (message: string, data?: unknown): void => {
    if (data !== undefined) {
      console.error(message, data);
    } else {
      console.error(message);
    }
  },
};

/**
 * Silent output target that outputs nothing
 */
export const silentOutputTarget: LogOutputTarget = {
  debug: (): void => {
    /* silent */
  },
  info: (): void => {
    /* silent */
  },
  warn: (): void => {
    /* silent */
  },
  error: (): void => {
    /* silent */
  },
};

/**
 * Default console logger implementation (deprecated, use outputTarget instead)
 */
class ConsoleLogger implements ExternalLogger {
  debug(message: string, data?: unknown): void {
    consoleOutputTarget.debug(message, data);
  }

  info(message: string, data?: unknown): void {
    consoleOutputTarget.info(message, data);
  }

  warn(message: string, data?: unknown): void {
    consoleOutputTarget.warn(message, data);
  }

  error(message: string, data?: unknown): void {
    consoleOutputTarget.error(message, data);
  }
}

/**
 * Silent logger that outputs nothing (deprecated, use outputTarget instead)
 */
class SilentLogger implements ExternalLogger {
  debug(): void {
    /* silent */
  }
  info(): void {
    /* silent */
  }
  warn(): void {
    /* silent */
  }
  error(): void {
    /* silent */
  }
}

/**
 * Main Logger class
 */
export class Logger {
  private config: LoggerConfig;
  private outputTarget: LogOutputTarget;

  constructor(config?: Partial<LoggerConfig>) {
    // Get SDK configuration to respect existing debug settings
    const sdkConfig = getSDKConfig();

    // Create default configuration based on SDK settings
    const defaultConfig: LoggerConfig = {
      level: sdkConfig.debug.enabled ? LogLevel.DEBUG : LogLevel.WARN,
      categories: {
        [LogCategory.AUTH]: sdkConfig.debug.logAuth,
        [LogCategory.NETWORK]: sdkConfig.debug.logNetwork,
        [LogCategory.BROWSER]: sdkConfig.debug.logBrowser,
        [LogCategory.WORKOUT]: sdkConfig.debug.enabled,
        [LogCategory.GENERAL]: sdkConfig.debug.enabled,
      },
      jsonFormat: false,
      prefix: '[TrainingPeaks SDK]',
    };

    // Merge with user configuration
    this.config = { ...defaultConfig, ...config };

    // Set up output target with priority: outputTarget > externalLogger > console/silent
    if (this.config.outputTarget) {
      this.outputTarget = this.config.outputTarget;
    } else if (this.config.externalLogger) {
      this.outputTarget = this.config.externalLogger;
    } else if (this.config.level === LogLevel.SILENT) {
      this.outputTarget = silentOutputTarget;
    } else {
      this.outputTarget = consoleOutputTarget;
    }
  }

  /**
   * Update logger configuration
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };

    // Update output target if needed
    if (config.outputTarget) {
      this.outputTarget = config.outputTarget;
    } else if (config.externalLogger) {
      this.outputTarget = config.externalLogger;
    } else if (
      this.config.level === LogLevel.SILENT &&
      !config.outputTarget &&
      !config.externalLogger
    ) {
      this.outputTarget = silentOutputTarget;
    } else if (
      !config.outputTarget &&
      !config.externalLogger &&
      this.outputTarget === silentOutputTarget
    ) {
      this.outputTarget = consoleOutputTarget;
    }
  }

  /**
   * Check if logging is enabled for a specific level and category
   */
  private shouldLog(level: LogLevel, category: LogCategory): boolean {
    // Check minimum log level
    if (level < this.config.level) {
      return false;
    }

    // Check if category is enabled
    return this.config.categories[category];
  }

  /**
   * Format log message
   */
  private formatMessage(
    level: LogLevel,
    category: LogCategory,
    message: string
  ): string {
    const levelStr = LogLevel[level];
    const timestamp = new Date().toISOString();

    if (this.config.jsonFormat) {
      return JSON.stringify({
        timestamp,
        level: levelStr,
        category,
        message,
        prefix: this.config.prefix,
      });
    }

    return `${this.config.prefix} [${timestamp}] ${levelStr}:${category.toUpperCase()} ${message}`;
  }

  /**
   * Log debug message
   */
  public debug(category: LogCategory, message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.DEBUG, category)) return;

    const formattedMessage = this.formatMessage(
      LogLevel.DEBUG,
      category,
      message
    );
    this.outputTarget.debug(formattedMessage, data);
  }

  /**
   * Log info message
   */
  public info(category: LogCategory, message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.INFO, category)) return;

    const formattedMessage = this.formatMessage(
      LogLevel.INFO,
      category,
      message
    );
    this.outputTarget.info(formattedMessage, data);
  }

  /**
   * Log warning message
   */
  public warn(category: LogCategory, message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.WARN, category)) return;

    const formattedMessage = this.formatMessage(
      LogLevel.WARN,
      category,
      message
    );
    this.outputTarget.warn(formattedMessage, data);
  }

  /**
   * Log error message
   */
  public error(category: LogCategory, message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.ERROR, category)) return;

    const formattedMessage = this.formatMessage(
      LogLevel.ERROR,
      category,
      message
    );
    this.outputTarget.error(formattedMessage, data);
  }

  /**
   * Create a category-specific logger
   */
  public category(category: LogCategory): CategoryLogger {
    return new CategoryLogger(this, category);
  }

  /**
   * Get current configuration
   */
  public getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Get current output target
   */
  public getOutputTarget(): LogOutputTarget {
    return this.outputTarget;
  }
}

/**
 * Category-specific logger for convenience
 */
export class CategoryLogger {
  constructor(
    private logger: Logger,
    private category: LogCategory
  ) {}

  debug(message: string, data?: unknown): void {
    this.logger.debug(this.category, message, data);
  }

  info(message: string, data?: unknown): void {
    this.logger.info(this.category, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.logger.warn(this.category, message, data);
  }

  error(message: string, data?: unknown): void {
    this.logger.error(this.category, message, data);
  }
}

/**
 * Global logger instance
 */
let globalLogger: Logger | null = null;

/**
 * Get the global logger instance
 */
export function getLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger();
  }
  return globalLogger;
}

/**
 * Configure the global logger
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  if (!globalLogger) {
    globalLogger = new Logger(config);
  } else {
    globalLogger.configure(config);
  }
}

/**
 * Create a category-specific logger
 */
export function createCategoryLogger(category: LogCategory): CategoryLogger {
  return getLogger().category(category);
}

/**
 * Convenience functions for different categories
 */
export const authLogger = createCategoryLogger(LogCategory.AUTH);
export const networkLogger = createCategoryLogger(LogCategory.NETWORK);
export const browserLogger = createCategoryLogger(LogCategory.BROWSER);
export const workoutLogger = createCategoryLogger(LogCategory.WORKOUT);
export const generalLogger = createCategoryLogger(LogCategory.GENERAL);
