/**
 * TrainingPeaks Authentication Repository Implementation
 * Handles authentication with TrainingPeaks using multiple adapters
 */

import type { AuthRepository } from '@/application/ports/auth';
import type { StoragePort } from '@/application/ports/storage';
import { getSDKConfig } from '@/config';
import type { AuthToken, Credentials, User } from '@/domain';
import { SDKError } from '@/domain/errors';
import { ApiAuthAdapter } from '@/infrastructure/auth/api-adapter';
import { WebBrowserAuthAdapter } from '@/infrastructure/browser/web-auth-adapter';
import { logError, logInfo, logWarn } from '@/infrastructure/services/logger';

const authLogger = {
  info: logInfo(),
  error: logError(),
  warn: logWarn(),
};

export const createTrainingPeaksAuthRepository = (
  storageAdapter: StoragePort
): AuthRepository => {
  // Cache for synchronous operations
  let cachedToken: AuthToken | null = null;
  let cachedUser: User | null = null;
  let cacheValid = false;

  // Update cache from storage
  const updateCache = async (): Promise<void> => {
    try {
      cachedToken = await storageAdapter.getToken();
      cachedUser = await storageAdapter.getUser();
      cacheValid = true;
    } catch (error) {
      authLogger.error('Failed to update cache from storage', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      cacheValid = false;
    }
  };

  // Initialize cache
  updateCache().catch(() => {
    // Silent fail on initialization
  });
  const authenticate = async (credentials: Credentials): Promise<AuthToken> => {
    try {
      authLogger.info('Starting authentication process', {
        username: credentials.username,
      });

      const sdkConfig = getSDKConfig();
      const apiAuthAdapter = new ApiAuthAdapter();
      const webAuthAdapter = new WebBrowserAuthAdapter();

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

      // Store authentication data using storage adapter
      await storageAdapter.storeToken(authResult.token);
      await storageAdapter.storeUser(authResult.user);

      // Update cache
      cachedToken = authResult.token;
      cachedUser = authResult.user;
      cacheValid = true;

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
    return await storageAdapter.getUser();
  };

  const clearAuth = async (): Promise<void> => {
    await storageAdapter.clear();
    cachedToken = null;
    cachedUser = null;
    cacheValid = false;
  };

  const refreshToken = async (refreshToken: string): Promise<AuthToken> => {
    try {
      authLogger.info('Starting token refresh process');

      const sdkConfig = getSDKConfig();
      const apiAuthAdapter = new ApiAuthAdapter();

      const authConfig = {
        baseUrl: sdkConfig.urls.baseUrl,
        timeout: sdkConfig.timeouts.apiAuth,
        debug: sdkConfig.debug.logAuth,
        headers: sdkConfig.requests.defaultHeaders,
      };

      if (!apiAuthAdapter.canHandle(authConfig)) {
        throw SDKError.fileError(
          'AUTH_1006',
          'API authentication adapter not available for token refresh',
          { operation: 'refreshToken' }
        );
      }

      const newToken = await apiAuthAdapter.refreshToken(
        refreshToken,
        authConfig
      );

      // Store the new token
      await storageAdapter.storeToken(newToken);
      cachedToken = newToken;
      cacheValid = true;

      authLogger.info('Token refresh successful', {
        tokenExpiresAt: newToken.expiresAt,
      });

      return newToken;
    } catch (error) {
      authLogger.error('Token refresh failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });

      if (error instanceof SDKError) {
        throw error;
      }

      throw SDKError.authFailed(
        'Token refresh process failed',
        { operation: 'refreshToken' },
        error instanceof Error ? error : undefined
      );
    }
  };

  const isAuthenticated = (): boolean => {
    if (!cachedToken || !cacheValid) {
      return false;
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(cachedToken.expiresAt);

    if (now >= expiresAt) {
      authLogger.warn('Token is expired', {
        tokenExpiresAt: cachedToken.expiresAt,
        currentTime: now.toISOString(),
      });
      return false;
    }

    return true;
  };

  const getCurrentToken = (): AuthToken | null => {
    return cacheValid ? cachedToken : null;
  };

  const getUserId = (): string | null => {
    return cacheValid && cachedUser ? cachedUser.id : null;
  };

  const storeToken = async (token: AuthToken): Promise<void> => {
    await storageAdapter.storeToken(token);
    cachedToken = token;
    cacheValid = true;
  };

  const storeUser = async (user: User): Promise<void> => {
    await storageAdapter.storeUser(user);
    cachedUser = user;
    cacheValid = true;
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
