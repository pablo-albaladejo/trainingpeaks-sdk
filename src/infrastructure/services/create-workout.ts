import type { WorkoutRepository } from '@/application/repositories';
import type { CreateWorkout } from '@/application/services/create-workout';
import { AuthenticationError, NetworkError } from '@/domain/errors/domain-errors';
import { WorkoutUploadError, WorkoutValidationError } from '@/domain/errors/workout-errors';
import type {
  AuthToken,
  CreateWorkoutRequest,
  WorkoutResponse,
} from '@/domain/schemas';

export const createWorkout =
  (workoutRepository: WorkoutRepository): CreateWorkout =>
  async (
    token: AuthToken,
    workout: CreateWorkoutRequest
  ): Promise<WorkoutResponse> => {
    try {
      return await workoutRepository.createWorkout(token, workout);
    } catch (error) {
      // Transform and enrich errors with context
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Check for authentication-related errors
        if (errorMessage.includes('unauthorized') || errorMessage.includes('invalid token')) {
          throw new AuthenticationError('Authentication failed during workout creation', 'AUTH_TOKEN_INVALID');
        }
        
        // Check for validation errors
        if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
          throw new WorkoutValidationError(`Workout validation failed: ${error.message}`);
        }
        
        // Check for network errors
        if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('connection')) {
          throw new NetworkError(`Network error during workout creation: ${error.message}`);
        }
        
        // Check for upload-specific errors
        if (errorMessage.includes('upload') || errorMessage.includes('file')) {
          throw new WorkoutUploadError(`Failed to upload workout: ${error.message}`);
        }
      }
      
      // Re-throw if we can't classify the error
      throw error;
    }
  };
