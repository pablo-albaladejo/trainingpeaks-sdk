/**
 * Workout Repository Implementation
 * Implements the workout repository interface from domain layer
 */

import { getSDKConfig } from '@/config';
import type { AuthToken } from '@/domain';
import type {
  UploadWorkoutRequest,
  UploadWorkoutResponse,
  WorkoutRepository,
} from '@/domain/repositories/workout-repository';
import axios, { type AxiosInstance } from 'axios';

/**
 * Workout repository configuration
 */
export type WorkoutRepositoryConfig = {
  getToken: () => Promise<AuthToken | null>;
};

/**
 * Create workout repository
 */
export const createWorkoutRepository = (
  config: WorkoutRepositoryConfig
): WorkoutRepository => {
  /**
   * Upload a workout (structured or with file)
   */
  const uploadWorkout = async (
    request: UploadWorkoutRequest
  ): Promise<UploadWorkoutResponse> => {
    const token = await config.getToken();
    if (!token) {
      throw new Error('Authentication required to upload workout');
    }

    const sdkConfig = getSDKConfig();
    const httpClient: AxiosInstance = axios.create({
      baseURL: sdkConfig.urls.apiBaseUrl,
      timeout: sdkConfig.timeouts.default,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token.accessToken}`,
        ...sdkConfig.requests.defaultHeaders,
      },
    });

    try {
      const response = await httpClient.post('/workouts/upload', request);

      return {
        success: true,
        workoutId: response.data.workoutId,
        message: 'Workout uploaded successfully',
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        return {
          success: false,
          workoutId: '',
          message: `Failed to upload workout: ${message}`,
          errors: [message],
        };
      }
      return {
        success: false,
        workoutId: '',
        message: 'Failed to upload workout: Unknown error',
        errors: ['Unknown error'],
      };
    }
  };

  return {
    uploadWorkout,
  };
};
