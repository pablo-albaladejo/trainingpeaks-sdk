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
  createLogger,
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
  login: (
    username: string,
    password: string
  ) => Promise<{
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
export const createTrainingPeaksClient = (
  config: TrainingPeaksClientConfig = {}
): TrainingPeaksClient => {
  // Get SDK configuration with client overrides
  const sdkConfig = getSDKConfig(config);

  // Initialize logger based on debug configuration
  const logger = createLogger({
    level: sdkConfig.debug.enabled ? 'debug' : 'info',
    enabled: sdkConfig.debug.enabled,
  });

  logger.info('🔧 TrainingPeaks Client initialized', {
    debug: sdkConfig.debug,
    timeouts: sdkConfig.timeouts,
    urls: sdkConfig.urls,
  });
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

  const getUserUseCase = executeGetUserUseCase(authService.getCurrentUser);

  // Return the client interface with all public methods
  return {
    /**
     * Login with username and password
     */
    login: async (username: string, password: string) => {
      logger.info('🔐 Login attempt started', {
        username: username,
        passwordLength: password?.length || 0,
        debugAuth: sdkConfig.debug.logAuth,
      });

      try {
        const result = await loginUseCase({
          credentials: { username, password },
        });

        logger.info('📊 Login result received', {
          success: result.success,
          hasUser: !!result.user,
          hasError: !!result.error,
        });

        if (result.success) {
          isAuthenticatedFlag = true;
          logger.info(
            '✅ Authentication successful - user is now authenticated'
          );
        } else {
          logger.warn('❌ Authentication failed', {
            error: result.error,
          });
        }

        return result;
      } catch (error) {
        logger.error('💥 Login error occurred', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },

    /**
     * Get current user information
     */
    getUser: async () => {
      logger.info('👤 GetUser attempt started', {
        isAuthenticated: isAuthenticatedFlag,
      });

      try {
        const result = await getUserUseCase();

        logger.info('📊 GetUser result received', {
          success: result.success,
          hasUser: !!result.user,
          hasError: !!result.error,
        });

        return result;
      } catch (error) {
        logger.error('💥 GetUser error occurred', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },

    /**
     * Check if client is authenticated
     */
    isAuthenticated: () => {
      logger.debug('🔍 Checking authentication status', {
        isAuthenticated: isAuthenticatedFlag,
      });
      return isAuthenticatedFlag;
    },

    /**
     * Get user ID (if authenticated)
     */
    getUserId: () => {
      logger.debug('🆔 Getting user ID', {
        isAuthenticated: isAuthenticatedFlag,
      });

      if (!isAuthenticatedFlag) {
        logger.debug('🆔 User not authenticated, returning null');
        return null;
      }

      // This would typically retrieve from storage
      const userId = null;

      logger.debug('🆔 User ID result', {
        userId: userId,
      });

      return userId;
    },
  };
};
