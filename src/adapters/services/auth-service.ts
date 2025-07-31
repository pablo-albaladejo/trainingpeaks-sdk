/**
 * Authentication Service
 * Combines authentication and storage operations
 */

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

    await storageRepository.set('auth_token', authToken);
    await storageRepository.set('user', user);

    return { token: authToken, user };
  };

  /**
   * Get current user from storage
   */
  const getCurrentUser = async (): Promise<User | null> => {
    return await storageRepository.get<User>('user');
  };

  /**
   * Get current auth token from storage
   */
  const getCurrentToken = async (): Promise<AuthToken | null> => {
    return await storageRepository.get<AuthToken>('auth_token');
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = async (): Promise<boolean> => {
    const token = await storageRepository.get<AuthToken>('auth_token');
    const user = await storageRepository.get<User>('user');
    return !!(token && user);
  };

  /**
   * Get current user ID
   */
  const getUserId = async (): Promise<string | null> => {
    const user = await storageRepository.get<User>('user');
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
