/**
 * TrainingPeaks Client Implementation
 * Main client that handles dependency injection and exposes use cases
 */

import { executeGetUserUseCase } from '@/application/use-cases/get-user';
import { executeLoginUserUseCase } from '@/application/use-cases/login-user';

import { createLogger } from '@/adapters/logging/logger';

import type { TrainingPeaksClientConfig } from '@/config';
import { getSDKConfig } from '@/config';
import { Credentials } from '@/domain';
import { createWebAuthAdapter } from '../browser/web-auth-adapter';
import { createHttpClient } from '../http/http-adapter';
import { createAuthService } from '../services';
import { createMemoryStorageAdapter } from '../storage/memory-storage-adapter';

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

  const httpClient = createHttpClient(
    {
      baseURL: sdkConfig.urls.apiBaseUrl,
      timeout: sdkConfig.timeouts.apiAuth,
    },
    logger
  );

  const authRepository = createWebAuthAdapter({
    timeout: sdkConfig.timeouts.webAuth,
    headless: sdkConfig.browser?.headless ?? true,
    executablePath: sdkConfig.browser?.executablePath ?? '',
  });

  const memoryStorageAdapter = createMemoryStorageAdapter();

  const authService = createAuthService(authRepository, memoryStorageAdapter);

  logger.info('🔧 TrainingPeaks Client initialized', {
    debug: sdkConfig.debug,
    timeouts: sdkConfig.timeouts,
    urls: sdkConfig.urls,
  });

  // Create use case instances with injected dependencies
  const loginUseCase = executeLoginUserUseCase(authService.loginUser);
  const getUserUseCase = executeGetUserUseCase(authService.getCurrentUser);

  // Return the client interface with all public methods
  return {
    /**
     * Login with username and password
     */
    login: async (credentials: Credentials) => {
      logger.info('🔐 Login attempt started', {
        username: credentials.username,
        passwordLength: credentials.password.length,
        debugAuth: sdkConfig.debug.logAuth,
      });

      try {
        const result = await loginUseCase(credentials);

        logger.info('📊 Login result received', {
          success: result.success,
          authToken: !!result.authToken,
          hasError: !!result.error,
        });

        if (result.success) {
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
      logger.info('👤 GetUser attempt started');

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
  };
};
