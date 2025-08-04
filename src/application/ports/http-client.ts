import { type HttpMethod } from '@/application';

/**
 * Configuration options for HTTP requests
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, string | number | boolean>;
}

/**
 * Response from the HTTP client
 */
export type HttpResponse<T> = {
  data: T | null;
  success: boolean;
  error?: Error;
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
