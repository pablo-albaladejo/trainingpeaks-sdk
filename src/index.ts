/**
 * TrainingPeaks SDK
 * Main entry point for the SDK
 */

// Main client - Functional client for external use
export { createTrainingPeaksClient } from './adapters/client/training-peaks-client';
export type { TrainingPeaksClient } from './adapters/client/training-peaks-client';

// Essential types that external projects might need
export type { User, Workout, WorkoutFile, WorkoutStructure } from './domain';

// Essential error types for error handling
export {
  AuthenticationError,
  NetworkError,
  ValidationError,
  WorkoutError,
} from './domain/errors/domain-errors';
