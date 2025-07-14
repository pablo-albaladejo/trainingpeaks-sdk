/**
 * List Workouts Use Case
 */

import type {
  ListWorkouts,
  ListWorkoutsParams,
  ListWorkoutsResponse,
} from '@/application/services/workout-query';

/**
 * Request parameters for listing workouts
 */
export type ListWorkoutsRequest = ListWorkoutsParams;

/**
 * Response type for listing workouts
 */
export type ListWorkoutsUseCaseResponse = ListWorkoutsResponse;

/**
 * Use case for listing workouts
 */
export const createListWorkoutsUseCase = (listWorkoutsFn: ListWorkouts) => {
  return {
    execute: async (
      request: ListWorkoutsRequest
    ): Promise<ListWorkoutsUseCaseResponse> => {
      return await listWorkoutsFn(request);
    },
  };
};
