/**
 * Domain-specific errors for workout operations
 */

import { TrainingPeaksError } from './index';

/**
 * Base class for workout-related errors
 */
export class WorkoutError extends TrainingPeaksError {
  constructor(
    message: string,
    code: string = 'WORKOUT_ERROR',
    statusCode: number = 500
  ) {
    super(message, code, statusCode);
    this.name = 'WorkoutError';
    Object.setPrototypeOf(this, WorkoutError.prototype);
  }
}

/**
 * Error thrown when a workout is not found
 */
export class WorkoutNotFoundError extends WorkoutError {
  constructor(workoutId: string) {
    super(`Workout with ID '${workoutId}' not found`, 'WORKOUT_NOT_FOUND', 404);
    this.name = 'WorkoutNotFoundError';
    Object.setPrototypeOf(this, WorkoutNotFoundError.prototype);
  }
}

/**
 * Error thrown when workout validation fails
 */
export class WorkoutValidationError extends WorkoutError {
  constructor(message: string, details?: string[]) {
    super(message, 'WORKOUT_VALIDATION_ERROR', 400);
    this.name = 'WorkoutValidationError';
    Object.setPrototypeOf(this, WorkoutValidationError.prototype);
    if (details) {
      this.details = details;
    }
  }

  public details?: string[];
}

/**
 * Error thrown when workout operation is not allowed
 */
export class WorkoutOperationNotAllowedError extends WorkoutError {
  constructor(operation: string, reason: string) {
    super(
      `Operation '${operation}' is not allowed: ${reason}`,
      'WORKOUT_OPERATION_NOT_ALLOWED',
      403
    );
    this.name = 'WorkoutOperationNotAllowedError';
    Object.setPrototypeOf(this, WorkoutOperationNotAllowedError.prototype);
  }
}

/**
 * Error thrown when workout upload fails
 */
export class WorkoutUploadError extends WorkoutError {
  constructor(message: string, fileInfo?: { filename: string; size: number }) {
    super(message, 'WORKOUT_UPLOAD_ERROR', 500);
    this.name = 'WorkoutUploadError';
    Object.setPrototypeOf(this, WorkoutUploadError.prototype);
    this.fileInfo = fileInfo;
  }

  public fileInfo?: { filename: string; size: number };
}

/**
 * Error thrown when workout file processing fails
 */
export class WorkoutFileProcessingError extends WorkoutError {
  constructor(message: string, fileType: string) {
    super(message, 'WORKOUT_FILE_PROCESSING_ERROR', 400);
    this.name = 'WorkoutFileProcessingError';
    Object.setPrototypeOf(this, WorkoutFileProcessingError.prototype);
    this.fileType = fileType;
  }

  public fileType: string;
}

/**
 * Error thrown when workout structure is invalid
 */
export class WorkoutStructureError extends WorkoutError {
  constructor(message: string, structureDetails?: Record<string, unknown>) {
    super(message, 'WORKOUT_STRUCTURE_ERROR', 400);
    this.name = 'WorkoutStructureError';
    Object.setPrototypeOf(this, WorkoutStructureError.prototype);
    this.structureDetails = structureDetails;
  }

  public structureDetails?: Record<string, unknown>;
}

/**
 * Error thrown when workout service is unavailable
 */
export class WorkoutServiceUnavailableError extends WorkoutError {
  constructor(serviceName: string, reason: string) {
    super(
      `Workout service '${serviceName}' is unavailable: ${reason}`,
      'WORKOUT_SERVICE_UNAVAILABLE',
      503
    );
    this.name = 'WorkoutServiceUnavailableError';
    Object.setPrototypeOf(this, WorkoutServiceUnavailableError.prototype);
  }
}

/**
 * Error thrown when workout data is corrupted
 */
export class WorkoutDataCorruptionError extends WorkoutError {
  constructor(workoutId: string, corruptionType: string) {
    super(
      `Workout data for ID '${workoutId}' is corrupted: ${corruptionType}`,
      'WORKOUT_DATA_CORRUPTION_ERROR',
      500
    );
    this.name = 'WorkoutDataCorruptionError';
    Object.setPrototypeOf(this, WorkoutDataCorruptionError.prototype);
  }
}

/**
 * Error thrown when workout quota is exceeded
 */
export class WorkoutQuotaExceededError extends WorkoutError {
  constructor(quotaType: string, limit: number, current: number) {
    super(
      `Workout quota exceeded for '${quotaType}': ${current}/${limit}`,
      'WORKOUT_QUOTA_EXCEEDED_ERROR',
      429
    );
    this.name = 'WorkoutQuotaExceededError';
    Object.setPrototypeOf(this, WorkoutQuotaExceededError.prototype);
  }
}

/**
 * Error thrown when workout synchronization fails
 */
export class WorkoutSyncError extends WorkoutError {
  constructor(
    workoutId: string,
    syncDirection: 'upload' | 'download',
    reason: string
  ) {
    super(
      `Workout sync failed for ID '${workoutId}' (${syncDirection}): ${reason}`,
      'WORKOUT_SYNC_ERROR',
      500
    );
    this.name = 'WorkoutSyncError';
    Object.setPrototypeOf(this, WorkoutSyncError.prototype);
  }
}
