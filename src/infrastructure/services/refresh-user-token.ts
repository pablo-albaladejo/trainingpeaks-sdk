import type { UserRepository } from '@/application/repositories';
import type { RefreshUserToken } from '@/application/services';
import { getSDKConfig } from '@/config';
import { AuthenticationError, NetworkError, ValidationError } from '@/domain/errors/domain-errors';
import type { AuthToken } from '@/domain';
import { createAuthToken } from '@/domain/entities/auth-token';

/**
 * Refresh authentication token
 */
export const refreshUserToken =
  (userRepository: UserRepository): RefreshUserToken =>
  async (refreshToken: string): Promise<AuthToken> => {
    try {
      // Validate input parameters
      if (!refreshToken || refreshToken.trim().length === 0) {
        throw new ValidationError('Refresh token cannot be empty', 'refreshToken');
      }

      const sdkConfig = getSDKConfig();

      // Get raw data from repository
      const rawToken = await userRepository.refreshToken(refreshToken);

      // Validate raw data before processing
      if (!rawToken.accessToken) {
        throw new AuthenticationError('No access token received from token refresh', 'AUTH_TOKEN_INVALID');
      }

      // Create domain object with business logic
      const authToken = createAuthToken(
        rawToken.accessToken,
        rawToken.tokenType,
        new Date(Date.now() + sdkConfig.tokens.defaultExpiration),
        rawToken.refreshToken
      );

      return authToken;
    } catch (error) {
      // Transform and enrich errors with context
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        // Re-throw domain errors as-is
        throw error;
      }
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Check for authentication-related errors
        if (errorMessage.includes('invalid') || errorMessage.includes('expired') || errorMessage.includes('unauthorized')) {
          throw new AuthenticationError('Refresh token is invalid or expired', 'AUTH_REFRESH_TOKEN_INVALID');
        }
        
        // Check for network errors
        if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('connection')) {
          throw new NetworkError(`Network error during token refresh: ${error.message}`);
        }
        
        // Default authentication error
        throw new AuthenticationError(`Token refresh failed: ${error.message}`, 'AUTH_REFRESH_FAILED');
      }
      
      // Re-throw unknown errors
      throw error;
    }
  };
