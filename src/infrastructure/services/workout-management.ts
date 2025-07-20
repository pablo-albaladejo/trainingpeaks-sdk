/**
 * Workout Management Service Implementation
 * Individual function implementations that receive dependencies as parameters
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import type { DeleteWorkout } from '@/application/services/workout-management';
import { WorkoutNotFoundError } from '@/domain/errors/workout-errors';

export const deleteWorkout =
  (
    workoutRepository: WorkoutRepository,
    validationService: {
      validateWorkoutId: (workoutId: string) => void;
      validateWorkoutCanBeDeleted: (workout: unknown) => void;
    }
  ): DeleteWorkout =>
  async (workoutId: string): Promise<boolean> => {
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
  };
