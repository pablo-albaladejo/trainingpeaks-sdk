/**
 * Delete Workout Use Case
 * Handles workout deletion
 */

import { WorkoutService } from '@/application/services/workout-service';

export interface DeleteWorkoutRequest {
  workoutId: string;
}

/**
 * Delete Workout Use Case Factory
 * Creates a delete workout use case with dependency injection
 */
export const createDeleteWorkoutUseCase = (workoutService: WorkoutService) => {
  /**
   * Execute delete workout process
   */
  const execute = async (request: DeleteWorkoutRequest): Promise<boolean> => {
    // Delegate to domain service
    return await workoutService.deleteWorkout(request.workoutId);
  };

  return { execute };
};

// Export the type for dependency injection
export type DeleteWorkoutUseCase = ReturnType<
  typeof createDeleteWorkoutUseCase
>;
