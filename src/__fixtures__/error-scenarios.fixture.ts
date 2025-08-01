/**
 * Error Scenario Fixtures for Testing
 * Provides realistic error scenarios for comprehensive testing
 */

import { HttpError } from '@/adapters/errors/http-errors';
import { ServiceError } from '@/application/services/error-handler';
import { ClientError } from '@/adapters/client/client-error-handler';
import { ERROR_CODES } from '@/domain/errors/error-codes';
import { AuthenticationError, ValidationError, NetworkError } from '@/domain/errors/domain-errors';

/**
 * HTTP Error Scenarios
 */
export const httpErrorScenarios = {
  unauthorized: () => new HttpError(
    'Authentication failed: Invalid token',
    ERROR_CODES.AUTH_TOKEN_INVALID,
    {
      status: 401,
      statusText: 'Unauthorized',
      url: '/api/v1/workouts',
      method: 'GET',
      responseData: { error: 'Invalid token' },
    }
  ),

  forbidden: () => new HttpError(
    'Access forbidden: Insufficient permissions',
    ERROR_CODES.AUTH_FAILED,
    {
      status: 403,
      statusText: 'Forbidden',
      url: '/api/v1/workouts/123',
      method: 'GET',
      responseData: { error: 'Insufficient permissions' },
    }
  ),

  notFound: () => new HttpError(
    'Resource not found: Workout not found',
    ERROR_CODES.WORKOUT_NOT_FOUND,
    {
      status: 404,
      statusText: 'Not Found',
      url: '/api/v1/workouts/999',
      method: 'GET',
      responseData: { error: 'Workout not found' },
    }
  ),

  validationError: () => new HttpError(
    'Validation error: Invalid workout data',
    ERROR_CODES.VALIDATION_FAILED,
    {
      status: 400,
      statusText: 'Bad Request',
      url: '/api/v1/workouts',
      method: 'POST',
      requestData: { name: '', duration: -1 },
      responseData: {
        error: 'Validation failed',
        details: ['Name is required', 'Duration must be positive'],
      },
    }
  ),

  rateLimited: () => new HttpError(
    'Rate limit exceeded: Too many requests',
    ERROR_CODES.NETWORK_RATE_LIMITED,
    {
      status: 429,
      statusText: 'Too Many Requests',
      url: '/api/v1/workouts',
      method: 'GET',
      responseData: { error: 'Rate limit exceeded', retryAfter: 60 },
    }
  ),

  serverError: () => new HttpError(
    'Server error: Internal server error',
    ERROR_CODES.NETWORK_SERVER_ERROR,
    {
      status: 500,
      statusText: 'Internal Server Error',
      url: '/api/v1/workouts',
      method: 'POST',
      responseData: { error: 'Internal server error' },
    }
  ),

  serviceUnavailable: () => new HttpError(
    'Service unavailable: Temporary maintenance',
    ERROR_CODES.NETWORK_SERVICE_UNAVAILABLE,
    {
      status: 503,
      statusText: 'Service Unavailable',
      url: '/api/v1/workouts',
      method: 'GET',
      responseData: { error: 'Service temporarily unavailable' },
    }
  ),

  timeout: () => new HttpError(
    'Request timeout: Operation timed out',
    ERROR_CODES.NETWORK_TIMEOUT,
    {
      status: 408,
      statusText: 'Request Timeout',
      url: '/api/v1/workouts',
      method: 'GET',
    }
  ),
};

/**
 * Service Error Scenarios
 */
export const serviceErrorScenarios = {
  retryableNetworkError: () => new ServiceError(
    'Network error during workout retrieval',
    ERROR_CODES.NETWORK_CONNECTION_FAILED,
    'getWorkouts',
    {
      operation: 'getWorkouts',
      isRetryable: true,
      attempt: 1,
    }
  ),

  nonRetryableValidationError: () => new ServiceError(
    'Validation failed for workout creation',
    ERROR_CODES.VALIDATION_FAILED,
    'createWorkout',
    {
      operation: 'createWorkout',
      isRetryable: false,
      workoutId: 'invalid-workout-123',
    }
  ),

  authenticationTimeout: () => new ServiceError(
    'Authentication operation timed out',
    ERROR_CODES.NETWORK_TIMEOUT,
    'authenticateUser',
    {
      operation: 'authenticateUser',
      isRetryable: true,
      userId: 'user-123',
    }
  ),
};

/**
 * Client Error Scenarios
 */
export const clientErrorScenarios = {
  workoutNotFound: () => new ClientError(
    'Workout not found: The requested workout does not exist',
    ERROR_CODES.WORKOUT_NOT_FOUND,
    'getWorkoutById',
    {
      suggestions: [
        'Verify the workout ID is correct',
        'Check if the workout has been deleted',
        'Ensure you have access to this workout',
      ],
      isRetryable: false,
      httpStatus: 404,
      context: { workoutId: '999' },
    }
  ),

  authenticationRequired: () => new ClientError(
    'Authentication required: Please login to access this resource',
    ERROR_CODES.AUTH_TOKEN_INVALID,
    'getWorkouts',
    {
      suggestions: [
        'Check if your authentication token is valid',
        'Try refreshing your token',
        'Re-authenticate if token refresh fails',
      ],
      isRetryable: false,
      httpStatus: 401,
    }
  ),

  rateLimitExceeded: () => new ClientError(
    'Rate limit exceeded: Too many requests',
    ERROR_CODES.NETWORK_RATE_LIMITED,
    'createWorkout',
    {
      suggestions: [
        'Wait before making another request',
        'Implement exponential backoff',
        'Check your subscription plan for higher limits',
      ],
      isRetryable: true,
      httpStatus: 429,
    }
  ),

  serverTemporarilyUnavailable: () => new ClientError(
    'Server temporarily unavailable: Service is under maintenance',
    ERROR_CODES.NETWORK_SERVICE_UNAVAILABLE,
    'updateWorkout',
    {
      suggestions: [
        'This is a temporary server error',
        'Try again in a few moments',
        'Check the service status page',
      ],
      isRetryable: true,
      httpStatus: 503,
    }
  ),
};

/**
 * Domain Error Scenarios
 */
export const domainErrorScenarios = {
  authenticationFailed: () => new AuthenticationError(
    'Authentication failed: Invalid credentials',
    ERROR_CODES.AUTH_INVALID_CREDENTIALS
  ),

  workoutValidationFailed: () => new ValidationError(
    'Workout validation failed: Name is required',
    'name'
  ),

  networkConnectionFailed: () => new NetworkError(
    'Network connection failed: Unable to reach server'
  ),
};

/**
 * Complete Error Test Suite
 * Provides a comprehensive set of error scenarios for testing
 */
export const errorTestSuite = {
  http: httpErrorScenarios,
  service: serviceErrorScenarios,
  client: clientErrorScenarios,
  domain: domainErrorScenarios,
};

/**
 * Helper to create mock API responses for error testing
 */
export const createMockErrorResponse = (
  status: number,
  error: { message: string; code?: string; details?: unknown }
) => ({
  status,
  statusText: getStatusText(status),
  data: error,
  headers: {
    'content-type': 'application/json',
  },
});

/**
 * Helper to get standard HTTP status text
 */
const getStatusText = (status: number): string => {
  const statusTexts: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    408: 'Request Timeout',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };
  return statusTexts[status] || 'Unknown Status';
};

/**
 * Error assertion helpers for testing
 */
export const errorTestHelpers = {
  /**
   * Assert that an error is a specific type with expected properties
   */
  assertErrorType: <T extends Error>(
    error: unknown,
    ErrorClass: new (...args: any[]) => T,
    expectedProps?: Partial<T>
  ): asserts error is T => {
    if (!(error instanceof ErrorClass)) {
      throw new Error(`Expected ${ErrorClass.name}, got ${error?.constructor.name}`);
    }
    
    if (expectedProps) {
      for (const [key, value] of Object.entries(expectedProps)) {
        if ((error as any)[key] !== value) {
          throw new Error(`Expected ${key} to be ${value}, got ${(error as any)[key]}`);
        }
      }
    }
  },

  /**
   * Assert that an error has specific suggestions
   */
  assertHasSuggestions: (error: ClientError, expectedSuggestions: string[]): void => {
    const missingSuggestions = expectedSuggestions.filter(
      suggestion => !error.suggestions.includes(suggestion)
    );
    
    if (missingSuggestions.length > 0) {
      throw new Error(`Missing expected suggestions: ${missingSuggestions.join(', ')}`);
    }
  },

  /**
   * Assert that an error is retryable
   */
  assertIsRetryable: (error: ServiceError | ClientError): void => {
    if (!error.isRetryable) {
      throw new Error('Expected error to be retryable');
    }
  },

  /**
   * Assert that an error has specific HTTP status
   */
  assertHttpStatus: (error: HttpError | ClientError, expectedStatus: number): void => {
    if ('status' in error && error.status !== expectedStatus) {
      throw new Error(`Expected HTTP status ${expectedStatus}, got ${error.status}`);
    }
    if ('httpStatus' in error && error.httpStatus !== expectedStatus) {
      throw new Error(`Expected HTTP status ${expectedStatus}, got ${error.httpStatus}`);
    }
  },
};