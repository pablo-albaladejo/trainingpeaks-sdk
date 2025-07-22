/**
 * List Workouts Use Case
 */

import type {
  ListWorkouts,
  ListWorkoutsParams,
  ListWorkoutsResponse,
} from '@/application/services/workout-query';

export type ListWorkoutsRequest = ListWorkoutsParams;
export type ListWorkoutsUseCaseResponse = ListWorkoutsResponse;
export type ExecuteListWorkoutsUseCase = (
  request: ListWorkoutsRequest
) => Promise<ListWorkoutsUseCaseResponse>;

/**
 * List Workouts Use Case Implementation
 * Individual function that receives dependencies as parameters
 */
export const executeListWorkoutsUseCase =
  (listWorkoutsFn: ListWorkouts): ExecuteListWorkoutsUseCase =>
  async (
    request: ListWorkoutsRequest
  ): Promise<ListWorkoutsUseCaseResponse> => {
    return await listWorkoutsFn(request);
  };

// Keep the existing grouped function for backward compatibility
export const createListWorkoutsUseCase = (listWorkoutsFn: ListWorkouts) => {
  return {
    execute: executeListWorkoutsUseCase(listWorkoutsFn),
  };
};
