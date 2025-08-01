import type { WorkoutRepository } from '@/application/repositories';
import type { GetWorkoutStats } from '@/application/services/get-workout-stats';
import { AuthenticationError, NetworkError, ValidationError } from '@/domain/errors/domain-errors';
import type { AuthToken, WorkoutFilters, WorkoutStats } from '@/domain/schemas';

export const getWorkoutStats =
  (workoutRepository: WorkoutRepository): GetWorkoutStats =>
  async (token: AuthToken, filters?: WorkoutFilters): Promise<WorkoutStats> => {
    try {
      // Validate filters if provided
      if (filters) {
        if (filters.dateFrom && filters.dateTo && new Date(filters.dateFrom) > new Date(filters.dateTo)) {
          throw new ValidationError('Start date cannot be after end date', 'dateRange');
        }
        
        if (filters.limit && filters.limit < 0) {
          throw new ValidationError('Limit cannot be negative', 'limit');
        }
      }

      return await workoutRepository.getWorkoutStats(token, filters);
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
          throw new AuthenticationError('Authentication failed during workout stats retrieval', 'AUTH_TOKEN_INVALID');
        }
        
        // Check for network errors
        if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('connection')) {
          throw new NetworkError(`Network error during workout stats retrieval: ${error.message}`);
        }
        
        // Default error with context
        throw new Error(`Failed to retrieve workout stats: ${error.message}`);
      }
      
      // Re-throw unknown errors
      throw error;
    }
  };
