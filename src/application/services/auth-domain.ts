/**
 * Authentication Domain Service
 * Contains business logic for authentication operations
 */

import { getSDKConfig } from '@/config';
import { AuthToken } from '@/domain/entities/auth-token';

/**
 * Authentication Domain Service Factory
 * Creates an authentication domain service with business logic validation
 */
export const createAuthDomainService = () => {
  const sdkConfig = getSDKConfig();

  /**
   * Check if token needs refresh
   * Returns true if token will expire within the configured refresh window
   */
  const shouldRefreshToken = (token: AuthToken): boolean => {
    if (!token.expiresAt) {
      return false;
    }

    const now = new Date();
    const refreshWindow = sdkConfig.tokens.refreshWindow;
    const refreshTime = new Date(token.expiresAt.getTime() - refreshWindow);

    return now >= refreshTime;
  };

  /**
   * Validate token is still valid
   */
  const isTokenValid = (token: AuthToken): boolean => {
    if (!token.expiresAt) {
      return true; // Tokens without expiration are considered valid
    }

    const now = new Date();
    const validationWindow = sdkConfig.tokens.validationWindow;
    const validationTime = new Date(
      token.expiresAt.getTime() - validationWindow
    );

    return now < validationTime;
  };

  /**
   * Check if token is expired
   */
  const isTokenExpired = (token: AuthToken): boolean => {
    if (!token.expiresAt) {
      return false; // Tokens without expiration never expire
    }

    return new Date() >= token.expiresAt;
  };

  /**
   * Get time until token expires in milliseconds
   */
  const getTimeUntilExpiration = (token: AuthToken): number => {
    if (!token.expiresAt) {
      return Number.MAX_SAFE_INTEGER;
    }

    return Math.max(0, token.expiresAt.getTime() - Date.now());
  };

  /**
   * Get time until token needs refresh in milliseconds
   */
  const getTimeUntilRefresh = (token: AuthToken): number => {
    if (!token.expiresAt) {
      return Number.MAX_SAFE_INTEGER;
    }

    const refreshWindow = sdkConfig.tokens.refreshWindow;
    const refreshTime = new Date(token.expiresAt.getTime() - refreshWindow);

    return Math.max(0, refreshTime.getTime() - Date.now());
  };

  // Return the service interface
  return {
    shouldRefreshToken,
    isTokenValid,
    isTokenExpired,
    getTimeUntilExpiration,
    getTimeUntilRefresh,
  };
};

// Export the type for dependency injection
export type AuthDomainService = ReturnType<typeof createAuthDomainService>;
