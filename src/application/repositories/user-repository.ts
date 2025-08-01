import type {
  AuthToken,
  Credentials,
  User,
  UserPreferences,
} from '@/domain/schemas';

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
    preferences: UserPreferences
  ): Promise<void>;

  /**
   * Get user settings
   */
  getUserSettings(token: AuthToken): Promise<UserPreferences>;
};
