/**
 * Logger Service Contract
 * Defines the interface for logging operations across the application
 */

/**
 * Log level enumeration
 */
export type LogLevel = 'info' | 'error' | 'warn' | 'debug';

/**
 * Log context for structured logging
 */
export type LogContext = Record<string, unknown>;

/**
 * Contract for logging operations
 * Defines what logging capabilities the system needs
 */
export type LoggerService = {
  /**
   * Log informational messages
   * @param message - The message to log
   * @param context - Optional context data
   */
  info: (message: string, context?: LogContext) => void;

  /**
   * Log error messages
   * @param message - The error message to log
   * @param context - Optional context data
   */
  error: (message: string, context?: LogContext) => void;

  /**
   * Log warning messages
   * @param message - The warning message to log
   * @param context - Optional context data
   */
  warn: (message: string, context?: LogContext) => void;

  /**
   * Log debug messages
   * @param message - The debug message to log
   * @param context - Optional context data
   */
  debug: (message: string, context?: LogContext) => void;

  /**
   * Log messages with custom level
   * @param level - The log level
   * @param message - The message to log
   * @param context - Optional context data
   */
  log: (level: LogLevel, message: string, context?: LogContext) => void;
};

/**
 * Factory function signature for creating logger service
 * This defines the contract for how the logger should be instantiated
 */
export type LoggerServiceFactory = (config?: {
  level?: LogLevel;
  enableTimestamp?: boolean;
  enableColors?: boolean;
  format?: 'json' | 'text';
}) => LoggerService;
