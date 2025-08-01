import type { UserRepository } from '@/application/repositories';
import type { GetUserSettings } from '@/application/services';
import { AuthenticationError, NetworkError } from '@/domain/errors/domain-errors';
import type { AuthToken, UserPreferences } from '@/domain/schemas';

/**
 * Get user settings
 */
export const getUserSettings =
  (userRepository: UserRepository): GetUserSettings =>
  async (token: AuthToken): Promise<UserPreferences> => {
    try {
      return await userRepository.getUserSettings(token);
    } catch (error) {
      // Transform and enrich errors with context
      if (error instanceof AuthenticationError) {
        // Re-throw domain errors as-is
        throw error;
      }
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Check for authentication-related errors
        if (errorMessage.includes('unauthorized') || errorMessage.includes('invalid token')) {
          throw new AuthenticationError('Authentication failed during user settings retrieval', 'AUTH_TOKEN_INVALID');
        }
        
        // Check for network errors
        if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('connection')) {
          throw new NetworkError(`Network error during user settings retrieval: ${error.message}`);
        }
        
        // Default error with context
        throw new Error(`Failed to retrieve user settings: ${error.message}`);
      }
      
      // Re-throw unknown errors
      throw error;
    }
  };
