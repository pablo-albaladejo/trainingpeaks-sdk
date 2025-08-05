/**
 * Domain Errors
 * Core business errors that extend SDKError for consistency
 */

import { ERROR_CODES } from './error-codes';
import { SDKError } from './sdk-error';

export class AuthenticationError extends SDKError {
  constructor(
    message: string,
    code: string = ERROR_CODES.AUTH_FAILED,
    context?: { [key: string]: unknown }
  ) {
    super(message, code, context);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends SDKError {
  constructor(
    message: string,
    field?: string,
    code: string = ERROR_CODES.VALIDATION_FAILED
  ) {
    super(message, code, { field });
    this.name = 'ValidationError';
  }

  get field(): string | undefined {
    return this.context?.field as string | undefined;
  }
}

export class WorkoutError extends SDKError {
  constructor(
    message: string,
    code: string = ERROR_CODES.WORKOUT_VALIDATION_FAILED,
    context?: { [key: string]: unknown }
  ) {
    super(message, code, context);
    this.name = 'WorkoutError';
  }
}

export class NetworkError extends SDKError {
  constructor(
    message: string,
    code: string = ERROR_CODES.NETWORK_REQUEST_FAILED,
    context?: { [key: string]: unknown }
  ) {
    super(message, code, context);
    this.name = 'NetworkError';
  }
}

export class UserError extends SDKError {
  constructor(
    message: string,
    code: string = ERROR_CODES.USER_FETCH_FAILED,
    context?: { [key: string]: unknown }
  ) {
    super(message, code, context);
    this.name = 'UserError';
  }
}
