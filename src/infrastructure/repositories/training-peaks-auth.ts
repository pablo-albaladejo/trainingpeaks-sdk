/**
 * TrainingPeaks Authentication Repository Implementation
 * Handles authentication with TrainingPeaks using multiple adapters
 */

import type { AuthRepository } from '@/application/ports/auth';
import { getSDKConfig } from '@/config';
import type { AuthToken } from '@/domain/entities/auth-token';
import type { User } from '@/domain/entities/user';
import { SDKError } from '@/domain/errors';
import type { Credentials } from '@/domain/value-objects/credentials';
import { ApiAuthAdapter } from '@/infrastructure/auth/api-adapter';
import { WebBrowserAuthAdapter } from '@/infrastructure/browser/web-auth-adapter';
import { logError, logInfo, logWarn } from '@/infrastructure/services/logger';
import { InMemoryStorageAdapter } from '@/infrastructure/storage/in-memory-adapter';

const authLogger = {
  info: logInfo(),
  error: logError(),
  warn: logWarn(),
};

export const createTrainingPeaksAuthRepository = (): AuthRepository => {
  let currentUser: User | null = null;
  let currentToken: AuthToken | null = null;

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

  const authenticate = async (credentials: Credentials): Promise<AuthToken> => {
    try {
      authLogger.info('Starting authentication process', {
        username: credentials.username,
      });

      const sdkConfig = getSDKConfig();
      const apiAuthAdapter = new ApiAuthAdapter();
      const webAuthAdapter = new WebBrowserAuthAdapter();
      const storageAdapter = new InMemoryStorageAdapter();

      const authConfig = {
        baseUrl: sdkConfig.urls.baseUrl,
        timeout: sdkConfig.timeouts.apiAuth,
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
        throw SDKError.fileError(
          'AUTH_1005',
          'No suitable authentication adapter found',
          { operation: 'authenticate', username: credentials.username }
        );
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

      if (error instanceof SDKError) {
        throw error;
      }

      throw SDKError.authFailed(
        'Authentication process failed',
        {
          operation: 'authenticate',
          username: credentials.username,
        },
        error instanceof Error ? error : undefined
      );
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

      const sdkConfig = getSDKConfig();
      const apiAuthAdapter = new ApiAuthAdapter();

      const authConfig = {
        baseUrl: sdkConfig.urls.baseUrl,
        timeout: sdkConfig.timeouts.apiAuth,
        debug: sdkConfig.debug.logAuth,
        headers: sdkConfig.requests.defaultHeaders,
        webAuth: {
          headless: sdkConfig.browser.headless,
          timeout: sdkConfig.timeouts.webAuth,
          executablePath: sdkConfig.browser.executablePath,
        },
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
        throw SDKError.fileError(
          'AUTH_1009',
          'Token refresh not supported for web authentication',
          { operation: 'refreshToken' }
        );
      }
    } catch (error) {
      authLogger.error('Token refresh failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });

      if (error instanceof SDKError) {
        throw error;
      }

      throw SDKError.fileError(
        'AUTH_1004',
        'Token refresh failed',
        { operation: 'refreshToken' },
        error instanceof Error ? error : undefined
      );
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
    authLogger.info('Storing user information');
    setCurrentUser(user);
  };

  return {
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
};
