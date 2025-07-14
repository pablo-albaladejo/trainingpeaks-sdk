/**
 * Create Structured Workout Use Case
 */

import type {
  CreateStructuredWorkout,
  CreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse,
} from '@/application/services/workout-creation';

/**
 * Request type for creating a structured workout
 */
export type CreateStructuredWorkoutUseCaseRequest =
  CreateStructuredWorkoutRequest;

/**
 * Response type for creating a structured workout
 */
export type CreateStructuredWorkoutUseCaseResponse =
  CreateStructuredWorkoutResponse;

/**
 * Use case for creating structured workouts
 */
export const createStructuredWorkoutUseCase = (
  createStructuredWorkoutFn: CreateStructuredWorkout
) => {
  return {
    execute: async (
      request: CreateStructuredWorkoutUseCaseRequest
    ): Promise<CreateStructuredWorkoutUseCaseResponse> => {
      return await createStructuredWorkoutFn(request);
    },
  };
};
