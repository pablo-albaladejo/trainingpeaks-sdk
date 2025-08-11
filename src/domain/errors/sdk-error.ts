/**
 * SDK Error Base Class
 * Base error class for all SDK-related errors with integrated logging
 */

export type SDKErrorContext = {
  [key: string]: unknown;
};

export type SDKErrorJSON = {
  name: string;
  message: string;
  code: string;
  context?: SDKErrorContext;
  stack?: string;
  cause?: unknown;
};

export class SDKError extends Error {
  public cause?: unknown;

  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: SDKErrorContext,
    options?: { cause?: unknown }
  ) {
    // Use native cause propagation for ES2022+ if supported, fall back to basic constructor
    super(message);
    this.name = 'SDKError';
    this.cause = options?.cause;
  }

  toJSON(): SDKErrorJSON {
    // Base result object
    const result: SDKErrorJSON = {
      name: this.name,
      message: this.message,
      code: this.code,
    };

    // Conditionally include context if defined
    if (this.context !== undefined) {
      result.context = this.context;
    }

    // Conditionally include stack if defined and not in production
    if (this.stack !== undefined && process.env.NODE_ENV !== 'production') {
      result.stack = this.stack;
    }

    // Conditionally include cause if defined
    if (this.cause !== undefined) {
      if (this.cause instanceof SDKError) {
        // Preserve SDKError-specific fields when cause is SDKError
        result.cause = this.cause.toJSON();
      } else if (this.cause instanceof Error) {
        // Normalize regular Error objects
        const errorCause: { name: string; message: string; stack?: string } = {
          name: this.cause.name,
          message: this.cause.message,
        };
        // Only include stack for Error objects if not in production
        if (
          this.cause.stack !== undefined &&
          process.env.NODE_ENV !== 'production'
        ) {
          errorCause.stack = this.cause.stack;
        }
        result.cause = errorCause;
      } else {
        // For other types, include as-is
        result.cause = this.cause;
      }
    }

    return result;
  }
}
