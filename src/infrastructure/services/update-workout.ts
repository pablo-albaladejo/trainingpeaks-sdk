import type { WorkoutRepository } from '@/application/repositories';
import type { UpdateWorkout } from '@/application/services/update-workout';
import { AuthenticationError, NetworkError, ValidationError } from '@/domain/errors/domain-errors';
import { WorkoutNotFoundError, WorkoutValidationError } from '@/domain/errors/workout-errors';
import type {
  AuthToken,
  UpdateWorkoutRequest,
  WorkoutResponse,
} from '@/domain/schemas';

export const updateWorkout =
  (workoutRepository: WorkoutRepository): UpdateWorkout =>
  async (
    token: AuthToken,
    workout: UpdateWorkoutRequest
  ): Promise<WorkoutResponse> => {
    try {
      // Validate required fields
      if (!workout.id || workout.id.trim().length === 0) {
        throw new ValidationError('Workout ID is required for update', 'id');
      }

      return await workoutRepository.updateWorkout(token, workout);
    } catch (error) {
      // Transform and enrich errors with context
      if (error instanceof ValidationError || error instanceof WorkoutValidationError || 
          error instanceof WorkoutNotFoundError || error instanceof AuthenticationError) {
        // Re-throw domain errors as-is
        throw error;
      }
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Check for authentication-related errors
        if (errorMessage.includes('unauthorized') || errorMessage.includes('invalid token')) {
          throw new AuthenticationError('Authentication failed during workout update', 'AUTH_TOKEN_INVALID');
        }
        
        // Check for not found errors
        if (errorMessage.includes('not found') || errorMessage.includes('404')) {
          throw new WorkoutNotFoundError(`Workout with ID '${workout.id}' not found for update`);
        }
        
        // Check for validation errors
        if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
          throw new WorkoutValidationError(`Workout update validation failed: ${error.message}`);
        }
        
        // Check for network errors
        if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('connection')) {
          throw new NetworkError(`Network error during workout update: ${error.message}`);
        }
        
        // Default error with context
        throw new Error(`Failed to update workout with ID '${workout.id}': ${error.message}`);
      }
      
      // Re-throw unknown errors
      throw error;
    }
  };
