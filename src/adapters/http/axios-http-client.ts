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

import type { Logger } from '@/adapters/logging/logger';
import {
  HttpClient,
  HttpClientConfig,
  HttpMethod,
  HttpResponse,
  InternalRequestConfig,
  RequestOptions,
} from '@/application';
import { generateConsistentBrowserHeaders } from '@/shared/utils/browser-utils';
import {
  type CurlRequestData,
  generateCurlCommand,
} from '@/shared/utils/curl-generator';
import { generateRequestId } from '@/shared/utils/request-id';

import {
  createHttpError,
  HttpError,
  type HttpErrorResponse,
} from '../errors/http-errors';
import { executeRequestWithRefresh } from './request-with-refresh';
import { DEFAULT_RETRY_CONFIG, RetryHandler } from './retry-handler';

/**
 * Normalizes HTTP client configuration with default values
 */
const normalizeHttpClientConfig = (config: HttpClientConfig) => {
  // Generate browser headers if enabled (default: true for better stealth)
  const browserHeaders =
    config.enableBrowserHeaders !== false
      ? generateConsistentBrowserHeaders()
      : {};

  return {
    timeout: config.timeout ?? 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...browserHeaders,
      ...config.headers, // User headers override browser headers
    },
    maxRedirects: config.maxRedirects ?? 5,
    enableCookies: config.enableCookies,
    enableBrowserHeaders: config.enableBrowserHeaders,
    // Retry configuration with defaults
    retryAttempts: config.retryAttempts ?? DEFAULT_RETRY_CONFIG.attempts,
    retryDelay: config.retryDelay ?? DEFAULT_RETRY_CONFIG.delay,
    retryBackoff: config.retryBackoff ?? DEFAULT_RETRY_CONFIG.backoff,
    retryMaxDelay: config.retryMaxDelay ?? DEFAULT_RETRY_CONFIG.maxDelay!,
    retryJitter: config.retryJitter ?? DEFAULT_RETRY_CONFIG.jitter!,
    logger: config.logger,
    sessionStorage: config.sessionStorage,
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
 * Helper function to create axios config with fresh tokens
 */
const createAxiosConfig = async (
  baseConfig: ReturnType<typeof normalizeHttpClientConfig>,
  config: InternalRequestConfig
): Promise<AxiosRequestConfig> => {
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

  // Add Bearer token automatically if session storage is available
  if (baseConfig.sessionStorage) {
    try {
      const session = await baseConfig.sessionStorage.get();
      if (session?.token?.accessToken) {
        const currentHeaders =
          (axiosConfig.headers as Record<string, string>) || {};

        // Check for existing Authorization header (case-insensitive)
        const authHeaderExists = Object.keys(currentHeaders).some(
          (key) => key.toLowerCase() === 'authorization'
        );

        axiosConfig.headers = {
          ...currentHeaders,
          ...(authHeaderExists
            ? {}
            : { Authorization: `Bearer ${session.token.accessToken}` }),
        };
      }
    } catch (error) {
      // Don't fail the request if session retrieval fails, just log it
      if (baseConfig.logger) {
        baseConfig.logger.warn('Failed to retrieve session for Bearer token', {
          error,
        });
      }
    }
  }

  // Add manual cookies if provided
  if (config.options?.cookies && config.options.cookies.length > 0) {
    const currentHeaders =
      (axiosConfig.headers as Record<string, string>) || {};

    // Find existing Cookie header (case-insensitive)
    const existingCookieKey = Object.keys(currentHeaders).find(
      (key) => key.toLowerCase() === 'cookie'
    );
    const existingCookies = existingCookieKey
      ? currentHeaders[existingCookieKey]
      : undefined;
    const newCookies = config.options.cookies.join('; ');

    // Merge existing cookies with new ones safely
    const cookieValue = existingCookies
      ? `${existingCookies}; ${newCookies}`
      : newCookies;

    axiosConfig.headers = {
      ...currentHeaders,
      Cookie: cookieValue,
    };
  }

  return axiosConfig;
};

/**
 * Internal method to handle HTTP requests with retry logic
 */
const makeRequest = async <T>(
  client: AxiosInstance,
  jar: CookieJar | undefined,
  baseConfig: ReturnType<typeof normalizeHttpClientConfig>,
  config: InternalRequestConfig
): Promise<HttpResponse<T>> => {
  // Create initial config for logging purposes
  const initialAxiosConfig = await createAxiosConfig(baseConfig, config);

  // Create retry handler with config
  const retryHandler = new RetryHandler({
    attempts: baseConfig.retryAttempts,
    delay: baseConfig.retryDelay,
    backoff: baseConfig.retryBackoff,
    maxDelay: baseConfig.retryMaxDelay,
    jitter: baseConfig.retryJitter,
  });

  // Log curl command if logger is available and enabled
  if (baseConfig.logger) {
    try {
      const curlData: CurlRequestData = {
        method: config.method,
        url: config.url,
        headers: initialAxiosConfig.headers as Record<string, string>,
        data: initialAxiosConfig.data,
      };

      // Add cookies to curl data if available
      if (jar) {
        const cookieStr = await jar.getCookieString(config.url);
        if (cookieStr) {
          curlData.cookies = cookieStr.split(';').map((c) => c.trim());
        }
      }

      const curlCommand = generateCurlCommand(curlData);
      baseConfig.logger.debug(`HTTP Request as cURL:\n${curlCommand}`);
    } catch (curlError) {
      // Don't let curl generation errors break the actual request
      baseConfig.logger.warn('Failed to generate cURL command', {
        error: curlError,
      });
    }
  }

  // Generate unique request ID for tracing
  const requestId = generateRequestId();

  // Log request start
  if (baseConfig.logger) {
    baseConfig.logger.debug('HTTP Request starting', {
      requestId,
      method: config.method,
      url: config.url,
      hasData: !!config.data,
      hasParams: !!config.options?.params,
    });
  }

  try {
    // Execute request with retry logic and automatic token refresh
    const response: AxiosResponse<T> = await retryHandler.execute(
      async () => {
        // Create fresh axios config for each retry attempt to ensure updated tokens
        const axiosConfig = await createAxiosConfig(baseConfig, config);

        // Use refresh-enabled request if session storage is available
        if (baseConfig.sessionStorage && baseConfig.logger) {
          return executeRequestWithRefresh(axiosConfig, config, {
            client,
            sessionStorage: baseConfig.sessionStorage,
            logger: baseConfig.logger,
            maxRefreshRetries: 1,
          });
        } else {
          // Fallback to normal request without refresh capability
          return client.request(axiosConfig);
        }
      },
      {
        url: config.url,
        method: config.method,
        requestId,
        logger: baseConfig.logger,
      }
    );

    let cookies: string[] = [];

    if (jar) {
      const cookieStr = await jar.getCookieString(config.url);
      cookies = cookieStr ? cookieStr.split(';').map((c) => c.trim()) : [];
    }

    // Log successful response
    if (baseConfig.logger) {
      baseConfig.logger.info('HTTP Request successful', {
        requestId,
        method: config.method,
        url: config.url,
        statusCode: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        cookieCount: cookies.length,
      });
    }

    return {
      data: response.data,
      success: true,
      cookies,
    };
  } catch (error) {
    // Error is already logged in retry handler, but log the final failure
    if (baseConfig.logger) {
      baseConfig.logger.error('HTTP Request failed (final)', {
        requestId,
        method: config.method,
        url: config.url,
        error: error instanceof Error ? error.message : String(error),
        errorCode:
          error && typeof error === 'object' && 'code' in error
            ? (error as { code: unknown }).code
            : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });
    }

    return {
      data: null,
      success: false,
      error: handleError(error, config, baseConfig.logger, requestId),
    };
  }
};

/**
 * Handle and transform errors into standardized HttpError instances
 */
export const handleError = (
  error: unknown,
  requestConfig: InternalRequestConfig,
  logger?: Logger,
  requestId?: string
): HttpError => {
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
        requestId,
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
        requestId,
      });
    }
  }

  // Fallback for unexpected errors - create structured HttpError
  const httpErrorResponse: HttpErrorResponse = {
    status: 0,
    statusText: 'Unknown Error',
    data: {
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    },
  };

  return createHttpError(httpErrorResponse, {
    url: requestConfig.url,
    method: requestConfig.method,
    requestData: requestConfig.data,
    requestId,
  });
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
