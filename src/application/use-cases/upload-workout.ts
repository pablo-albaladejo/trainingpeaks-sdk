/**
 * Upload Workout Use Case
 */

import type {
  UploadWorkout,
  UploadWorkoutRequest,
  UploadWorkoutResponse,
} from '@/application/services/workout-creation';

/**
 * Request parameters for uploading a workout
 */
export type UploadWorkoutUseCaseRequest = UploadWorkoutRequest;

/**
 * Response type for uploading a workout
 */
export type UploadWorkoutUseCaseResponse = UploadWorkoutResponse;

/**
 * Use case for uploading workouts
 */
export const createUploadWorkoutUseCase = (uploadWorkoutFn: UploadWorkout) => {
  return {
    execute: async (
      request: UploadWorkoutUseCaseRequest
    ): Promise<UploadWorkoutUseCaseResponse> => {
      return await uploadWorkoutFn(request);
    },
  };
};
