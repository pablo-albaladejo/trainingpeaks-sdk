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
   * Login user
   */
  const loginUser = async (
    credentials: Credentials
  ): Promise<AuthToken | null> => {
    const authToken = await authRepository.authenticate(credentials);
    await storageRepository.set('auth_token', JSON.stringify(authToken));
    return authToken;
  };

  /**
   * Get current user
   */
  const getCurrentUser = async (): Promise<User | null> => {
    return await storageRepository.get<User>('user');
  };

  return {
    loginUser,
    getCurrentUser,
  };
};
