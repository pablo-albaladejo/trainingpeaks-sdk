/**
 * TrainingPeaks SDK Implementation
 * Unified SDK with centralized authentication management
 */

import { createInMemorySessionStorage, createLogger } from '@/adapters';
import { createHttpClient } from '@/adapters/http';
import {
  createAuthRepository,
  createTrainingPeaksRepository,
  createWorkoutRepository,
} from '@/adapters/public-api';
import { getSDKConfig, type TrainingPeaksClientConfig } from '@/config';
import { getWorkoutsListEntrypoint,loginEntrypoint, logoutEntrypoint } from '@/entrypoints';

/**
 * Creates a new TrainingPeaks SDK instance with unified authentication
 */
export const createTrainingPeaksSdk = (
  config: TrainingPeaksClientConfig = {}
) => {
  // Get SDK configuration with client overrides
  const sdkConfig = getSDKConfig(config);

  // Create logger
  const logger = createLogger({
    level: sdkConfig.debug.level,
    enabled: sdkConfig.debug.enabled,
  });
  logger.info('TrainingPeaks SDK initialized', { config });

  const httpClient = createHttpClient({
    enableCookies: true,
    logger,
  });

  const sessionStorage = createInMemorySessionStorage();

  const authRepository = createAuthRepository({
    httpClient,
    sessionStorage,
    logger,
  });

  const workoutRepository = createWorkoutRepository({
    httpClient,
    logger,
  });

  const tpRepository = createTrainingPeaksRepository({
    authRepository,
    workoutRepository,
  });

  // Return the SDK interface with entrypoint-based methods
  return {
    /**
     * Login with username and password
     */
    login: loginEntrypoint({ tpRepository, logger }),

    /**
     * Clear authentication (logout)
     */
    logout: logoutEntrypoint({ tpRepository, logger }),

    /**
     * Get workouts list for athlete between dates
     */
    getWorkoutsList: getWorkoutsListEntrypoint({ tpRepository, sessionStorage, logger }),

    /**
     * Logger
     */
    logger,
  };
};

export type TrainingPeaksSdk = ReturnType<typeof createTrainingPeaksSdk>;
