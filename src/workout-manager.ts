/**
 * Workout Manager
 * High-level API for workout operations
 */

import type { AuthRepository } from '@/application/ports/auth';
import type { WorkoutRepository } from '@/application/ports/workout';
import { getSDKConfig, type TrainingPeaksClientConfig } from '@/config';
import { createTrainingPeaksWorkoutRepository } from '@/infrastructure/repositories/training-peaks-workout';
import {
  createStructuredWorkout,
  deleteWorkout,
  getWorkout,
  getWorkoutRepository,
  getWorkoutStats,
  listWorkouts,
  searchWorkouts,
  uploadWorkout,
  uploadWorkoutFromFile,
} from '@/infrastructure/services/workout-manager';
import { TrainingPeaksWorkoutApiAdapter } from '@/infrastructure/workout/trainingpeaks-api-adapter';

/**
 * Create workout manager with real TrainingPeaks integration
 */
export const createWorkoutManager = (
  config?: TrainingPeaksClientConfig,
  authRepository?: AuthRepository
) => {
  // Get SDK configuration with optional overrides
  const sdkConfig = getSDKConfig(config);

  // Create API adapter
  const apiAdapter = new TrainingPeaksWorkoutApiAdapter();

  // Create repository with real API integration
  const workoutRepository: WorkoutRepository =
    createTrainingPeaksWorkoutRepository(
      // File system adapter (placeholder for now)
      {
        readFile: async () => Buffer.from(''),
        writeFile: async () => {},
        deleteFile: async () => {},
        exists: async () => false,
        fileExists: async () => false,
        createDirectory: async () => {},
        listFiles: async () => [],
        getFileStats: async () => ({
          size: 0,
          created: new Date(),
          modified: new Date(),
        }),
        moveFile: async () => {},
        copyFile: async () => {},
      },
      {
        baseUrl: sdkConfig.urls.apiBaseUrl,
        timeout: sdkConfig.timeouts.default,
        retries: sdkConfig.requests.retryAttempts,
        headers: sdkConfig.requests.defaultHeaders,
      },
      authRepository
    );

  // Note: The repository factory should handle adapter registration internally
  // The API adapter will be used when the repository calls getWorkoutService()

  return {
    uploadWorkout: uploadWorkout(workoutRepository),
    uploadWorkoutFromFile: uploadWorkoutFromFile(workoutRepository),
    getWorkout: getWorkout(workoutRepository),
    listWorkouts: listWorkouts(workoutRepository),
    deleteWorkout: deleteWorkout(workoutRepository),
    createStructuredWorkout: createStructuredWorkout(workoutRepository),
    searchWorkouts: searchWorkouts(workoutRepository),
    getWorkoutStats: getWorkoutStats(workoutRepository),
    getWorkoutRepository: getWorkoutRepository(workoutRepository),
  };
};

/**
 * Default workout manager instance
 */
export const workoutManager = createWorkoutManager();

/**
 * Type alias for backward compatibility
 */
export type WorkoutManager = ReturnType<typeof createWorkoutManager>;

/**
 * Legacy compatibility - export the same interface as before
 * @deprecated Use createWorkoutManager instead
 */
export { createWorkoutManager as default };
