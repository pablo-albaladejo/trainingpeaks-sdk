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

  toJSON(): {
    name: string;
    message: string;
    code: string;
    context?: SDKErrorContext;
    stack?: string;
    cause?: unknown;
  } {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      stack: this.stack,
      cause: this.cause,
    };
  }
}
