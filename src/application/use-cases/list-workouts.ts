/**
 * List Workouts Use Case
 * Handles retrieving a list of workouts
 */

import { WorkoutService } from '@/application/services/workout-service';
import { Workout } from '@/domain/entities/workout';

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
export const createListWorkoutsUseCase = (workoutService: WorkoutService) => {
  /**
   * Execute list workouts process
   */
  const execute = async (
    request: ListWorkoutsRequest = {}
  ): Promise<Workout[]> => {
    // Delegate to workout service
    return await workoutService.listWorkouts(request);
  };

  return { execute };
};

// Export the type for dependency injection
export type ListWorkoutsUseCase = ReturnType<typeof createListWorkoutsUseCase>;
