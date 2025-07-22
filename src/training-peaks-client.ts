/**
 * TrainingPeaks Client
 * Main client for interacting with TrainingPeaks services
 */

import type { StoragePort } from '@/application/ports/storage';
import { getSDKConfig, type TrainingPeaksClientConfig } from '@/config';
import { AuthenticationError } from '@/domain/errors';
import { authLogger } from '@/infrastructure/logging/logger';
import { createTrainingPeaksAuthRepository } from '@/infrastructure/repositories/training-peaks-auth';
import { createCredentials } from '@/infrastructure/services/domain-factories';
import { InMemoryStorageAdapter } from '@/infrastructure/storage/in-memory-adapter';
import { createWorkoutManager } from './workout-manager';

/**
 * Main TrainingPeaks client
 */
export class TrainingPeaksClient {
  readonly sdkConfig: ReturnType<typeof getSDKConfig>;
  readonly workoutManager: ReturnType<typeof createWorkoutManager>;
  readonly authRepository: ReturnType<typeof createTrainingPeaksAuthRepository>;

  constructor(
    config: TrainingPeaksClientConfig = {},
    storageAdapter?: StoragePort
  ) {
    // Get SDK configuration with client overrides
    this.sdkConfig = getSDKConfig(config);

    // Use provided storage adapter or default to in-memory
    const storage = storageAdapter || new InMemoryStorageAdapter();

    // Initialize real authentication repository with storage adapter
    this.authRepository = createTrainingPeaksAuthRepository(storage);

    // Initialize workout manager with the same configuration
    this.workoutManager = createWorkoutManager(config);
  }

  /**
   * Login with username and password
   */
  async login(username: string, password: string) {
    try {
      authLogger.info('Starting client authentication', {
        username,
        authMethod: this.sdkConfig.browser.headless ? 'web' : 'api',
      });

      // Validate credentials
      if (
        !username ||
        !password ||
        username.trim().length === 0 ||
        password.trim().length === 0
      ) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Create credentials value object
      const credentials = createCredentials(username, password);

      // Authenticate using real repository
      const token = await this.authRepository.authenticate(credentials);
      const user = await this.authRepository.getCurrentUser();

      if (!user) {
        throw new AuthenticationError(
          'Failed to retrieve user information after authentication'
        );
      }

      authLogger.info('Client authentication successful', {
        userId: user.id,
        username: user.name,
      });

      return {
        success: true,
        user: {
          id: user.id,
          username: user.name, // User entity has 'name' property
          email: `${username}@example.com`, // Generate email from username
        },
        token: {
          accessToken: token.accessToken,
          expiresAt: token.expiresAt,
        },
      };
    } catch (error) {
      authLogger.error('Client authentication failed', {
        username,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      authLogger.info('Starting client logout');

      await this.authRepository.clearAuth();

      authLogger.info('Client logout successful');

      return { success: true };
    } catch (error) {
      authLogger.error('Client logout failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const user = await this.authRepository.getCurrentUser();

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.name,
        email: `${user.name}@example.com`,
      };
    } catch (error) {
      authLogger.error('Failed to get current user', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.authRepository.isAuthenticated();
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.authRepository.getUserId();
  }

  /**
   * Get workout manager
   */
  getWorkoutManager() {
    return this.workoutManager;
  }

  /**
   * Get configuration
   */
  getConfig() {
    return this.sdkConfig;
  }
}

/**
 * Create TrainingPeaks Client with persistent storage
 * Uses file system to store authentication data between sessions
 *
 * Note: This is a placeholder for future implementation.
 * Currently, the client uses in-memory storage only.
 * To implement persistent storage, the client architecture needs to be updated.
 */
export const createTrainingPeaksClientWithPersistentStorage = (
  config: TrainingPeaksClientConfig = {}
) => {
  // For now, return the regular client
  // TODO: Implement persistent storage integration
  return new TrainingPeaksClient(config);
};
