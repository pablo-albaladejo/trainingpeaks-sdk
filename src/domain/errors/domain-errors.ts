/**
 * Domain Errors
 * Core business errors
 */

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'AUTH_ERROR'
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class WorkoutError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'WORKOUT_ERROR'
  ) {
    super(message);
    this.name = 'WorkoutError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class UserError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'USER_ERROR'
  ) {
    super(message);
    this.name = 'UserError';
  }
}
