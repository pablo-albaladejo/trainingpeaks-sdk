import { describe, expect, it } from 'vitest';

import {
  ERROR_CODES,
  ERROR_MESSAGES,
  ERROR_STATUS_CODES,
  type ErrorCode,
} from './error-codes';

// Regex constants for error code patterns
const ERROR_CODE_PATTERNS = {
  AUTH: /^AUTH_1\d{3}$/,
  WORKOUT: /^WORKOUT_2\d{3}$/,
  USER: /^USER_3\d{3}$/,
  NETWORK: /^NETWORK_4\d{3}$/,
} as const;

describe('Error Codes', () => {
  describe('ERROR_CODES', () => {
    it('should contain authentication error codes', () => {
      expect(ERROR_CODES.AUTH_FAILED).toMatch(ERROR_CODE_PATTERNS.AUTH);
      expect(ERROR_CODES.AUTH_TOKEN_EXPIRED).toMatch(ERROR_CODE_PATTERNS.AUTH);
      expect(ERROR_CODES.AUTH_TOKEN_INVALID).toMatch(ERROR_CODE_PATTERNS.AUTH);
      expect(ERROR_CODES.AUTH_TOKEN_REFRESH_FAILED).toMatch(
        ERROR_CODE_PATTERNS.AUTH
      );
      expect(ERROR_CODES.AUTH_NO_ADAPTER_FOUND).toMatch(
        ERROR_CODE_PATTERNS.AUTH
      );
    });

    it('should contain workout error codes', () => {
      expect(ERROR_CODES.WORKOUT_CREATION_FAILED).toMatch(
        ERROR_CODE_PATTERNS.WORKOUT
      );
      expect(ERROR_CODES.WORKOUT_UPLOAD_FAILED).toMatch(
        ERROR_CODE_PATTERNS.WORKOUT
      );
      expect(ERROR_CODES.WORKOUT_DELETION_FAILED).toMatch(
        ERROR_CODE_PATTERNS.WORKOUT
      );
      expect(ERROR_CODES.WORKOUT_NOT_FOUND).toMatch(
        ERROR_CODE_PATTERNS.WORKOUT
      );
    });

    it('should contain user error codes', () => {
      expect(ERROR_CODES.USER_FETCH_FAILED).toMatch(ERROR_CODE_PATTERNS.USER);
      expect(ERROR_CODES.USER_NOT_FOUND).toMatch(ERROR_CODE_PATTERNS.USER);
    });

    it('should contain network error codes', () => {
      expect(ERROR_CODES.NETWORK_TIMEOUT).toMatch(ERROR_CODE_PATTERNS.NETWORK);
      expect(ERROR_CODES.NETWORK_CONNECTION_FAILED).toMatch(
        ERROR_CODE_PATTERNS.NETWORK
      );
      expect(ERROR_CODES.NETWORK_REQUEST_FAILED).toMatch(
        ERROR_CODE_PATTERNS.NETWORK
      );
    });

    it('should contain validation error codes', () => {
      expect(ERROR_CODES.VALIDATION_FAILED).toBe('VALIDATION_5001');
      expect(ERROR_CODES.VALIDATION_REQUIRED_FIELD).toBe('VALIDATION_5002');
      expect(ERROR_CODES.VALIDATION_INVALID_FORMAT).toBe('VALIDATION_5003');
    });

    it('should contain configuration error codes', () => {
      expect(ERROR_CODES.CONFIG_INVALID).toBe('CONFIG_6001');
      expect(ERROR_CODES.CONFIG_MISSING).toBe('CONFIG_6002');
      expect(ERROR_CODES.CONFIG_INVALID_URL).toBe('CONFIG_6003');
    });

    it('should contain internal error codes', () => {
      expect(ERROR_CODES.INTERNAL_ERROR).toBe('INTERNAL_9001');
      expect(ERROR_CODES.UNKNOWN_ERROR).toBe('UNKNOWN_9999');
    });

    it('should use correct code ranges for different categories', () => {
      const authCodes = Object.entries(ERROR_CODES)
        .filter(([key]) => key.startsWith('AUTH_'))
        .map(([, value]) => value);

      authCodes.forEach((code) => {
        expect(code).toMatch(ERROR_CODE_PATTERNS.AUTH);
      });

      const workoutCodes = Object.entries(ERROR_CODES)
        .filter(([key]) => key.startsWith('WORKOUT_'))
        .map(([, value]) => value);

      workoutCodes.forEach((code) => {
        expect(code).toMatch(ERROR_CODE_PATTERNS.WORKOUT);
      });
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should have message for every error code', () => {
      const errorCodes = Object.values(ERROR_CODES);
      const messageKeys = Object.keys(ERROR_MESSAGES);

      errorCodes.forEach((code) => {
        expect(messageKeys).toContain(code);
        expect(ERROR_MESSAGES[code as ErrorCode]).toBeDefined();
        expect(typeof ERROR_MESSAGES[code as ErrorCode]).toBe('string');
        expect(ERROR_MESSAGES[code as ErrorCode].length).toBeGreaterThan(0);
      });
    });

    it('should have meaningful authentication error messages', () => {
      expect(ERROR_MESSAGES[ERROR_CODES.AUTH_FAILED]).toBe(
        'Authentication failed'
      );
      expect(ERROR_MESSAGES[ERROR_CODES.AUTH_TOKEN_EXPIRED]).toBe(
        'Authentication token has expired'
      );
      expect(ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID_CREDENTIALS]).toBe(
        'Invalid credentials provided'
      );
    });

    it('should have meaningful workout error messages', () => {
      expect(ERROR_MESSAGES[ERROR_CODES.WORKOUT_NOT_FOUND]).toBe(
        'Workout not found'
      );
      expect(ERROR_MESSAGES[ERROR_CODES.WORKOUT_VALIDATION_FAILED]).toBe(
        'Workout validation failed'
      );
    });

    it('should have meaningful network error messages', () => {
      expect(ERROR_MESSAGES[ERROR_CODES.NETWORK_TIMEOUT]).toBe(
        'Network request timed out'
      );
      expect(ERROR_MESSAGES[ERROR_CODES.NETWORK_RATE_LIMITED]).toBe(
        'Rate limit exceeded'
      );
    });

    it('should not have empty or whitespace-only messages', () => {
      Object.values(ERROR_MESSAGES).forEach((message) => {
        expect(message.trim()).toBe(message);
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('ERROR_STATUS_CODES', () => {
    it('should have HTTP status code for every error code', () => {
      const errorCodes = Object.values(ERROR_CODES);
      const statusKeys = Object.keys(ERROR_STATUS_CODES);

      errorCodes.forEach((code) => {
        expect(statusKeys).toContain(code);
        expect(ERROR_STATUS_CODES[code as ErrorCode]).toBeDefined();
        expect(typeof ERROR_STATUS_CODES[code as ErrorCode]).toBe('number');
        expect(ERROR_STATUS_CODES[code as ErrorCode]).toBeGreaterThan(0);
      });
    });

    it('should map auth errors to 401 (Unauthorized)', () => {
      expect(ERROR_STATUS_CODES[ERROR_CODES.AUTH_FAILED]).toBe(401);
      expect(ERROR_STATUS_CODES[ERROR_CODES.AUTH_TOKEN_EXPIRED]).toBe(401);
      expect(ERROR_STATUS_CODES[ERROR_CODES.AUTH_TOKEN_INVALID]).toBe(401);
      expect(ERROR_STATUS_CODES[ERROR_CODES.AUTH_INVALID_CREDENTIALS]).toBe(
        401
      );
    });

    it('should map not found errors to 404', () => {
      expect(ERROR_STATUS_CODES[ERROR_CODES.WORKOUT_NOT_FOUND]).toBe(404);
      expect(ERROR_STATUS_CODES[ERROR_CODES.USER_NOT_FOUND]).toBe(404);
    });

    it('should map validation errors to 400 (Bad Request)', () => {
      expect(ERROR_STATUS_CODES[ERROR_CODES.VALIDATION_FAILED]).toBe(400);
      expect(ERROR_STATUS_CODES[ERROR_CODES.VALIDATION_REQUIRED_FIELD]).toBe(
        400
      );
      expect(ERROR_STATUS_CODES[ERROR_CODES.WORKOUT_VALIDATION_FAILED]).toBe(
        400
      );
    });

    it('should map server errors to 5xx range', () => {
      expect(ERROR_STATUS_CODES[ERROR_CODES.INTERNAL_ERROR]).toBe(500);
      expect(ERROR_STATUS_CODES[ERROR_CODES.NETWORK_SERVER_ERROR]).toBe(500);
      expect(ERROR_STATUS_CODES[ERROR_CODES.NETWORK_SERVICE_UNAVAILABLE]).toBe(
        503
      );
    });

    it('should map rate limiting to 429', () => {
      expect(ERROR_STATUS_CODES[ERROR_CODES.NETWORK_RATE_LIMITED]).toBe(429);
    });

    it('should map timeout to 408', () => {
      expect(ERROR_STATUS_CODES[ERROR_CODES.NETWORK_TIMEOUT]).toBe(408);
    });

    it('should use valid HTTP status codes', () => {
      Object.values(ERROR_STATUS_CODES).forEach((statusCode) => {
        expect(statusCode).toBeGreaterThanOrEqual(400);
        expect(statusCode).toBeLessThan(600);
        expect(Number.isInteger(statusCode)).toBe(true);
      });
    });
  });

  describe('ErrorCode type', () => {
    it('should allow assignment from ERROR_CODES values', () => {
      const errorCode: ErrorCode = ERROR_CODES.AUTH_FAILED;
      expect(errorCode).toBe('AUTH_1001');
    });

    it('should work with all error code constants', () => {
      const errorCodes: ErrorCode[] = [
        ERROR_CODES.AUTH_FAILED,
        ERROR_CODES.WORKOUT_NOT_FOUND,
        ERROR_CODES.NETWORK_TIMEOUT,
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_CODES.UNKNOWN_ERROR,
      ];

      errorCodes.forEach((code) => {
        expect(typeof code).toBe('string');
        expect(ERROR_MESSAGES[code]).toBeDefined();
        expect(ERROR_STATUS_CODES[code]).toBeDefined();
      });
    });
  });

  describe('Data Consistency', () => {
    it('should have same number of entries in all error objects', () => {
      const codesCount = Object.keys(ERROR_CODES).length;
      const messagesCount = Object.keys(ERROR_MESSAGES).length;
      const statusCodesCount = Object.keys(ERROR_STATUS_CODES).length;

      expect(messagesCount).toBe(codesCount);
      expect(statusCodesCount).toBe(codesCount);
    });

    it('should have no duplicate error codes', () => {
      const errorCodes = Object.values(ERROR_CODES);
      const uniqueErrorCodes = [...new Set(errorCodes)];

      expect(uniqueErrorCodes).toHaveLength(errorCodes.length);
    });

    it('should have consistent key names across objects', () => {
      const errorCodeKeys = Object.keys(ERROR_CODES);

      errorCodeKeys.forEach((key) => {
        const errorCode = ERROR_CODES[key as keyof typeof ERROR_CODES];
        expect(ERROR_MESSAGES[errorCode as ErrorCode]).toBeDefined();
        expect(ERROR_STATUS_CODES[errorCode as ErrorCode]).toBeDefined();
      });
    });
  });
});
