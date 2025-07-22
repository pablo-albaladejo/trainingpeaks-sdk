/**
 * Upload Workout Use Case
 */

import type {
  UploadWorkout,
  UploadWorkoutRequest,
  UploadWorkoutResponse,
} from '@/application/services/workout-creation';

export type UploadWorkoutUseCaseRequest = UploadWorkoutRequest;
export type UploadWorkoutUseCaseResponse = UploadWorkoutResponse;
export type ExecuteUploadWorkoutUseCase = (
  request: UploadWorkoutUseCaseRequest
) => Promise<UploadWorkoutUseCaseResponse>;

/**
 * Upload Workout Use Case Implementation
 * Individual function that receives dependencies as parameters
 */
export const executeUploadWorkoutUseCase =
  (uploadWorkoutFn: UploadWorkout): ExecuteUploadWorkoutUseCase =>
  async (
    request: UploadWorkoutUseCaseRequest
  ): Promise<UploadWorkoutUseCaseResponse> => {
    return await uploadWorkoutFn(request);
  };

// Keep the existing grouped function for backward compatibility
export const createUploadWorkoutUseCase = (uploadWorkoutFn: UploadWorkout) => {
  return {
    execute: executeUploadWorkoutUseCase(uploadWorkoutFn),
  };
};
