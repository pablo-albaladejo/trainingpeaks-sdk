/**
 * Axios-based HTTP client implementation
 * Provides HTTP request functionality with proper error handling and interceptors
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

import {
  HttpClient,
  HttpClientConfig,
  HttpMethod,
  HttpResponse,
  InternalRequestConfig,
  RequestOptions,
} from '@/application';

import { createHttpError, type HttpErrorResponse } from '../errors/http-errors';

/**
 * Normalizes HTTP client configuration with default values
 */
const normalizeHttpClientConfig = (
  config: HttpClientConfig
): Required<Omit<HttpClientConfig, 'enableCookies'>> &
  Pick<HttpClientConfig, 'enableCookies'> => {
  return {
    timeout: config.timeout ?? 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.headers,
    },
    maxRedirects: config.maxRedirects ?? 5,
    enableCookies: config.enableCookies,
  };
};

/**
 * Creates a configured Axios instance with interceptors and error handling
 */
const createAxiosInstance = (
  config: HttpClientConfig
): { client: AxiosInstance; jar: CookieJar | undefined } => {
  const normalizedConfig = normalizeHttpClientConfig(config);

  // Create axios instance
  const client = axios.create({
    timeout: normalizedConfig.timeout,
    headers: normalizedConfig.headers,
    maxRedirects: normalizedConfig.maxRedirects,
  });

  // Enable cookie support if requested
  let jar: CookieJar | undefined;

  if (normalizedConfig.enableCookies) {
    jar = new CookieJar();
    wrapper(client);
    client.defaults.jar = jar;
    client.defaults.withCredentials = true;
  }

  // Request interceptor for logging and debugging
  client.interceptors.request.use(
    (config) => {
      // Can add request logging here if needed
      return config;
    },
    (error) => {
      // Always reject with an Error object for consistency
      if (error instanceof Error) {
        return Promise.reject(error);
      }
      return Promise.reject(
        new Error(
          typeof error === 'string'
            ? error
            : 'Unknown error in request interceptor'
        )
      );
    }
  );

  // Response interceptor for consistent error handling
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Always reject with an Error object for consistency
      if (error instanceof Error) {
        return Promise.reject(error);
      }
      return Promise.reject(
        new Error(
          typeof error === 'string'
            ? error
            : 'Unknown error in response interceptor'
        )
      );
    }
  );

  return { client, jar };
};

/**
 * Internal method to handle HTTP requests
 */
const makeRequest = async <T>(
  client: AxiosInstance,
  jar: CookieJar | undefined,
  baseConfig: Required<Omit<HttpClientConfig, 'enableCookies'>> &
    Pick<HttpClientConfig, 'enableCookies'>,
  config: InternalRequestConfig
): Promise<HttpResponse<T>> => {
  const axiosConfig: AxiosRequestConfig = {
    method: config.method.toLowerCase() as HttpMethod,
    url: config.url,
    data: config.data,
    params: config.options?.params,
    headers: {
      ...baseConfig.headers,
      ...config.options?.headers,
    },
    timeout: config.options?.timeout ?? baseConfig.timeout,
    withCredentials: baseConfig.enableCookies ?? false,
  };

  try {
    const response: AxiosResponse<T> = await client.request(axiosConfig);

    let cookies: string[] = [];

    if (jar) {
      const cookieStr = await jar.getCookieString(config.url);
      cookies = cookieStr ? cookieStr.split(';').map((c) => c.trim()) : [];
    }

    return {
      data: response.data,
      success: true,
      cookies,
    };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: handleError(error, config),
    };
  }
};

/**
 * Handle and transform errors into standardized HttpError instances
 */
const handleError = (
  error: unknown,
  requestConfig: InternalRequestConfig
): Error => {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    const request = error.request as AxiosRequestConfig;

    if (response) {
      // Server responded with error status
      const httpErrorResponse: HttpErrorResponse = {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers as Record<string, string>,
      };

      return createHttpError(httpErrorResponse, {
        url: requestConfig.url,
        method: requestConfig.method,
        requestData: requestConfig.data,
      });
    } else if (request) {
      // Request was made but no response received (network error)
      const httpErrorResponse: HttpErrorResponse = {
        status: 0,
        statusText: 'Network Error',
        data: { message: error.message },
      };

      return createHttpError(httpErrorResponse, {
        url: requestConfig.url,
        method: requestConfig.method,
        requestData: requestConfig.data,
      });
    }
  }

  // Fallback for unexpected errors
  return error as Error;
};

/**
 * Creates a functional HTTP client implementation
 */
export const createHttpClient = (config: HttpClientConfig = {}): HttpClient => {
  const { client, jar } = createAxiosInstance(config);
  const normalizedConfig = normalizeHttpClientConfig(config);

  return {
    get: <T>(url: string, options?: RequestOptions): Promise<HttpResponse<T>> =>
      makeRequest<T>(client, jar, normalizedConfig, {
        url,
        method: 'GET',
        options,
      }),

    post: <T>(
      url: string,
      data?: unknown,
      options?: RequestOptions
    ): Promise<HttpResponse<T>> =>
      makeRequest<T>(client, jar, normalizedConfig, {
        url,
        method: 'POST',
        data,
        options,
      }),

    put: <T>(
      url: string,
      data?: unknown,
      options?: RequestOptions
    ): Promise<HttpResponse<T>> =>
      makeRequest<T>(client, jar, normalizedConfig, {
        url,
        method: 'PUT',
        data,
        options,
      }),

    patch: <T>(
      url: string,
      data?: unknown,
      options?: RequestOptions
    ): Promise<HttpResponse<T>> =>
      makeRequest<T>(client, jar, normalizedConfig, {
        url,
        method: 'PATCH',
        data,
        options,
      }),

    delete: <T>(
      url: string,
      options?: RequestOptions
    ): Promise<HttpResponse<T>> =>
      makeRequest<T>(client, jar, normalizedConfig, {
        url,
        method: 'DELETE',
        options,
      }),
  };
};
