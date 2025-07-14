/**
 * Domain-specific errors for workout operations
 */

/**
 * Base class for workout-related errors
 */
export class WorkoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkoutError';
  }
}

/**
 * Error thrown when a workout is not found
 */
export class WorkoutNotFoundError extends WorkoutError {
  constructor(workoutId: string) {
    super(`Workout not found: ${workoutId}`);
    this.name = 'WorkoutNotFoundError';
  }
}

/**
 * Error thrown when workout validation fails
 */
export class WorkoutValidationError extends WorkoutError {
  constructor(message: string) {
    super(message);
    this.name = 'WorkoutValidationError';
  }
}

/**
 * Error thrown when athlete validation fails
 */
export class InvalidAthleteError extends WorkoutValidationError {
  constructor(message: string = 'Valid athlete ID is required') {
    super(message);
    this.name = 'InvalidAthleteError';
  }
}

/**
 * Error thrown when workout title validation fails
 */
export class InvalidWorkoutTitleError extends WorkoutValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidWorkoutTitleError';
  }
}

/**
 * Error thrown when workout type validation fails
 */
export class InvalidWorkoutTypeError extends WorkoutValidationError {
  constructor(message: string = 'Valid workout type ID is required') {
    super(message);
    this.name = 'InvalidWorkoutTypeError';
  }
}

/**
 * Error thrown when workout date validation fails
 */
export class InvalidWorkoutDateError extends WorkoutValidationError {
  constructor(message: string = 'Workout date is required') {
    super(message);
    this.name = 'InvalidWorkoutDateError';
  }
}

/**
 * Error thrown when workout structure validation fails
 */
export class InvalidWorkoutStructureError extends WorkoutValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidWorkoutStructureError';
  }
}

/**
 * Error thrown when workout file validation fails
 */
export class InvalidWorkoutFileError extends WorkoutValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidWorkoutFileError';
  }
}

/**
 * Error thrown when workout ID validation fails
 */
export class InvalidWorkoutIdError extends WorkoutValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidWorkoutIdError';
  }
}

/**
 * Error thrown when workout filters validation fails
 */
export class InvalidWorkoutFiltersError extends WorkoutValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidWorkoutFiltersError';
  }
}

/**
 * Error thrown when workout operation is not allowed
 */
export class WorkoutOperationNotAllowedError extends WorkoutError {
  constructor(message: string) {
    super(message);
    this.name = 'WorkoutOperationNotAllowedError';
  }
}
