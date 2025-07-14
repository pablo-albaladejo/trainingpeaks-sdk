/**
 * TrainingPeaks SDK
 * Main entry point for the SDK
 */

// Main client
export { TrainingPeaksClient } from './training-peaks-client';

// Configuration
export { getSDKConfig } from './config';

// Workout manager
export { createWorkoutManager } from './workout-manager';

// Domain entities
export { AuthToken } from './domain/entities/auth-token';
export { User } from './domain/entities/user';
export { Workout } from './domain/entities/workout';

// Domain errors
export * from './domain/errors';

// Value objects
export { Credentials } from './domain/value-objects/credentials';
export { WorkoutFile } from './domain/value-objects/workout-file';
export { WorkoutLength } from './domain/value-objects/workout-length';
export { WorkoutStep } from './domain/value-objects/workout-step';
export { WorkoutStructure } from './domain/value-objects/workout-structure';
export { WorkoutTarget } from './domain/value-objects/workout-target';

// Use cases
export { createStructuredWorkoutUseCase } from './application/use-cases/create-structured-workout';
export { createDeleteWorkoutUseCase } from './application/use-cases/delete-workout';
export { createGetCurrentUserUseCase } from './application/use-cases/get-current-user';
export { createGetWorkoutUseCase } from './application/use-cases/get-workout';
export { createListWorkoutsUseCase } from './application/use-cases/list-workouts';
export { createLoginUseCase } from './application/use-cases/login';
export { createLogoutUseCase } from './application/use-cases/logout';
export { createUploadWorkoutUseCase } from './application/use-cases/upload-workout';

// Types
export * from './types';
