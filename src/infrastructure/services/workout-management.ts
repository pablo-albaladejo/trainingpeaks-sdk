/**
 * Workout Management Service Implementation
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import { WorkoutNotFoundError } from '@/domain/errors/workout-errors';

/**
 * IMPLEMENTATION of WorkoutManagementService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createWorkoutManagementService = (
  workoutRepository: WorkoutRepository,
  validationService: any
): any => {
  return {
    deleteWorkout: async (workoutId: string): Promise<boolean> => {
      // Validate business rules
      validationService.validateWorkoutId(workoutId);

      // Get workout to check if it exists and can be deleted
      const workout = await workoutRepository.getWorkout(workoutId);
      if (!workout) {
        throw new WorkoutNotFoundError(workoutId);
      }

      // Validate that workout can be deleted
      validationService.validateWorkoutCanBeDeleted(workout);

      // Delete workout
      const deleted = await workoutRepository.deleteWorkout(workoutId);

      // Return false if deletion failed at repository level
      return deleted === true;
    },
  };
};
