/**
 * Workout Manager
 * High-level API for workout operations
 */

import type { WorkoutRepository } from '@/application/ports/workout';
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

// Mock repository for placeholder functionality
const mockWorkoutRepository: WorkoutRepository = {
  getWorkout: async () => null,
  listWorkouts: async () => [],
  deleteWorkout: async () => true,
  createStructuredWorkout: async () => ({
    id: 'placeholder',
    success: true,
    message: 'Workout created successfully',
  }),
  uploadWorkout: async () => ({
    success: true,
    workoutId: 'placeholder',
    message: 'Workout uploaded successfully',
  }),
  uploadWorkoutFromFile: async () => ({
    success: true,
    workoutId: 'placeholder',
    message: 'Workout uploaded from file successfully',
  }),
  updateWorkout: async () => {
    throw new Error('Update workout not implemented');
  },
  searchWorkouts: async () => [],
  getWorkoutStats: async () => ({
    totalWorkouts: 0,
    totalDuration: 0,
    totalDistance: 0,
    averageDuration: 0,
    averageDistance: 0,
  }),
};

/**
 * Create workout manager with default configuration
 */
export const createWorkoutManager = () => {
  return {
    uploadWorkout: uploadWorkout(mockWorkoutRepository),
    uploadWorkoutFromFile: uploadWorkoutFromFile(mockWorkoutRepository),
    getWorkout: getWorkout(mockWorkoutRepository),
    listWorkouts: listWorkouts(mockWorkoutRepository),
    deleteWorkout: deleteWorkout(mockWorkoutRepository),
    createStructuredWorkout: createStructuredWorkout(mockWorkoutRepository),
    searchWorkouts: searchWorkouts(mockWorkoutRepository),
    getWorkoutStats: getWorkoutStats(mockWorkoutRepository),
    getWorkoutRepository: getWorkoutRepository(mockWorkoutRepository),
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
