import type { UserRepository } from '@/application/repositories';
import type { AuthenticateUser } from '@/application/services';
import { getSDKConfig } from '@/config';
import { createUser } from '@/domain/entities/user';
import { AuthenticationError, NetworkError, ValidationError } from '@/domain/errors/domain-errors';
import type { AuthToken, Credentials, User } from '@/domain/schemas';
import { createAuthToken } from '@/domain/entities/auth-token';

/**
 * Authenticate user with credentials and return token and user data
 */
export const authenticateUser =
  (userRepository: UserRepository): AuthenticateUser =>
  async (
    credentials: Credentials
  ): Promise<{ token: AuthToken; user: User }> => {
    try {
      const sdkConfig = getSDKConfig();

      // Get raw data from repository
      const rawData = await userRepository.authenticate(credentials);

      // Validate raw data before processing
      if (!rawData.token?.accessToken) {
        throw new AuthenticationError('No access token received from authentication', 'AUTH_TOKEN_INVALID');
      }
      
      if (!rawData.user?.id) {
        throw new AuthenticationError('No user data received from authentication', 'AUTH_USER_NOT_FOUND');
      }

      // Create domain objects with business logic
      const authToken = createAuthToken(
        rawData.token.accessToken,
        rawData.token.tokenType,
        new Date(Date.now() + sdkConfig.tokens.defaultExpiration),
        rawData.token.refreshToken
      );

      const user = createUser(
        String(rawData.user.id),
        rawData.user.name,
        rawData.user.avatar,
        rawData.user.preferences
      );

      return { token: authToken, user };
    } catch (error) {
      // Transform and enrich errors with context
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        // Re-throw domain errors as-is
        throw error;
      }
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Check for authentication-related errors
        if (errorMessage.includes('invalid credentials') || errorMessage.includes('unauthorized')) {
          throw new AuthenticationError('Invalid credentials provided', 'AUTH_INVALID_CREDENTIALS');
        }
        
        // Check for network errors
        if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('connection')) {
          throw new NetworkError(`Authentication failed due to network error: ${error.message}`);
        }
        
        // Default authentication error
        throw new AuthenticationError(`Authentication failed: ${error.message}`, 'AUTH_FAILED');
      }
      
      // Re-throw unknown errors
      throw error;
    }
  };
