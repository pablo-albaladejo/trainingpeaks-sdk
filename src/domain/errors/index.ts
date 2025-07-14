/**
 * Domain Layer - Error Classes
 *
 * Domain-specific errors that represent business rule violations
 * and domain logic failures.
 */

export class TrainingPeaksError extends Error {
  public readonly code: string;
  public readonly statusCode: number | undefined;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'TrainingPeaksError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, TrainingPeaksError.prototype);
  }
}

export class AuthenticationError extends TrainingPeaksError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends TrainingPeaksError {
  constructor(message: string = 'Authorization failed') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class ValidationError extends TrainingPeaksError {
  constructor(message: string = 'Validation failed') {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class UploadError extends TrainingPeaksError {
  constructor(message: string = 'Upload failed') {
    super(message, 'UPLOAD_ERROR');
    this.name = 'UploadError';
    Object.setPrototypeOf(this, UploadError.prototype);
  }
}

export class RateLimitError extends TrainingPeaksError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class NetworkError extends TrainingPeaksError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

// Export workout-specific errors
export * from './workout-errors';
