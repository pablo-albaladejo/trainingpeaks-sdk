import { describe, expect, it } from 'vitest';

import { ERROR_CODES } from '@/domain/errors/error-codes';
import { SDKError } from '@/domain/errors/sdk-error';

import {
  createHttpError,
  HttpError,
  type HttpErrorResponse,
  isClientError,
  isHttpError,
  isRetryableError,
  isServerError,
  throwAuthError,
  throwServerError,
  throwValidationError,
} from './http-errors';

describe('HTTP Errors', () => {
  describe('HttpError class', () => {
    it('should create HttpError with correct properties', () => {
      const context = {
        status: 404,
        statusText: 'Not Found',
        url: '/api/test',
        method: 'GET' as const,
      };

      const error = new HttpError(
        'Resource not found',
        ERROR_CODES.WORKOUT_NOT_FOUND,
        context
      );

      expect(error.name).toBe('HttpError');
      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe(ERROR_CODES.WORKOUT_NOT_FOUND);
      expect(error.status).toBe(404);
      expect(error.statusText).toBe('Not Found');
      expect(error.url).toBe('/api/test');
      expect(error.method).toBe('GET');
    });

    it('should extend SDKError', () => {
      const context = {
        status: 500,
        statusText: 'Internal Server Error',
      };

      const error = new HttpError(
        'Server error',
        ERROR_CODES.NETWORK_SERVER_ERROR,
        context
      );

      expect(error).toBeInstanceOf(SDKError);
      expect(error.name).toBe('HttpError');
    });
  });

  describe('createHttpError', () => {
    it('should create appropriate error for 400 Bad Request', () => {
      const response: HttpErrorResponse = {
        status: 400,
        statusText: 'Bad Request',
        data: { message: 'Invalid input' },
      };

      const error = createHttpError(response, {
        url: '/api/test',
        method: 'POST',
      });

      expect(error.status).toBe(400);
      expect(error.code).toBe(ERROR_CODES.VALIDATION_FAILED);
      expect(error.message).toContain('Invalid input');
      expect(error.url).toBe('/api/test');
      expect(error.method).toBe('POST');
    });

    it('should create appropriate error for 401 Unauthorized', () => {
      const response: HttpErrorResponse = {
        status: 401,
        statusText: 'Unauthorized',
      };

      const error = createHttpError(response);

      expect(error.status).toBe(401);
      expect(error.code).toBe(ERROR_CODES.AUTH_TOKEN_INVALID);
      expect(error.message).toContain('Authentication failed');
    });

    it('should create appropriate error for 403 Forbidden', () => {
      const response: HttpErrorResponse = {
        status: 403,
        statusText: 'Forbidden',
      };

      const error = createHttpError(response);

      expect(error.status).toBe(403);
      expect(error.code).toBe(ERROR_CODES.AUTH_FAILED);
      expect(error.message).toContain('Access forbidden');
    });

    it('should create appropriate error for 404 Not Found', () => {
      const response: HttpErrorResponse = {
        status: 404,
        statusText: 'Not Found',
      };

      const error = createHttpError(response);

      expect(error.status).toBe(404);
      expect(error.code).toBe(ERROR_CODES.WORKOUT_NOT_FOUND);
      expect(error.message).toContain('Resource not found');
    });

    it('should create appropriate error for 429 Rate Limited', () => {
      const response: HttpErrorResponse = {
        status: 429,
        statusText: 'Too Many Requests',
      };

      const error = createHttpError(response);

      expect(error.status).toBe(429);
      expect(error.code).toBe(ERROR_CODES.NETWORK_RATE_LIMITED);
      expect(error.message).toContain('Rate limit exceeded');
    });

    it('should create appropriate error for 500 Server Error', () => {
      const response: HttpErrorResponse = {
        status: 500,
        statusText: 'Internal Server Error',
      };

      const error = createHttpError(response);

      expect(error.status).toBe(500);
      expect(error.code).toBe(ERROR_CODES.NETWORK_SERVER_ERROR);
      expect(error.message).toContain('Server error');
    });

    it('should create generic error for unknown status codes', () => {
      const response: HttpErrorResponse = {
        status: 418,
        statusText: "I'm a teapot",
      };

      const error = createHttpError(response);

      expect(error.status).toBe(418);
      expect(error.code).toBe(ERROR_CODES.NETWORK_REQUEST_FAILED);
      expect(error.message).toContain('HTTP Error 418');
    });

    it('should extract error message from response data', () => {
      const response: HttpErrorResponse = {
        status: 400,
        statusText: 'Bad Request',
        data: { error: 'Custom error message' },
      };

      const error = createHttpError(response);

      expect(error.message).toContain('Custom error message');
    });
  });

  describe('Type guards', () => {
    describe('isHttpError', () => {
      it('should return true for HttpError instances', () => {
        const error = new HttpError(
          'Test error',
          ERROR_CODES.NETWORK_REQUEST_FAILED,
          {
            status: 500,
            statusText: 'Error',
          }
        );

        expect(isHttpError(error)).toBe(true);
      });

      it('should return false for non-HttpError instances', () => {
        const error = new Error('Regular error');

        expect(isHttpError(error)).toBe(false);
        expect(isHttpError(null)).toBe(false);
        expect(isHttpError(undefined)).toBe(false);
        expect(isHttpError('string')).toBe(false);
      });
    });

    describe('isClientError', () => {
      it('should return true for 4xx status codes', () => {
        const error = new HttpError(
          'Client error',
          ERROR_CODES.VALIDATION_FAILED,
          {
            status: 400,
            statusText: 'Bad Request',
          }
        );

        expect(isClientError(error)).toBe(true);
      });

      it('should return false for non-4xx status codes', () => {
        const serverError = new HttpError(
          'Server error',
          ERROR_CODES.NETWORK_SERVER_ERROR,
          {
            status: 500,
            statusText: 'Server Error',
          }
        );

        expect(isClientError(serverError)).toBe(false);
        expect(isClientError(new Error('Regular error'))).toBe(false);
      });
    });

    describe('isServerError', () => {
      it('should return true for 5xx status codes', () => {
        const error = new HttpError(
          'Server error',
          ERROR_CODES.NETWORK_SERVER_ERROR,
          {
            status: 500,
            statusText: 'Server Error',
          }
        );

        expect(isServerError(error)).toBe(true);
      });

      it('should return false for non-5xx status codes', () => {
        const clientError = new HttpError(
          'Client error',
          ERROR_CODES.VALIDATION_FAILED,
          {
            status: 400,
            statusText: 'Bad Request',
          }
        );

        expect(isServerError(clientError)).toBe(false);
        expect(isServerError(new Error('Regular error'))).toBe(false);
      });
    });

    describe('isRetryableError', () => {
      it('should return true for retryable status codes', () => {
        const retryableCodes = [500, 502, 503, 504, 408, 429];

        retryableCodes.forEach((status) => {
          const error = new HttpError(
            'Retryable error',
            ERROR_CODES.NETWORK_SERVER_ERROR,
            {
              status,
              statusText: 'Error',
            }
          );

          expect(isRetryableError(error)).toBe(true);
        });
      });

      it('should return false for non-retryable status codes', () => {
        const nonRetryableCodes = [400, 401, 403, 404];

        nonRetryableCodes.forEach((status) => {
          const error = new HttpError(
            'Non-retryable error',
            ERROR_CODES.VALIDATION_FAILED,
            {
              status,
              statusText: 'Error',
            }
          );

          expect(isRetryableError(error)).toBe(false);
        });

        expect(isRetryableError(new Error('Regular error'))).toBe(false);
      });
    });
  });

  describe('Error throwing utilities', () => {
    describe('throwValidationError', () => {
      it('should throw HttpError with 400 status', () => {
        const context = { url: '/api/test', method: 'POST' as const };

        expect(() =>
          throwValidationError('Validation failed', context)
        ).toThrow(HttpError);

        try {
          throwValidationError('Validation failed', context);
        } catch (error) {
          expect(isHttpError(error)).toBe(true);
          if (isHttpError(error)) {
            expect(error.status).toBe(400);
            expect(error.message).toContain('Validation failed');
          }
        }
      });
    });

    describe('throwAuthError', () => {
      it('should throw HttpError with 401 status and AUTH_TOKEN_INVALID code', () => {
        const context = { url: '/api/test', method: 'GET' as const };

        expect(() => throwAuthError('Access denied', context)).toThrow(
          HttpError
        );

        try {
          throwAuthError('Access denied', context);
        } catch (error) {
          expect(isHttpError(error)).toBe(true);
          if (isHttpError(error)) {
            expect(error.status).toBe(401);
            expect(error.code).toBe(ERROR_CODES.AUTH_TOKEN_INVALID);
            expect(error.message).toContain('Access denied');
          }
        }
      });
    });

    describe('throwServerError', () => {
      it('should re-throw HttpError if already HttpError', () => {
        const originalError = new HttpError(
          'Original error',
          ERROR_CODES.NETWORK_SERVER_ERROR,
          {
            status: 500,
            statusText: 'Server Error',
          }
        );
        const context = { url: '/api/test', method: 'GET' as const };

        expect(() =>
          throwServerError(originalError, 'Fallback', context)
        ).toThrow(originalError);
      });

      it('should create new HttpError for regular errors', () => {
        const originalError = new Error('Database connection failed');
        const context = { url: '/api/test', method: 'GET' as const };

        expect(() =>
          throwServerError(originalError, 'Fallback', context)
        ).toThrow(HttpError);

        try {
          throwServerError(originalError, 'Fallback', context);
        } catch (error) {
          expect(isHttpError(error)).toBe(true);
          if (isHttpError(error)) {
            expect(error.status).toBe(500);
            expect(error.message).toContain('Database connection failed');
          }
        }
      });

      it('should use fallback message for non-Error objects', () => {
        const context = { url: '/api/test', method: 'GET' as const };

        expect(() =>
          throwServerError('string error', 'Fallback message', context)
        ).toThrow(HttpError);

        try {
          throwServerError('string error', 'Fallback message', context);
        } catch (error) {
          expect(isHttpError(error)).toBe(true);
          if (isHttpError(error)) {
            expect(error.message).toContain('Fallback message');
          }
        }
      });
    });
  });
});
