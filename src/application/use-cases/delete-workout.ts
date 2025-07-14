/**
 * Delete Workout Use Case
 * Handles workout deletion
 */

import type { DeleteWorkout } from '@/application/services/workout-management';

export interface DeleteWorkoutRequest {
  workoutId: string;
}

/**
 * Delete Workout Use Case Factory
 * Creates a delete workout use case with dependency injection
 */
export const createDeleteWorkoutUseCase = (deleteWorkoutFn: DeleteWorkout) => {
  /**
   * Execute delete workout process
   */
  const execute = async (request: DeleteWorkoutRequest): Promise<boolean> => {
    // Delegate to domain service
    return await deleteWorkoutFn(request.workoutId);
  };

  return { execute };
};

// Export the type for dependency injection
export type DeleteWorkoutUseCase = ReturnType<
  typeof createDeleteWorkoutUseCase
>;
