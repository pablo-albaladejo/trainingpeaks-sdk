import type { UserRepository } from '@/application/repositories';
import type { UpdateUserPreferences } from '@/application/services';
import { AuthenticationError, NetworkError, ValidationError } from '@/domain/errors/domain-errors';
import type { AuthToken, UserPreferences } from '@/domain/schemas';

/**
 * Update user preferences
 */
export const updateUserPreferences =
  (userRepository: UserRepository): UpdateUserPreferences =>
  async (token: AuthToken, preferences: UserPreferences): Promise<void> => {
    try {
      // Validate input parameters
      if (!preferences || typeof preferences !== 'object') {
        throw new ValidationError('User preferences must be provided as an object', 'preferences');
      }

      await userRepository.updatePreferences(token, preferences);
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
          throw new AuthenticationError('Authentication failed during preferences update', 'AUTH_TOKEN_INVALID');
        }
        
        // Check for validation errors
        if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
          throw new ValidationError(`Preferences validation failed: ${error.message}`, 'preferences');
        }
        
        // Check for network errors
        if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('connection')) {
          throw new NetworkError(`Network error during preferences update: ${error.message}`);
        }
        
        // Default error with context
        throw new Error(`Failed to update user preferences: ${error.message}`);
      }
      
      // Re-throw unknown errors
      throw error;
    }
  };
