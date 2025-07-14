/**
 * TrainingPeaks Workout Manager
 * Entry point for workout management operations
 * Following strict hexagonal architecture principles
 */

import type { LoggerService } from '@/application/services/logger';
import type {
  StructuredWorkoutData,
  WorkoutData,
  WorkoutManagerConfig,
  WorkoutManagerService,
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
  WorkoutManagerService,
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
  logger?: LoggerService
): WorkoutManagerService => {
  // Create logger if not provided
  const workoutLogger = logger || createLoggerService({ level: 'info' });

  // Map TrainingPeaksClientConfig to WorkoutManagerConfig
  const workoutManagerConfig: WorkoutManagerConfig = {
    baseUrl: config.baseUrl,
    timeout: config.timeout,
    debug: config.debug,
    headers: config.headers,
  };

  // Create and return the workout manager service
  return createWorkoutManagerService(workoutManagerConfig, workoutLogger);
};

/**
 * WorkoutManager type for TypeScript support
 */
export type WorkoutManager = WorkoutManagerService;

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
