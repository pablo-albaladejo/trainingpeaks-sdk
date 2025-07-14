/**
 * TrainingPeaks Authentication Repository Implementation
 * Connects domain layer with infrastructure adapters
 */

import {
  AuthenticationConfig,
  AuthenticationPort,
  StoragePort,
} from '@/application';
import { AuthRepository } from '@/application/ports/auth';
import { AuthToken, Credentials, User } from '@/domain';

/**
 * TrainingPeaks Authentication Repository Factory
 * Creates a TrainingPeaks authentication repository with dependency injection
 */
export const createTrainingPeaksAuthRepository = (
  storageAdapter: StoragePort,
  config: AuthenticationConfig
) => {
  const authAdapters: AuthenticationPort[] = [];
  let cachedToken: AuthToken | null = null;
  let cachedUser: User | null = null;

  /**
   * Initialize cache from storage
   */
  const initializeCache = async (): Promise<void> => {
    try {
      cachedToken = await storageAdapter.getToken();
      cachedUser = await storageAdapter.getUser();
    } catch {
      // Ignore errors during initialization
      cachedToken = null;
      cachedUser = null;
    }
  };

  /**
   * Get a compatible authentication adapter for the current configuration
   */
  const getCompatibleAdapter = (): AuthenticationPort => {
    const compatibleAdapter = authAdapters.find((adapter) =>
      adapter.canHandle(config)
    );

    if (!compatibleAdapter) {
      throw new Error(
        'No compatible authentication adapter found for the current configuration'
      );
    }

    return compatibleAdapter;
  };

  /**
   * Register an authentication adapter
   */
  const registerAuthAdapter = (adapter: AuthenticationPort): void => {
    authAdapters.push(adapter);
  };

  /**
   * Authenticate user with credentials
   */
  const authenticate = async (credentials: Credentials): Promise<AuthToken> => {
    const adapter = getCompatibleAdapter();

    const { token, user } = await adapter.authenticate(credentials, config);

    // Store the authentication data
    await storageAdapter.storeToken(token);
    await storageAdapter.storeUser(user);

    // Update cache
    cachedToken = token;
    cachedUser = user;

    return token;
  };

  /**
   * Get current authenticated user
   */
  const getCurrentUser = async (): Promise<User | null> => {
    return await storageAdapter.getUser();
  };

  /**
   * Refresh authentication token
   */
  const refreshToken = async (refreshToken: string): Promise<AuthToken> => {
    const adapter = getCompatibleAdapter();

    const newToken = await adapter.refreshToken(refreshToken, config);

    // Store the new token
    await storageAdapter.storeToken(newToken);

    // Update cache
    cachedToken = newToken;

    return newToken;
  };

  /**
   * Check if currently authenticated
   */
  const isAuthenticated = (): boolean => {
    return cachedToken !== null && !cachedToken.isExpired();
  };

  /**
   * Get current authentication token
   */
  const getCurrentToken = (): AuthToken | null => {
    if (cachedToken && cachedToken.isExpired()) {
      cachedToken = null;
      storageAdapter.clear(); // Clear expired token from storage
    }
    return cachedToken;
  };

  /**
   * Store authentication token
   */
  const storeToken = async (token: AuthToken): Promise<void> => {
    await storageAdapter.storeToken(token);
    cachedToken = token;
  };

  /**
   * Store user information
   */
  const storeUser = async (user: User): Promise<void> => {
    await storageAdapter.storeUser(user);
    cachedUser = user;
  };

  /**
   * Clear authentication data
   */
  const clearAuth = async (): Promise<void> => {
    await storageAdapter.clear();
    cachedToken = null;
    cachedUser = null;
  };

  /**
   * Get user ID from stored authentication
   */
  const getUserId = (): string | null => {
    return cachedUser?.id || null;
  };

  // Initialize cache on creation
  initializeCache();

  // Return the repository interface and register function
  const repository: AuthRepository = {
    authenticate,
    getCurrentUser,
    refreshToken,
    isAuthenticated,
    getCurrentToken,
    storeToken,
    storeUser,
    clearAuth,
    getUserId,
  };

  return {
    repository,
    registerAuthAdapter,
  };
};

// Export the type for dependency injection
export type TrainingPeaksAuthRepository = ReturnType<
  typeof createTrainingPeaksAuthRepository
>;
