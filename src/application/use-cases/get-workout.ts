/**
 * Get Workout Use Case
 * Handles retrieving workout information
 */

import { WorkoutDomainService } from '@/application/services/workout-domain';
import { Workout } from '@/domain/entities/workout';

export interface GetWorkoutRequest {
  workoutId: string;
}

/**
 * Get Workout Use Case Factory
 * Creates a get workout use case with dependency injection
 */
export const createGetWorkoutUseCase = (
  workoutDomainService: WorkoutDomainService
) => {
  /**
   * Execute get workout process
   */
  const execute = async (request: GetWorkoutRequest): Promise<Workout> => {
    // Delegate to domain service
    return await workoutDomainService.getWorkout(request.workoutId);
  };

  return { execute };
};

// Export the type for dependency injection
export type GetWorkoutUseCase = ReturnType<typeof createGetWorkoutUseCase>;
