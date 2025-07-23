/**
 * TrainingPeaks Client Implementation
 * Main client that handles dependency injection and exposes use cases
 */

import { executeGetUserUseCase } from '@/application/use-cases/get-user';
import { executeLoginUseCase } from '@/application/use-cases/login';

import {
  apiAuthenticateUser,
  apiCanHandleAuthConfig,
  apiRefreshAuthToken,
  webAuthenticateUser,
  webCanHandleAuthConfig,
} from '@/adapters';
import { createAuthRepository } from '@/adapters/repositories/auth-repository';
import { createWorkoutRepository } from '@/adapters/repositories/workout-repository';
import { createAuthService } from '@/adapters/services/auth-service';
import {
  clearStorage,
  getToken,
  getUser,
  getUserId,
  hasValidAuth,
  storeToken,
  storeUser,
} from '@/adapters/storage/memory-storage-adapter';
import type { TrainingPeaksClientConfig } from '@/config';
import { getSDKConfig } from '@/config';

/**
 * TrainingPeaks Client Interface
 * Defines the public API of the client
 */
export interface TrainingPeaksClient {
  /**
   * Login with username and password
   */
  login: (username: string, password: string) => Promise<{
    success: boolean;
    user?: any;
    error?: string;
  }>;

  /**
   * Get current user information
   */
  getUser: () => Promise<{
    success: boolean;
    user?: any;
    error?: string;
  }>;

  /**
   * Check if client is authenticated
   */
  isAuthenticated: () => boolean;

  /**
   * Get user ID (if authenticated)
   */
  getUserId: () => string | null;
}

/**
 * Creates a new TrainingPeaks client instance
 * This is the main factory function that handles dependency injection
 */
export const createTrainingPeaksClient = (config: TrainingPeaksClientConfig = {}): TrainingPeaksClient => {
  // Get SDK configuration with client overrides
  const sdkConfig = getSDKConfig(config);

  // Create auth service
  const authService = createAuthService({
    authAdapters: [
      {
        canHandle: apiCanHandleAuthConfig,
        authenticate: apiAuthenticateUser,
        refresh: apiRefreshAuthToken,
      },
      {
        canHandle: webCanHandleAuthConfig,
        authenticate: webAuthenticateUser,
      },
    ],
    storage: {
      storeToken,
      getToken,
      storeUser,
      getUser,
      getUserId,
      hasValidAuth,
      clearStorage,
    },
  });

  // Initialize repositories
  const authRepository = createAuthRepository({
    storage: {
      storeToken,
      getToken,
      storeUser,
      getUser,
      hasValidAuth,
    },
    authService: {
      login: authService.login,
    },
  });

  const workoutRepository = createWorkoutRepository({
    getToken,
  });

  // State management
  let isAuthenticatedFlag = false;

  // Create login service wrapper to match expected signature
  const loginServiceWrapper = async (credentials: {
    username: string;
    password: string;
  }) => {
    return await authService.login(credentials, {
      baseUrl: sdkConfig.urls.apiBaseUrl,
      timeout: sdkConfig.timeouts.apiAuth,
    });
  };

  // Create use case instances with injected dependencies
  const loginUseCase = executeLoginUseCase(
    loginServiceWrapper,
    authService.getCurrentUser
  );

  const getUserUseCase = executeGetUserUseCase(
    authService.getCurrentUser
  );

  // Return the client interface with all public methods
  return {
    /**
     * Login with username and password
     */
    login: async (username: string, password: string) => {
      try {
        const result = await loginUseCase({
          credentials: { username, password },
        });

        if (result.success) {
          isAuthenticatedFlag = true;
        }

        return result;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },

    /**
     * Get current user information
     */
    getUser: async () => {
      try {
        return await getUserUseCase();
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },

    /**
     * Check if client is authenticated
     */
    isAuthenticated: () => isAuthenticatedFlag,

    /**
     * Get user ID (if authenticated)
     */
    getUserId: () => {
      if (!isAuthenticatedFlag) {
        return null;
      }
      // This would typically retrieve from storage
      return null;
    },
  };
}; 