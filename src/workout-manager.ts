/**
 * TrainingPeaks Workout Manager
 * Entry point for workout management operations
 * Following strict hexagonal architecture principles
 */

import type {
  StructuredWorkoutData,
  WorkoutData,
  WorkoutManagerConfig,
  WorkoutSearchCriteria,
  WorkoutStatsFilters,
  WorkoutStatsResponse,
  WorkoutUploadResponse,
} from '@/application/services/workout-manager';
import { createLoggerService } from '@/infrastructure/services/logger';
import { createWorkoutManagerService } from '@/infrastructure/services/workout-manager';
import { TrainingPeaksClientConfig } from '@/types';

// Re-export types from application layer
export type {
  StructuredWorkoutData,
  WorkoutData,
  WorkoutManagerConfig,
  WorkoutSearchCriteria,
  WorkoutStatsFilters,
  WorkoutStatsResponse,
  WorkoutUploadResponse,
};

/**
 * Create a WorkoutManager instance
 *
 * This is the main entry point for workout management operations.
 * It follows hexagonal architecture by composing the application layer
 * with infrastructure implementations.
 *
 * @param config - Configuration for TrainingPeaks client
 * @param logger - Optional logger implementation
 * @returns WorkoutManager instance with all workout operations
 */
export const createWorkoutManager = (
  config: TrainingPeaksClientConfig = {},
  logger?: any
): any => {
  // Create logger if not provided
  const workoutLogger = logger || createLoggerService({ level: 'info' });

  // Create workout manager service
  const workoutManagerService = createWorkoutManagerService();

  return workoutManagerService;
};

/**
 * Type alias for backward compatibility
 */
export type WorkoutManager = any;

/**
 * Legacy compatibility - export the same interface as before
 * @deprecated Use createWorkoutManager instead
 */
export { createWorkoutManager as default };

/**
 * Legacy compatibility types
 * @deprecated Use types from application layer instead
 */
export type {
  StructuredWorkoutData as WorkoutCreationData,
  WorkoutData as WorkoutUploadData,
};
