/**
 * HTTP Error Fixtures
 * Factory pattern fixtures for creating HTTP error test data using rosie and faker
 *
 * This fixture demonstrates:
 * - HttpError objects with proper context structures
 * - Common HTTP error scenarios (404, 500, etc.)
 * - Reusable builders for different error types
 * - Proper error context with status, method, URL information
 */

import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';

import {
  HttpError,
  type HttpErrorContext,
} from '@/adapters/errors/http-errors';

/**
 * HttpErrorContext Builder
 * Creates HttpErrorContext objects with realistic defaults
 */
export const httpErrorContextBuilder = new Factory<HttpErrorContext>()
  .attr('status', () => 500)
  .attr('statusText', () => 'Internal Server Error')
  .attr('url', () => faker.internet.url())
  .attr('method', () =>
    faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
  )
  .attr('requestData', () => undefined)
  .attr('responseData', () => undefined)
  .attr('headers', () => ({}))
  .attr('requestId', () => faker.string.uuid())
  .option('status', undefined)
  .option('statusText', undefined)
  .option('url', undefined)
  .option('method', undefined)
  .option('includeRequestId', true)
  .option('includeHeaders', false)
  .option('includeRequestData', false)
  .option('includeResponseData', false)
  .after((context, options) => {
    const statusMap: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };

    const status =
      options.status !== undefined ? options.status : context.status;
    const statusText =
      options.statusText !== undefined
        ? options.statusText
        : statusMap[status] || context.statusText;

    return {
      status,
      statusText,
      url: options.url !== undefined ? options.url : context.url,
      method: options.method !== undefined ? options.method : context.method,
      requestData: options.includeRequestData ? context.requestData : undefined,
      responseData: options.includeResponseData
        ? context.responseData
        : undefined,
      headers: options.includeHeaders ? context.headers : {},
      requestId: options.includeRequestId ? context.requestId : undefined,
    };
  });

/**
 * HttpError Builder
 * Creates HttpError instances with proper context
 */
export const httpErrorBuilder = new Factory<HttpError>()
  .attr('message', () => 'HTTP Error occurred')
  .attr('code', () => 'HTTP_ERROR')
  .attr('context', () => httpErrorContextBuilder.build())
  .option('message', undefined)
  .option('code', undefined)
  .option('status', undefined)
  .option('statusText', undefined)
  .option('url', undefined)
  .option('method', undefined)
  .after((_, options) => {
    const message = options.message || 'HTTP Error occurred';
    const code = options.code || 'HTTP_ERROR';

    // Extract known context options
    const contextOptions: Partial<HttpErrorContext> = {};
    if (options.status !== undefined) contextOptions.status = options.status;
    if (options.statusText !== undefined)
      contextOptions.statusText = options.statusText;
    if (options.url !== undefined) contextOptions.url = options.url;
    if (options.method !== undefined) contextOptions.method = options.method;

    // Propagate all unknown options to the context builder
    const contextBuilderOptions = {
      ...options,
      ...contextOptions,
    };

    const context = httpErrorContextBuilder.build(contextBuilderOptions);

    return new HttpError(message, code, context);
  });

/**
 * Predefined Builders for Common HTTP Error Scenarios
 */

/**
 * Network Error Builder
 * Creates network-related HTTP errors
 */
export const networkErrorBuilder = new Factory<HttpError>()
  .extend(httpErrorBuilder)
  .option('message', 'Network error')
  .option('code', 'NETWORK_ERROR')
  .option('status', 500)
  .option('method', 'GET');

/**
 * Not Found Error Builder
 * Creates 404 Not Found errors
 */
export const notFoundErrorBuilder = new Factory<HttpError>()
  .extend(httpErrorBuilder)
  .option('message', 'Not found')
  .option('code', 'NOT_FOUND')
  .option('status', 404)
  .option('statusText', 'Not Found')
  .option('url', 'https://example.com')
  .option('method', 'GET');

/**
 * Unauthorized Error Builder
 * Creates 401 Unauthorized errors
 */
export const unauthorizedErrorBuilder = new Factory<HttpError>()
  .extend(httpErrorBuilder)
  .option('message', 'Unauthorized')
  .option('code', 'UNAUTHORIZED')
  .option('status', 401)
  .option('statusText', 'Unauthorized')
  .option('method', 'GET');

/**
 * Login Failed Error Builder
 * Creates login-specific errors
 */
export const loginFailedErrorBuilder = new Factory<HttpError>()
  .extend(httpErrorBuilder)
  .option('message', 'Login failed')
  .option('code', 'LOGIN_FAILED')
  .option('status', 500)
  .option('statusText', 'Internal Server Error')
  .option('url', 'https://example.com/login')
  .option('method', 'POST');

/**
 * Token Request Failed Error Builder
 * Creates token request specific errors
 */
export const tokenRequestFailedErrorBuilder = new Factory<HttpError>()
  .extend(httpErrorBuilder)
  .option('message', 'Token request failed')
  .option('code', 'TOKEN_REQUEST_FAILED')
  .option('status', 500)
  .option('statusText', 'Internal Server Error')
  .option('url', 'https://example.com/token')
  .option('method', 'POST');

/**
 * Bad Request Error Builder
 * Creates 400 Bad Request errors
 */
export const badRequestErrorBuilder = new Factory<HttpError>()
  .extend(httpErrorBuilder)
  .option('message', 'Bad request')
  .option('code', 'BAD_REQUEST')
  .option('status', 400)
  .option('statusText', 'Bad Request')
  .option('method', 'POST');

/**
 * Server Error Builder
 * Creates generic 500 server errors
 */
export const serverErrorBuilder = new Factory<HttpError>()
  .extend(httpErrorBuilder)
  .option('message', 'Server error')
  .option('code', 'SERVER_ERROR')
  .option('status', 500)
  .option('statusText', 'Internal Server Error')
  .option('method', 'GET');
