/**
 * Authentication Service
 * Combines authentication and storage operations
 */

import type {
  AuthenticateUser,
  AuthenticationConfig,
  CanHandleAuthConfig,
  RefreshAuthToken,
} from '@/application/services/auth-service';
import type {
  ClearStorage,
  GetToken,
  GetUser,
  GetUserId,
  HasValidAuth,
  StoreToken,
  StoreUser,
} from '@/application/services/storage-service';
import type { AuthToken, Credentials, User } from '@/domain';

/**
 * Authentication service configuration
 */
export type AuthServiceConfig = {
  authAdapters: Array<{
    canHandle: CanHandleAuthConfig;
    authenticate: AuthenticateUser;
    refresh?: RefreshAuthToken;
  }>;
  storage: {
    storeToken: StoreToken;
    getToken: GetToken;
    storeUser: StoreUser;
    getUser: GetUser;
    getUserId: GetUserId;
    hasValidAuth: HasValidAuth;
    clearStorage: ClearStorage;
  };
};

/**
 * Create authentication service
 */
export const createAuthService = (config: AuthServiceConfig) => {
  /**
   * Login with credentials
   */
  const login = async (
    credentials: Credentials,
    authConfig: AuthenticationConfig
  ): Promise<{ token: AuthToken; user: User }> => {
    // Find appropriate auth adapter
    const adapter = config.authAdapters.find((a) => a.canHandle(authConfig));

    if (!adapter) {
      throw new Error(
        'No authentication adapter found for the given configuration'
      );
    }

    // Authenticate user
    const { token, user } = await adapter.authenticate(credentials, authConfig);

    // Store authentication data
    await config.storage.storeToken(token);
    await config.storage.storeUser(user);

    return { token, user };
  };

  /**
   * Refresh authentication token
   */
  const refreshToken = async (
    authConfig: AuthenticationConfig
  ): Promise<AuthToken> => {
    const currentToken = await config.storage.getToken();
    if (!currentToken?.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Find appropriate auth adapter with refresh capability
    const adapter = config.authAdapters.find(
      (a) => a.canHandle(authConfig) && a.refresh
    );

    if (!adapter?.refresh) {
      throw new Error(
        'No authentication adapter with refresh capability found'
      );
    }

    // Refresh token
    const newToken = await adapter.refresh(
      currentToken.refreshToken,
      authConfig
    );

    // Store new token
    await config.storage.storeToken(newToken);

    return newToken;
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
   * Logout user
   */
  const logout = async (): Promise<void> => {
    await config.storage.clearStorage();
  };

  return {
    login,
    refreshToken,
    getCurrentUser,
    isAuthenticated,
    logout,
  };
};
