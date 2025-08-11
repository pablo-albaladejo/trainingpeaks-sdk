import { type HttpMethod } from '@/application';
import type { HttpError } from '@/domain/types/http-error';
import type { Logger } from '@/domain/types/logger';

import type { SessionStorage } from './session-storage';

/**
 * Configuration options for HTTP requests
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, string | number | boolean>;
  cookies?: string[];
}

/**
 * Response from the HTTP client
 */
export type HttpResponse<T> = {
  data: T | null;
  success: boolean;
  error?: HttpError;
  cookies?: string[];
};

/**
 * Base HTTP client interface
 */
export type HttpClient = {
  get<T>(url: string, options?: RequestOptions): Promise<HttpResponse<T>>;
  post<T>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<HttpResponse<T>>;
  put<T>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<HttpResponse<T>>;
  patch<T>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<HttpResponse<T>>;
  delete<T>(url: string, options?: RequestOptions): Promise<HttpResponse<T>>;
};

/**
 * Configuration for the HTTP client
 */
export type HttpClientConfig = {
  timeout?: number;
  headers?: Record<string, string>;
  enableCookies?: boolean;
  maxRedirects?: number;
  // Browser simulation
  enableBrowserHeaders?: boolean;
  // Retry configuration
  retryAttempts?: number;
  retryDelay?: number;
  retryBackoff?: number;
  retryMaxDelay?: number;
  retryJitter?: boolean;
  // Logging configuration
  logger?: Logger;
  // Session storage for automatic Bearer token injection
  sessionStorage?: SessionStorage;
};

/**
 * Internal request configuration that includes all request details
 */
export type InternalRequestConfig = {
  url: string;
  method: HttpMethod;
  data?: unknown;
  options?: RequestOptions;
};
