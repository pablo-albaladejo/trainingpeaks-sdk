import type { WorkoutRepository } from '@/application/repositories';
import type { GetWorkoutById } from '@/application/services/get-workout-by-id';
import { AuthenticationError, NetworkError, ValidationError } from '@/domain/errors/domain-errors';
import { WorkoutNotFoundError } from '@/domain/errors/workout-errors';
import type { AuthToken, WorkoutResponse } from '@/domain/schemas';

export const getWorkoutById =
  (workoutRepository: WorkoutRepository): GetWorkoutById =>
  async (token: AuthToken, id: string): Promise<WorkoutResponse> => {
    try {
      // Validate input parameters
      if (!id || id.trim().length === 0) {
        throw new ValidationError('Workout ID cannot be empty', 'id');
      }

      return await workoutRepository.getWorkoutById(token, id);
    } catch (error) {
      // Transform and enrich errors with context
      if (error instanceof ValidationError || error instanceof WorkoutNotFoundError || error instanceof AuthenticationError) {
        // Re-throw domain errors as-is
        throw error;
      }
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Check for authentication-related errors
        if (errorMessage.includes('unauthorized') || errorMessage.includes('invalid token')) {
          throw new AuthenticationError('Authentication failed during workout retrieval', 'AUTH_TOKEN_INVALID');
        }
        
        // Check for not found errors
        if (errorMessage.includes('not found') || errorMessage.includes('404')) {
          throw new WorkoutNotFoundError(error.message);
        }
        
        // Check for network errors
        if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('connection')) {
          throw new NetworkError(`Network error during workout retrieval: ${error.message}`);
        }
        
        // Default error with context
        throw new Error(`Failed to retrieve workout with ID '${id}': ${error.message}`);
      }
      
      // Re-throw unknown errors
      throw error;
    }
  };
