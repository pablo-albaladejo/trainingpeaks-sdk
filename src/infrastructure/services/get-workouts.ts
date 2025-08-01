import type { WorkoutRepository } from '@/application/repositories';
import type { GetWorkouts } from '@/application/services/get-workouts';
import { AuthenticationError, NetworkError, ValidationError } from '@/domain/errors/domain-errors';
import type {
  AuthToken,
  WorkoutFilters,
  WorkoutsListResponse,
} from '@/domain/schemas';

export const getWorkouts =
  (workoutRepository: WorkoutRepository): GetWorkouts =>
  async (
    token: AuthToken,
    filters?: WorkoutFilters
  ): Promise<WorkoutsListResponse> => {
    try {
      // Validate filters if provided
      if (filters) {
        if (filters.dateFrom && filters.dateTo && new Date(filters.dateFrom) > new Date(filters.dateTo)) {
          throw new ValidationError('Start date cannot be after end date', 'dateRange');
        }
        
        if (filters.limit && filters.limit < 0) {
          throw new ValidationError('Limit cannot be negative', 'limit');
        }
        
        if (filters.offset && filters.offset < 0) {
          throw new ValidationError('Offset cannot be negative', 'offset');
        }
      }

      return await workoutRepository.getWorkouts(token, filters);
    } catch (error) {
      // Transform and enrich errors with context
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        // Re-throw domain errors as-is
        throw error;
      }
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Check for authentication-related errors
        if (errorMessage.includes('unauthorized') || errorMessage.includes('invalid token')) {
          throw new AuthenticationError('Authentication failed during workouts retrieval', 'AUTH_TOKEN_INVALID');
        }
        
        // Check for network errors
        if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('connection')) {
          throw new NetworkError(`Network error during workouts retrieval: ${error.message}`);
        }
        
        // Default error with context
        throw new Error(`Failed to retrieve workouts: ${error.message}`);
      }
      
      // Re-throw unknown errors
      throw error;
    }
  };
