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
 * Logger configuration parameters
 * Defines the configurable aspects of the logger for package consumers
 */
export type LoggerConfig = {
  level?: LogLevel;
  enableTimestamp?: boolean;
  enableColors?: boolean;
  format?: 'json' | 'text';
  prefix?: string;
};

/**
 * Contract for logging operations
 * Defines what logging capabilities the system needs
 */

/**
 * Log informational messages
 * @param message - The message to log
 * @param context - Optional context data
 */
export type LogInfo = (message: string, context?: LogContext) => void;

/**
 * Log error messages
 * @param message - The error message to log
 * @param context - Optional context data
 */
export type LogError = (message: string, context?: LogContext) => void;

/**
 * Log warning messages
 * @param message - The warning message to log
 * @param context - Optional context data
 */
export type LogWarn = (message: string, context?: LogContext) => void;

/**
 * Log debug messages
 * @param message - The debug message to log
 * @param context - Optional context data
 */
export type LogDebug = (message: string, context?: LogContext) => void;

/**
 * Log messages with custom level
 * @param level - The log level
 * @param message - The message to log
 * @param context - Optional context data
 */
export type LogWithLevel = (
  level: LogLevel,
  message: string,
  context?: LogContext
) => void;
