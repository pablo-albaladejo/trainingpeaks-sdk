/**
 * Domain-specific errors for workout operations
 * Using the new SDKError system for consistent error handling
 */

import { ERROR_CODES } from './index';

/**
 * Error thrown when a workout is not found
 */
export class WorkoutNotFoundError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(workoutId: string) {
    super(`Workout with ID '${workoutId}' not found`);
    this.name = 'WorkoutNotFoundError';
    this.code = ERROR_CODES.WORKOUT_NOT_FOUND;
    this.statusCode = 404;
    Object.setPrototypeOf(this, WorkoutNotFoundError.prototype);
  }
}

/**
 * Error thrown when workout validation fails
 */
export class WorkoutValidationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: string[];

  constructor(message: string, details?: string[]) {
    super(message);
    this.name = 'WorkoutValidationError';
    this.code = ERROR_CODES.WORKOUT_VALIDATION_FAILED;
    this.statusCode = 400;
    this.details = details;
    Object.setPrototypeOf(this, WorkoutValidationError.prototype);
  }
}

/**
 * Error thrown when workout operation is not allowed
 */
export class WorkoutOperationNotAllowedError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(operation: string, reason: string) {
    super(`Operation '${operation}' is not allowed: ${reason}`);
    this.name = 'WorkoutOperationNotAllowedError';
    this.code = ERROR_CODES.WORKOUT_REPOSITORY_ERROR;
    this.statusCode = 403;
    Object.setPrototypeOf(this, WorkoutOperationNotAllowedError.prototype);
  }
}

/**
 * Error thrown when workout upload fails
 */
export class WorkoutUploadError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly fileInfo?: { filename: string; size: number };

  constructor(message: string, fileInfo?: { filename: string; size: number }) {
    super(message);
    this.name = 'WorkoutUploadError';
    this.code = ERROR_CODES.WORKOUT_UPLOAD_FAILED;
    this.statusCode = 500;
    this.fileInfo = fileInfo;
    Object.setPrototypeOf(this, WorkoutUploadError.prototype);
  }
}

/**
 * Error thrown when workout file processing fails
 */
export class WorkoutFileProcessingError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly fileType: string;

  constructor(message: string, fileType: string) {
    super(message);
    this.name = 'WorkoutFileProcessingError';
    this.code = ERROR_CODES.WORKOUT_FILE_INVALID;
    this.statusCode = 400;
    this.fileType = fileType;
    Object.setPrototypeOf(this, WorkoutFileProcessingError.prototype);
  }
}

/**
 * Error thrown when workout structure is invalid
 */
export class WorkoutStructureError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly structureDetails?: Record<string, unknown>;

  constructor(message: string, structureDetails?: Record<string, unknown>) {
    super(message);
    this.name = 'WorkoutStructureError';
    this.code = ERROR_CODES.WORKOUT_STRUCTURE_INVALID;
    this.statusCode = 400;
    this.structureDetails = structureDetails;
    Object.setPrototypeOf(this, WorkoutStructureError.prototype);
  }
}

/**
 * Error thrown when workout service is unavailable
 */
export class WorkoutServiceUnavailableError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(serviceName: string, reason: string) {
    super(`Workout service '${serviceName}' is unavailable: ${reason}`);
    this.name = 'WorkoutServiceUnavailableError';
    this.code = ERROR_CODES.WORKOUT_REPOSITORY_ERROR;
    this.statusCode = 503;
    Object.setPrototypeOf(this, WorkoutServiceUnavailableError.prototype);
  }
}

/**
 * Error thrown when workout data is corrupted
 */
export class WorkoutDataCorruptionError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(workoutId: string, corruptionType: string) {
    super(`Workout data for ID '${workoutId}' is corrupted: ${corruptionType}`);
    this.name = 'WorkoutDataCorruptionError';
    this.code = ERROR_CODES.WORKOUT_REPOSITORY_ERROR;
    this.statusCode = 500;
    Object.setPrototypeOf(this, WorkoutDataCorruptionError.prototype);
  }
}

/**
 * Error thrown when workout quota is exceeded
 */
export class WorkoutQuotaExceededError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(quotaType: string, limit: number, current: number) {
    super(`Workout quota exceeded for '${quotaType}': ${current}/${limit}`);
    this.name = 'WorkoutQuotaExceededError';
    this.code = ERROR_CODES.WORKOUT_REPOSITORY_ERROR;
    this.statusCode = 429;
    Object.setPrototypeOf(this, WorkoutQuotaExceededError.prototype);
  }
}

/**
 * Error thrown when workout synchronization fails
 */
export class WorkoutSyncError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(
    workoutId: string,
    syncDirection: 'upload' | 'download',
    reason: string
  ) {
    super(
      `Workout sync failed for ID '${workoutId}' (${syncDirection}): ${reason}`
    );
    this.name = 'WorkoutSyncError';
    this.code = ERROR_CODES.WORKOUT_REPOSITORY_ERROR;
    this.statusCode = 500;
    Object.setPrototypeOf(this, WorkoutSyncError.prototype);
  }
}
