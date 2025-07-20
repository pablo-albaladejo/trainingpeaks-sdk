/**
 * TrainingPeaks Authentication Repository
 * Handles authentication operations with TrainingPeaks API using real authentication adapters
 */

import { type AuthRepository } from '@/application';
import { getSDKConfig } from '@/config';
import { AuthToken } from '@/domain/entities/auth-token';
import { User } from '@/domain/entities/user';
import { Credentials } from '@/domain/value-objects/credentials';
import { ApiAuthAdapter } from '@/infrastructure/auth/api-adapter';
import { WebBrowserAuthAdapter } from '@/infrastructure/browser/web-auth-adapter';
import { authLogger } from '@/infrastructure/logging/logger';

/**
 * Current authentication state
 */
let currentUser: User | null = null;
let currentToken: AuthToken | null = null;

/**
 * TrainingPeaks Authentication Repository
 * Implements the AuthRepository interface for TrainingPeaks authentication
 * Uses real authentication adapters (Web Browser or API) instead of mock data
 */
export const createTrainingPeaksAuthRepository = (): AuthRepository => {
  const sdkConfig = getSDKConfig();

  // Initialize authentication adapters
  const webAuthAdapter = new WebBrowserAuthAdapter();
  const apiAuthAdapter = new ApiAuthAdapter();

  // Helper methods
  const setCurrentUser = (user: User | null): void => {
    currentUser = user;
  };

  const setCurrentToken = (token: AuthToken | null): void => {
    currentToken = token;
  };

  const clearCurrentState = (): void => {
    currentUser = null;
    currentToken = null;
  };

  // Repository implementation
  const authenticate = async (credentials: Credentials): Promise<AuthToken> => {
    try {
      authLogger.info('Starting authentication process', {
        username: credentials.username,
        method: 'real',
      });

      // Determine which authentication method to use
      const authConfig = {
        baseUrl: sdkConfig.urls.baseUrl,
        timeout: sdkConfig.timeouts.webAuth,
        debug: sdkConfig.debug.logAuth,
        headers: sdkConfig.requests.defaultHeaders,
        webAuth: {
          headless: sdkConfig.browser.headless,
          timeout: sdkConfig.timeouts.webAuth,
          executablePath: sdkConfig.browser.executablePath,
        },
      };

      let authResult: { token: AuthToken; user: User };

      // Try web authentication first (more reliable for TrainingPeaks)
      if (webAuthAdapter.canHandle(authConfig)) {
        authLogger.info('Using web browser authentication');
        authResult = await webAuthAdapter.authenticate(credentials, authConfig);
      } else if (apiAuthAdapter.canHandle(authConfig)) {
        authLogger.info('Using API authentication');
        authResult = await apiAuthAdapter.authenticate(credentials, authConfig);
      } else {
        throw new Error('No suitable authentication adapter found');
      }

      // Store authentication data
      setCurrentToken(authResult.token);
      setCurrentUser(authResult.user);

      authLogger.info('Authentication successful', {
        userId: authResult.user.id,
        tokenExpiresAt: authResult.token.expiresAt,
      });

      return authResult.token;
    } catch (error) {
      authLogger.error('Authentication failed', {
        username: credentials.username,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });
      throw error;
    }
  };

  const getCurrentUser = async (): Promise<User | null> => {
    return currentUser;
  };

  const clearAuth = async (): Promise<void> => {
    authLogger.info('Clearing authentication state');
    clearCurrentState();
  };

  const refreshToken = async (refreshToken: string): Promise<AuthToken> => {
    try {
      authLogger.info('Refreshing authentication token');

      const authConfig = {
        baseUrl: sdkConfig.urls.baseUrl,
        timeout: sdkConfig.timeouts.apiAuth,
        debug: sdkConfig.debug.logAuth,
        headers: sdkConfig.requests.defaultHeaders,
      };

      // Try API refresh first (more efficient)
      if (apiAuthAdapter.canHandle(authConfig)) {
        const newToken = await apiAuthAdapter.refreshToken(
          refreshToken,
          authConfig
        );
        setCurrentToken(newToken);
        authLogger.info('Token refreshed successfully via API');
        return newToken;
      } else {
        // Fallback to web authentication if API is not available
        throw new Error('Token refresh not supported for web authentication');
      }
    } catch (error) {
      authLogger.error('Token refresh failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });
      throw error;
    }
  };

  const isAuthenticated = (): boolean => {
    if (!currentToken) {
      return false;
    }

    // Check if token is expired
    if (currentToken.expiresAt < new Date()) {
      authLogger.warn('Token has expired, clearing authentication state');
      clearCurrentState();
      return false;
    }

    return true;
  };

  const getCurrentToken = (): AuthToken | null => {
    return currentToken;
  };

  const getUserId = (): string | null => {
    return currentUser?.id || null;
  };

  const storeToken = async (token: AuthToken): Promise<void> => {
    authLogger.info('Storing authentication token');
    setCurrentToken(token);
  };

  const storeUser = async (user: User): Promise<void> => {
    authLogger.info('Storing user information', { userId: user.id });
    setCurrentUser(user);
  };

  const repository: AuthRepository = {
    authenticate,
    getCurrentUser,
    clearAuth,
    refreshToken,
    isAuthenticated,
    getCurrentToken,
    getUserId,
    storeToken,
    storeUser,
  };

  return repository;
};
