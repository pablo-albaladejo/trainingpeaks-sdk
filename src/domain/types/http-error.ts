/**
 * HTTP Error types for domain layer
 * Defines error contracts without implementation details
 */

import type { SDKErrorContext } from '@/domain/errors/sdk-error';

/**
 * HTTP error response structure
 */
export type HttpErrorResponse = {
  status: number;
  statusText: string;
  data?: unknown;
  headers?: Record<string, string>;
};

/**
 * HTTP error context extending SDK error context
 */
export type HttpErrorContext = SDKErrorContext & {
  status: number;
  statusText: string;
  url?: string;
  method?: string;
  requestData?: unknown;
  responseData?: unknown;
  headers?: Record<string, string>;
  requestId?: string;
};

/**
 * Base HTTP Error interface - domain contract
 */
export type HttpError = Error & {
  readonly status: number;
  readonly statusText: string;
  readonly url?: string;
  readonly method?: string;
  readonly requestId?: string;
  readonly code: string;
};
