/**
 * TrainingPeaks Client Implementation
 * Main client that handles dependency injection and exposes use cases
 */

import { executeGetUserUseCase } from '@/application/use-cases/get-user';
import { executeGetUserIdUseCase } from '@/application/use-cases/get-user-id';
import { executeIsAuthenticatedUseCase } from '@/application/use-cases/is-authenticated';
import { executeLoginUserUseCase } from '@/application/use-cases/login-user';

import { createLogger } from '@/adapters/logging/logger';
import type { TrainingPeaksClientConfig } from '@/config';
import { getSDKConfig } from '@/config';
import { Credentials } from '@/domain';
import { createHttpAuthAdapter, createWebHttpClient } from '../http/';
import { createAuthService } from '../services';
import { createMemoryStorageAdapter } from '../storage/memory-storage-adapter';
import { withClientErrorHandling } from './client-error-handler';

/**
 * TrainingPeaks Client Interface
 * Defines the public API of the client
 */
export type TrainingPeaksClient = ReturnType<typeof createTrainingPeaksClient>;

/**
 * Creates a new TrainingPeaks client instance
 * This is the main factory function that handles dependency injection
 */
export const createTrainingPeaksClient = (
  config: TrainingPeaksClientConfig = {}
) => {
  // Get SDK configuration with client overrides
  const sdkConfig = getSDKConfig(config);

  // Initialize logger based on debug configuration
  const logger = createLogger({
    level: sdkConfig.debug.enabled ? 'debug' : 'info',
    enabled: sdkConfig.debug.enabled,
  });

  const webHttpClient = createWebHttpClient(
    {
      timeout: sdkConfig.timeouts.webAuth,
    },
    logger
  );

  const authRepository = createHttpAuthAdapter(
    {
      loginUrl: sdkConfig.urls.loginUrl,
      tokenUrl: sdkConfig.urls.tokenUrl,
      userInfoUrl: sdkConfig.urls.userInfoUrl,
      authCookieName: sdkConfig.auth.cookieName,
    },
    webHttpClient,
    logger
  );

  const memoryStorageAdapter = createMemoryStorageAdapter();
  const authService = createAuthService(authRepository, memoryStorageAdapter);

  logger.info('🔧 TrainingPeaks Client initialized', {
    debug: sdkConfig.debug,
    timeouts: sdkConfig.timeouts,
    urls: sdkConfig.urls,
  });

  // Create use case instances with injected dependencies
  const loginUseCase = executeLoginUserUseCase(authService.authenticateUser);
  const getUserUseCase = executeGetUserUseCase(authService.getCurrentUser);
  const isAuthenticatedUseCase = executeIsAuthenticatedUseCase(
    authService.isAuthenticated
  );
  const getUserIdUseCase = executeGetUserIdUseCase(authService.getUserId);

  // Wrap use cases with client error handling middleware
  const loginWithErrorHandling = async (username: string, password: string) => {
    const result = await withClientErrorHandling(
      async () => {
        const credentials: Credentials = { username, password };
        return await loginUseCase(credentials);
      },
      'login',
      { username }
    );

    if (!result.success) {
      throw new Error(result.error || 'Login failed');
    }

    return result.data;
  };

  const getUserIdWithErrorHandling = async () => {
    return withClientErrorHandling(async () => {
      const result = await getUserIdUseCase();
      return result.data;
    }, 'getUserId');
  };

  const getUserWithErrorHandling = async () => {
    const result = await withClientErrorHandling(async () => {
      return await getUserUseCase();
    }, 'getUser');

    if (!result.success) {
      throw new Error(result.error || 'Failed to get user');
    }

    return result.data;
  };

  const isAuthenticatedWithErrorHandling = async () => {
    return withClientErrorHandling(async () => {
      const result = await isAuthenticatedUseCase();
      return result.data;
    }, 'isAuthenticated');
  };

  // Return the client interface with all public methods
  return {
    /**
     * Login with username and password
     */
    login: async (username: string, password: string) =>
      await loginWithErrorHandling(username, password),

    /**
     * Get current user information
     */
    getUser: async () => await getUserWithErrorHandling(),

    /**
     * Check if user is authenticated
     */
    isAuthenticated: async () => await isAuthenticatedWithErrorHandling(),

    /**
     * Get current user ID
     */
    getUserId: async () => await getUserIdWithErrorHandling(),
  };
};
