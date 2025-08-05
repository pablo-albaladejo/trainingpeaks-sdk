/**
 * SDK Error Base Class
 * Base error class for all SDK-related errors with integrated logging
 */

export type SDKErrorContext = {
  [key: string]: unknown;
};

export class SDKError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: SDKErrorContext
  ) {
    super(message);
    this.name = 'SDKError';
  }
}
