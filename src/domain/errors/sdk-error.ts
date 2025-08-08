/**
 * SDK Error Base Class
 * Base error class for all SDK-related errors with integrated logging
 */

export type SDKErrorContext = {
  [key: string]: unknown;
};

export class SDKError extends Error {
  public cause?: unknown;

  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: SDKErrorContext,
    options?: { cause?: unknown }
  ) {
    super(message);
    this.name = 'SDKError';
    this.cause = options?.cause;
  }

  toJSON(): Record<string, unknown> {
    // Normalize the cause to avoid circular references and ensure JSON safety
    const normalizedCause =
      this.cause instanceof Error
        ? {
            name: this.cause.name,
            message: this.cause.message,
            stack: this.cause.stack,
          }
        : this.cause;

    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      stack: this.stack,
      cause: normalizedCause,
    };
  }
}
