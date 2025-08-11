/**
 * Request with Automatic Token Refresh
 * Handles automatic token refresh on 401 errors
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import type { Logger } from '@/adapters/logging/logger';
import type {
  HttpResponse,
  InternalRequestConfig,
  SessionStorage,
} from '@/application';

import { createTokenRefreshHandler } from './token-refresh-handler';

/**
 * Helper to extract Set-Cookie headers from response
 */
const extractSetCookieHeaders = (response: AxiosResponse): string[] => {
  // Try lowercase first (Node.js Axios default), then fallback to proper case
  const setCookieHeader =
    (response.headers['set-cookie'] as string | string[] | undefined) ||
    (response.headers['Set-Cookie'] as string | string[] | undefined);
  if (Array.isArray(setCookieHeader)) {
    return setCookieHeader;
  } else if (typeof setCookieHeader === 'string') {
    return [setCookieHeader];
  }
  return [];
};

/**
 * Helper to wrap axios request and extract cookies
 */
const requestAndWrap = async <TData>(
  client: AxiosInstance,
  method: AxiosRequestConfig['method'],
  url: string,
  data?: unknown,
  options?: AxiosRequestConfig
): Promise<HttpResponse<TData>> => {
  const response = await client.request<TData>({
    method,
    url,
    data,
    ...options,
  });
  return {
    data: response.data,
    success: true,
    cookies: extractSetCookieHeaders(response),
  } as HttpResponse<TData>;
};

/**
 * Configuration for request with refresh
 */
type RequestWithRefreshConfig = {
  client: AxiosInstance;
  sessionStorage: SessionStorage;
  logger: Logger;
  maxRefreshRetries?: number;
};

/**
 * Executes HTTP request with automatic token refresh on 401 errors
 */
export const executeRequestWithRefresh = async <T>(
  axiosConfig: AxiosRequestConfig,
  requestConfig: InternalRequestConfig,
  config: RequestWithRefreshConfig
): Promise<AxiosResponse<T>> => {
  const { client, sessionStorage, logger, maxRefreshRetries = 1 } = config;
  let retries = 0;

  while (retries <= maxRefreshRetries) {
    try {
      // Execute the request
      const response = await client.request<T>(axiosConfig);
      return response;
    } catch (error: unknown) {
      // Check if it's a 401 error and we have refresh capability
      const is401Error =
        (error as { response?: { status?: number } })?.response?.status === 401;
      const isLastRetry = retries >= maxRefreshRetries;

      if (!is401Error || isLastRetry) {
        // Not a 401 error or no more retries left, propagate the error
        throw error;
      }

      logger.warn('Received 401 error, attempting token refresh', {
        url: requestConfig.url,
        method: requestConfig.method,
        retry: retries + 1,
        maxRetries: maxRefreshRetries,
      });

      // Create a simple HTTP client for refresh (to avoid circular dependency)
      const refreshHttpClient = {
        get: async <TData>(url: string, options?: AxiosRequestConfig) => {
          return requestAndWrap<TData>(client, 'GET', url, undefined, options);
        },
        post: async <TData>(
          url: string,
          data?: unknown,
          options?: AxiosRequestConfig
        ) => {
          return requestAndWrap<TData>(client, 'POST', url, data, options);
        },
        put: async <TData>(
          url: string,
          data?: unknown,
          options?: AxiosRequestConfig
        ) => {
          return requestAndWrap<TData>(client, 'PUT', url, data, options);
        },
        patch: async <TData>(
          url: string,
          data?: unknown,
          options?: AxiosRequestConfig
        ) => {
          return requestAndWrap<TData>(client, 'PATCH', url, data, options);
        },
        delete: async <TData>(url: string, options?: AxiosRequestConfig) => {
          return requestAndWrap<TData>(
            client,
            'DELETE',
            url,
            undefined,
            options
          );
        },
      };

      // Attempt token refresh
      const tokenHandler = createTokenRefreshHandler(
        refreshHttpClient,
        sessionStorage,
        logger
      );

      const refreshedToken = await tokenHandler.ensureValidToken();

      if (!refreshedToken) {
        logger.error('Token refresh failed, cannot retry request');
        throw error; // Original 401 error
      }

      // Update the Authorization header with new token
      axiosConfig.headers = {
        ...axiosConfig.headers,
        Authorization: `Bearer ${refreshedToken.accessToken}`,
      };

      logger.info('Token refreshed successfully, retrying request', {
        url: requestConfig.url,
        method: requestConfig.method,
        retry: retries + 1,
      });

      retries++;
      // Continue the loop to retry the request
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new Error('Unexpected end of retry loop');
};
