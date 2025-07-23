/**
 * TrainingPeaks SDK
 * Main entry point for the SDK
 */

// Main client
export {
  TrainingPeaksClient,
  createTrainingPeaksClientWithPersistentStorage,
} from './training-peaks-client';

// Configuration
export { getSDKConfig } from './config';

// Workout manager
export { createWorkoutManager } from './workout-manager';

// Storage adapters
export {
  FileSystemStorageAdapter,
  InMemoryStorageAdapter,
} from './infrastructure/storage';

// Domain types (inferred from Zod schemas)
export type {
  AuthToken,
  Credentials,
  User,
  Workout,
  WorkoutElementType,
  WorkoutFile,
  WorkoutIntensityClass,
  WorkoutIntensityMetric,
  WorkoutIntensityTargetType,
  WorkoutLength,
  WorkoutLengthMetric,
  WorkoutLengthUnit,
  WorkoutStep,
  WorkoutStructure,
  WorkoutStructureElement,
  WorkoutTarget,
} from './domain';

// Domain errors
export * from './domain/errors';

// Use cases
export { createStructuredWorkoutUseCase } from './application/use-cases/create-structured-workout';
export { createDeleteWorkoutUseCase } from './application/use-cases/delete-workout';
export { createGetCurrentUserUseCase } from './application/use-cases/get-current-user';
export { createGetWorkoutUseCase } from './application/use-cases/get-workout';
export { createListWorkoutsUseCase } from './application/use-cases/list-workouts';
export { createLoginUseCase } from './application/use-cases/login';
export { createLogoutUseCase } from './application/use-cases/logout';
export { createUploadWorkoutUseCase } from './application/use-cases/upload-workout';

// Workout Builder (Patrón Builder para crear entrenamientos)
export {
  StructureElementBuilder,
  WorkoutStepBuilder,
  WorkoutStructureBuilder,
  createCooldownElement,
  createCooldownStep,
  createCyclingWorkoutStructure,
  createIntervalStep,
  createIntervalWorkoutStructure,
  createIntervalsElement,
  createRecoveryStep,
  createRestStep,
  createSweetSpotStep,
  createVO2MaxStep,
  createWarmupElement,
  createWarmupStep,
  type CyclingWorkoutConfig,
  type IntervalWorkoutConfig,
} from './infrastructure/services/workout-builder';

// Types
export * from './types';
