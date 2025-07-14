/**
 * Get Workout Use Case
 */

import type { GetWorkout } from '@/application/services/workout-query';
import type { WorkoutData } from '@/types';

/**
 * Request parameters for getting a workout
 */
export type GetWorkoutRequest = {
  workoutId: string;
};

/**
 * Response type for getting a workout
 */
export type GetWorkoutResponse = WorkoutData | null;

/**
 * Use case for getting workouts
 */
export const createGetWorkoutUseCase = (getWorkoutFn: GetWorkout) => {
  return {
    execute: async (
      request: GetWorkoutRequest
    ): Promise<GetWorkoutResponse> => {
      return await getWorkoutFn(request.workoutId);
    },
  };
};
