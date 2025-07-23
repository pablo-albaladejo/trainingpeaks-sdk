/**
 * Authentication Repository Implementation
 * Implements the auth repository interface from domain layer
 */

import type { AuthenticationConfig } from '@/application/services/auth-service';
import type {
  GetToken,
  GetUser,
  HasValidAuth,
  StoreToken,
  StoreUser,
} from '@/application/services/storage-service';
import type { AuthToken, Credentials, User } from '@/domain';
import type { AuthRepository } from '@/domain/repositories/auth-repository';

/**
 * Auth repository configuration
 */
export type AuthRepositoryConfig = {
  storage: {
    storeToken: StoreToken;
    getToken: GetToken;
    storeUser: StoreUser;
    getUser: GetUser;
    hasValidAuth: HasValidAuth;
  };
  authService: {
    login: (
      credentials: Credentials,
      config: AuthenticationConfig
    ) => Promise<{ token: AuthToken; user: User }>;
  };
};

/**
 * Create authentication repository
 */
export const createAuthRepository = (
  config: AuthRepositoryConfig
): AuthRepository => {
  /**
   * Authenticate user with credentials
   */
  const authenticate = async (credentials: Credentials): Promise<AuthToken> => {
    const authResult = await config.authService.login(credentials, {
      baseUrl: 'https://api.trainingpeaks.com',
      timeout: 30000,
    });
    return authResult.token;
  };

  /**
   * Get current authentication token
   */
  const getCurrentToken = async (): Promise<AuthToken | null> => {
    return await config.storage.getToken();
  };

  /**
   * Get current user
   */
  const getCurrentUser = async (): Promise<User | null> => {
    return await config.storage.getUser();
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = async (): Promise<boolean> => {
    return await config.storage.hasValidAuth();
  };

  /**
   * Store authentication token
   */
  const storeToken = async (token: AuthToken): Promise<void> => {
    await config.storage.storeToken(token);
  };

  /**
   * Store user information
   */
  const storeUser = async (user: User): Promise<void> => {
    await config.storage.storeUser(user);
  };

  return {
    authenticate,
    getCurrentUser,
  };
};
