import type { UserRepository } from '@/application/repositories';
import type { GetCurrentUser } from '@/application/services';
import { createUser } from '@/domain/entities/user';
import { AuthenticationError, NetworkError } from '@/domain/errors/domain-errors';
import type { AuthToken, User } from '@/domain/schemas';

/**
 * Get current user information using authentication token
 */
export const getCurrentUser =
  (userRepository: UserRepository): GetCurrentUser =>
  async (token: AuthToken): Promise<User> => {
    try {
      // Get raw data from repository
      const rawData = await userRepository.getUserInfo(token);

      // Validate raw data before processing
      if (!rawData.id) {
        throw new AuthenticationError('No user ID received from user info request', 'AUTH_USER_NOT_FOUND');
      }

      // Create domain object with business logic
      const user = createUser(
        String(rawData.id),
        rawData.name,
        rawData.avatar,
        rawData.preferences
      );

      return user;
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
          throw new AuthenticationError('Authentication failed during user info retrieval', 'AUTH_TOKEN_INVALID');
        }
        
        // Check for network errors
        if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('connection')) {
          throw new NetworkError(`Network error during user info retrieval: ${error.message}`);
        }
        
        // Default authentication error
        throw new AuthenticationError(`Failed to retrieve current user: ${error.message}`, 'AUTH_FAILED');
      }
      
      // Re-throw unknown errors
      throw error;
    }
  };
