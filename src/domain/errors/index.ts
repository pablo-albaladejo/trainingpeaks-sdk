/**
 * Domain Errors
 * Central export point for all domain-specific errors
 */

export * from './error-codes';
export * from './sdk-error';
export * from './workout-errors';

// Base error classes for backward compatibility
import { ERROR_CODES, type ErrorCode } from './error-codes';
import { SDKError, type SDKErrorContext } from './sdk-error';

export class TrainingPeaksError extends SDKError {
  constructor(
    message: string,
    code?: ErrorCode,
    context?: SDKErrorContext
  ) {
    super(message, code || ERROR_CODES.INTERNAL_ERROR, context);
    this.name = 'TrainingPeaksError';
    Object.setPrototypeOf(this, TrainingPeaksError.prototype);
  }
}

export class ValidationError extends SDKError {
  constructor(
    message: string,
    context?: SDKErrorContext
  ) {
    super(message, ERROR_CODES.VALIDATION_FAILED, context);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends SDKError {
  constructor(
    message: string,
    context?: SDKErrorContext
  ) {
    super(message, ERROR_CODES.AUTH_FAILED, context);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class NetworkError extends SDKError {
  constructor(
    message: string,
    context?: SDKErrorContext
  ) {
    super(message, ERROR_CODES.NETWORK_REQUEST_FAILED, context);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class AuthorizationError extends SDKError {
  constructor(
    message: string,
    context?: SDKErrorContext
  ) {
    super(message, ERROR_CODES.AUTH_FAILED, context);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class RateLimitError extends SDKError {
  constructor(
    message: string,
    context?: SDKErrorContext
  ) {
    super(message, ERROR_CODES.NETWORK_REQUEST_FAILED, context);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class WorkoutError extends SDKError {
  constructor(
    message: string,
    context?: SDKErrorContext
  ) {
    super(message, ERROR_CODES.WORKOUT_CREATION_FAILED, context);
    this.name = 'WorkoutError';
    Object.setPrototypeOf(this, WorkoutError.prototype);
  }
}
