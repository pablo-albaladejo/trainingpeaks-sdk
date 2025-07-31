import type { AuthToken, Credentials, User } from '@/domain';

/**
 * Repository types for user-related operations
 */
export type UserRepository = {
  /**
   * Authenticate user with credentials
   */
  authenticate(
    credentials: Credentials
  ): Promise<{ token: AuthToken; user: User }>;

  /**
   * Get user information using authentication token
   */
  getUserInfo(token: AuthToken): Promise<User>;

  /**
   * Refresh authentication token
   */
  refreshToken(refreshToken: string): Promise<AuthToken>;

  /**
   * Update user preferences
   */
  updatePreferences(
    token: AuthToken,
    preferences: Record<string, unknown>
  ): Promise<void>;

  /**
   * Get user settings
   */
  getUserSettings(token: AuthToken): Promise<Record<string, unknown>>;
};
