/**
 * Authentication Service
 * Combines authentication and storage operations
 */

import { AuthToken, Credentials, User } from '@/domain';
import { AuthRepository } from '@/domain/repositories/auth-repository';
import { StorageRepository } from '@/domain/repositories/storage-repository';

/**
 * Create authentication service
 */
export const createAuthService = (
  authRepository: AuthRepository,
  storageRepository: StorageRepository
) => {
  /**
   * Login user and store both token and user data
   */
  const loginUser = async (
    credentials: Credentials
  ): Promise<AuthToken | null> => {
    const authToken = await authRepository.authenticate(credentials);
    await storageRepository.set('auth_token', authToken);
    return authToken;
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

  return {
    loginUser,
    getCurrentUser,
    getCurrentToken,
  };
};
