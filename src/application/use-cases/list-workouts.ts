/**
 * List Workouts Use Case
 * Handles retrieving a list of workouts
 */

import type { listWorkouts } from '@/application/services/workout-query';
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
export const createListWorkoutsUseCase = (listWorkoutsFn: listWorkouts) => {
  /**
   * Execute list workouts process
   */
  const execute = async (
    request: ListWorkoutsRequest = {}
  ): Promise<Workout[]> => {
    // Delegate to workout service
    return await listWorkoutsFn(request);
  };

  return { execute };
};

// Export the type for dependency injection
export type ListWorkoutsUseCase = ReturnType<typeof createListWorkoutsUseCase>;
