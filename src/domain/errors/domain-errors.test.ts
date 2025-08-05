/**
 * Domain Errors Tests
 * Validate error inheritance and consistency
 */

import { describe, expect, it } from 'vitest';

import {
  AuthenticationError,
  NetworkError,
  UserError,
  ValidationError,
  WorkoutError,
} from './domain-errors';
import { ERROR_CODES } from './error-codes';
import { SDKError } from './sdk-error';

describe('Domain Errors Inheritance', () => {
  describe('Base SDK Error Properties', () => {
    it('should have consistent properties across all domain errors', () => {
      // Arrange
      const authError = new AuthenticationError('Auth failed');
      const validationError = new ValidationError('Invalid field', 'email');
      const workoutError = new WorkoutError('Workout failed');
      const networkError = new NetworkError('Network failed');
      const userError = new UserError('User failed');
      const errors = [
        authError,
        validationError,
        workoutError,
        networkError,
        userError,
      ];

      // Act
      const areAllSDKErrors = errors.every(
        (error) => error instanceof SDKError
      );
      const areAllErrors = errors.every((error) => error instanceof Error);

      // Assert
      expect(areAllSDKErrors).toBe(true);
      expect(areAllErrors).toBe(true);
    });

    it('should use standardized error codes', () => {
      // Arrange
      const authError = new AuthenticationError('Auth failed');
      const validationError = new ValidationError('Invalid field');
      const workoutError = new WorkoutError('Workout failed');
      const networkError = new NetworkError('Network failed');
      const userError = new UserError('User failed');
      const expectedCodes = [
        ERROR_CODES.AUTH_FAILED,
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_CODES.WORKOUT_VALIDATION_FAILED,
        ERROR_CODES.NETWORK_REQUEST_FAILED,
        ERROR_CODES.USER_FETCH_FAILED,
      ];

      // Act
      const actualCodes = [
        authError.code,
        validationError.code,
        workoutError.code,
        networkError.code,
        userError.code,
      ];

      // Assert
      expect(actualCodes).toEqual(expectedCodes);
    });
  });

  describe('AuthenticationError', () => {
    it('should create with default code', () => {
      const error = new AuthenticationError('Login failed');

      expect(error.name).toBe('AuthenticationError');
      expect(error.message).toBe('Login failed');
      expect(error.code).toBe(ERROR_CODES.AUTH_FAILED);
    });

    it('should accept custom code and context', () => {
      const error = new AuthenticationError(
        'Token expired',
        ERROR_CODES.AUTH_TOKEN_EXPIRED,
        { tokenType: 'access' }
      );

      expect(error.code).toBe(ERROR_CODES.AUTH_TOKEN_EXPIRED);
      expect(error.context?.tokenType).toBe('access');
    });
  });

  describe('ValidationError', () => {
    it('should create with field context', () => {
      const error = new ValidationError('Email is required', 'email');

      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Email is required');
      expect(error.field).toBe('email');
      expect(error.context?.field).toBe('email');
    });

    it('should work without field', () => {
      const error = new ValidationError('General validation error');

      expect(error.field).toBeUndefined();
      expect(error.context?.field).toBeUndefined();
    });
  });

  describe('WorkoutError', () => {
    it('should create with default workout code', () => {
      const error = new WorkoutError('Workout creation failed');

      expect(error.name).toBe('WorkoutError');
      expect(error.code).toBe(ERROR_CODES.WORKOUT_VALIDATION_FAILED);
    });

    it('should accept custom workout code', () => {
      const error = new WorkoutError(
        'Workout not found',
        ERROR_CODES.WORKOUT_NOT_FOUND,
        { workoutId: '123' }
      );

      expect(error.code).toBe(ERROR_CODES.WORKOUT_NOT_FOUND);
      expect(error.context?.workoutId).toBe('123');
    });
  });

  describe('Error Properties', () => {
    it('should have correct name, message, and code properties', () => {
      const error = new ValidationError('Email invalid', 'email');

      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Email invalid');
      expect(error.code).toBe(ERROR_CODES.VALIDATION_FAILED);
      expect(error.field).toBe('email');
    });
  });

  describe('Error Context', () => {
    it('should handle complex context objects', () => {
      const context = {
        userId: '123',
        operation: 'createWorkout',
        timestamp: new Date().toISOString(),
        metadata: { source: 'api', version: '1.0' },
      };

      const error = new WorkoutError(
        'Complex error',
        ERROR_CODES.WORKOUT_CREATION_FAILED,
        context
      );

      expect(error.context).toEqual(context);
      expect(error.context?.userId).toBe('123');
      expect(error.context?.metadata).toEqual({
        source: 'api',
        version: '1.0',
      });
    });
  });
});
