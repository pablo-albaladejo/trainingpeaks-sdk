/**
 * List Workouts Use Case
 * Handles retrieving a list of workouts
 */

import { Workout } from '@/domain/entities/workout';
import { WorkoutDomainService } from '@/domain/services/workout-domain';

export interface ListWorkoutsRequest {
  startDate?: Date;
  endDate?: Date;
  activityType?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * List Workouts Use Case Factory
 * Creates a list workouts use case with dependency injection
 */
export const createListWorkoutsUseCase = (
  workoutDomainService: WorkoutDomainService
) => {
  /**
   * Execute list workouts process
   */
  const execute = async (
    request: ListWorkoutsRequest = {}
  ): Promise<Workout[]> => {
    // Delegate to domain service
    return await workoutDomainService.listWorkouts(request);
  };

  return { execute };
};

// Export the type for dependency injection
export type ListWorkoutsUseCase = ReturnType<typeof createListWorkoutsUseCase>;
