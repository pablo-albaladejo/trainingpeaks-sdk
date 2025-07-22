/**
 * Create Structured Workout Use Case
 */

import type {
  CreateStructuredWorkout,
  CreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse,
} from '@/application/services/workout-creation';

export type CreateStructuredWorkoutUseCaseRequest =
  CreateStructuredWorkoutRequest;
export type CreateStructuredWorkoutUseCaseResponse =
  CreateStructuredWorkoutResponse;
export type ExecuteCreateStructuredWorkoutUseCase = (
  request: CreateStructuredWorkoutUseCaseRequest
) => Promise<CreateStructuredWorkoutUseCaseResponse>;

/**
 * Create Structured Workout Use Case Implementation
 * Individual function that receives dependencies as parameters
 */
export const executeCreateStructuredWorkoutUseCase =
  (
    createStructuredWorkoutFn: CreateStructuredWorkout
  ): ExecuteCreateStructuredWorkoutUseCase =>
  async (
    request: CreateStructuredWorkoutUseCaseRequest
  ): Promise<CreateStructuredWorkoutUseCaseResponse> => {
    return await createStructuredWorkoutFn(request);
  };

// Keep the existing grouped function for backward compatibility
export const createStructuredWorkoutUseCase = (
  createStructuredWorkoutFn: CreateStructuredWorkout
) => {
  return {
    execute: executeCreateStructuredWorkoutUseCase(createStructuredWorkoutFn),
  };
};
