/**
 * Workout Management Service Implementation
 * Implements the WorkoutManagementService contract with business logic for workout management
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import type { WorkoutManagementService } from '@/application/services/workout-management';
import type { WorkoutValidationService } from '@/application/services/workout-validation';
import { WorkoutNotFoundError } from '@/domain/errors/workout-errors';

/**
 * IMPLEMENTATION of WorkoutManagementService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createWorkoutManagementService = (
  workoutRepository: WorkoutRepository,
  validationService: WorkoutValidationService
): WorkoutManagementService => ({
  deleteWorkout: async (workoutId: string): Promise<boolean> => {
    validationService.validateWorkoutId(workoutId);

    // First check if workout exists
    const existingWorkout = await workoutRepository.getWorkout(workoutId);
    if (!existingWorkout) {
      throw new WorkoutNotFoundError(workoutId);
    }

    // Check if workout can be deleted (business rules)
    validationService.validateWorkoutCanBeDeleted(existingWorkout);

    // Delete the workout
    return await workoutRepository.deleteWorkout(workoutId);
  },
});
