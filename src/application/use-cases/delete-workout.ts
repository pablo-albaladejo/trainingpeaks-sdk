/**
 * Delete Workout Use Case
 * Handles workout deletion
 */

import type { DeleteWorkout } from '@/application/services/workout-management';

export type DeleteWorkoutRequest = {
  workoutId: string;
};
export type ExecuteDeleteWorkoutUseCase = (
  request: DeleteWorkoutRequest
) => Promise<boolean>;

/**
 * Delete Workout Use Case Implementation
 * Individual function that receives dependencies as parameters
 */
export const executeDeleteWorkoutUseCase =
  (deleteWorkoutFn: DeleteWorkout): ExecuteDeleteWorkoutUseCase =>
  async (request: DeleteWorkoutRequest): Promise<boolean> => {
    // Delegate to domain service
    return await deleteWorkoutFn(request.workoutId);
  };

// Keep the existing grouped function for backward compatibility
export const createDeleteWorkoutUseCase = (deleteWorkoutFn: DeleteWorkout) => {
  return {
    execute: executeDeleteWorkoutUseCase(deleteWorkoutFn),
  };
};

// Export the type for dependency injection
export type DeleteWorkoutUseCase = ReturnType<
  typeof createDeleteWorkoutUseCase
>;
