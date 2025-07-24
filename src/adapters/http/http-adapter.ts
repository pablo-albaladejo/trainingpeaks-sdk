/**
 * HTTP Client Repository
 * Abstract interface for HTTP operations that can be implemented by different libraries
 */

import { LoggerType } from '@/adapters/logging/logger';
import { generateCurlCommand } from '@/shared';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

export type HttpClientConfig = {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
};

export type HttpRequest = {
  method: string;
  url: string;
  data?: unknown;
  headers?: Record<string, string>;
};

export type HttpResponse<T = unknown> = {
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
};

/**
 * Abstract HTTP Client Interface
 * This interface allows different HTTP implementations (Axios, Fetch, etc.)
 * without affecting the rest of the clean architecture
 */
export type HttpClient = {
  /**
   * Generic HTTP request
   */
  request<T = unknown>(config: HttpRequest): Promise<HttpResponse<T>>;

  /**
   * GET request
   */
  get<T = unknown>(
    url: string,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>>;

  /**
   * POST request
   */
  post<T = unknown>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>>;

  /**
   * PUT request
   */
  put<T = unknown>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>>;

  /**
   * PATCH request
   */
  patch<T = unknown>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>>;

  /**
   * DELETE request
   */
  delete<T = unknown>(
    url: string,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>>;
};

/**
 * HTTP Client implementation
 * Functional implementation using Axios
 */
export const createHttpClient = (
  config: HttpClientConfig,
  logger: LoggerType
): HttpClient => {
  const client: AxiosInstance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.headers,
    },
  });

  /**
   * Make HTTP request with logging
   */
  const request = async <T = unknown>(
    requestConfig: HttpRequest
  ): Promise<HttpResponse<T>> => {
    const { method, url, data, headers } = requestConfig;

    // Log request details
    logger.debug('🌐 HTTP Adapter: Making request', {
      method: method.toUpperCase(),
      url,
      headers,
      data,
    });

    // Generate and log curl command using shared utility
    const curlCommand = generateCurlCommand({
      method,
      url,
      headers: headers || {},
      data,
    });
    logger.info('🌐 HTTP Adapter: cURL command for debugging', {
      curl: curlCommand,
    });

    try {
      const response: AxiosResponse<T> = await client.request({
        method: method.toLowerCase(),
        url,
        data,
        headers,
      });

      // Log response details
      logger.info('🌐 HTTP Adapter: Response received', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        headers: response.headers as Record<string, string>,
        data: response.data,
      });

      return {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Log error response details
        if (error.response) {
          logger.error('🌐 HTTP Adapter: Request failed - Response details', {
            status: error.response.status,
            statusText: error.response.statusText,
            url: error.config?.url,
            headers: error.response.headers,
            data: error.response.data,
          });
        }

        logger.error('🌐 HTTP Adapter: Request failed', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.response?.data?.message || error.message,
        });
      }

      throw error;
    }
  };

  /**
   * GET request
   */
  const get = async <T = unknown>(
    url: string,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> => {
    return request<T>({ method: 'GET', url, headers });
  };

  /**
   * POST request
   */
  const post = async <T = unknown>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> => {
    return request<T>({ method: 'POST', url, data, headers });
  };

  /**
   * PUT request
   */
  const put = async <T = unknown>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> => {
    return request<T>({ method: 'PUT', url, data, headers });
  };

  /**
   * PATCH request
   */
  const patch = async <T = unknown>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> => {
    return request<T>({ method: 'PATCH', url, data, headers });
  };

  /**
   * DELETE request
   */
  const deleteRequest = async <T = unknown>(
    url: string,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> => {
    return request<T>({ method: 'DELETE', url, headers });
  };

  // Return the HttpClient implementation
  return {
    request,
    get,
    post,
    put,
    patch,
    delete: deleteRequest,
  };
};
