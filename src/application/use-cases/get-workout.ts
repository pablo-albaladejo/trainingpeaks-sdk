/**
 * Get Workout Use Case
 */

import type { GetWorkout } from '@/application/services/workout-query';
import type { WorkoutData } from '@/types';

export type GetWorkoutRequest = {
  workoutId: string;
};
export type GetWorkoutResponse = WorkoutData | null;
export type ExecuteGetWorkoutUseCase = (
  request: GetWorkoutRequest
) => Promise<GetWorkoutResponse>;

/**
 * Get Workout Use Case Implementation
 * Individual function that receives dependencies as parameters
 */
export const executeGetWorkoutUseCase =
  (getWorkoutFn: GetWorkout): ExecuteGetWorkoutUseCase =>
  async (request: GetWorkoutRequest): Promise<GetWorkoutResponse> => {
    return await getWorkoutFn(request.workoutId);
  };

// Keep the existing grouped function for backward compatibility
export const createGetWorkoutUseCase = (getWorkoutFn: GetWorkout) => {
  return {
    execute: executeGetWorkoutUseCase(getWorkoutFn),
  };
};
