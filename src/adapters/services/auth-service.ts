/**
 * Authentication Service
 * Combines authentication and storage operations
 */

import { STORAGE_KEYS } from '@/adapters/constants';
import type {
  StorageRepository,
  UserRepository,
} from '@/application/repositories';
import { AuthToken, Credentials, User } from '@/domain';

/**
 * Create authentication service
 */
export const createAuthService = (
  userRepository: UserRepository,
  storageRepository: StorageRepository
) => {
  /**
   * Authenticate user and return both token and user
   */
  const authenticateUser = async (
    credentials: Credentials
  ): Promise<{ token: AuthToken; user: User }> => {
    const result = await userRepository.authenticate(credentials);
    const { token: authToken, user } = result;

    await storageRepository.set(STORAGE_KEYS.AUTH_TOKEN, authToken);
    await storageRepository.set(STORAGE_KEYS.USER, user);

    return { token: authToken, user };
  };

  /**
   * Get current user from storage
   */
  const getCurrentUser = async (): Promise<User | null> => {
    return await storageRepository.get<User>(STORAGE_KEYS.USER);
  };

  /**
   * Get current auth token from storage
   */
  const getCurrentToken = async (): Promise<AuthToken | null> => {
    return await storageRepository.get<AuthToken>(STORAGE_KEYS.AUTH_TOKEN);
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = async (): Promise<boolean> => {
    const token = await storageRepository.get<AuthToken>(
      STORAGE_KEYS.AUTH_TOKEN
    );
    const user = await storageRepository.get<User>(STORAGE_KEYS.USER);
    return !!(token && user);
  };

  /**
   * Get current user ID
   */
  const getUserId = async (): Promise<string | null> => {
    const user = await storageRepository.get<User>(STORAGE_KEYS.USER);
    return user?.id || null;
  };

  return {
    authenticateUser,
    getCurrentUser,
    getCurrentToken,
    isAuthenticated,
    getUserId,
  };
};
