/**
 * Auth Repository Interface
 * Contract for authentication operations
 */

import type { AuthToken, Credentials, User } from '@/domain';

export type AuthRepository = {
  /**
   * Authenticate user with credentials
   */
  authenticate(credentials: Credentials): Promise<AuthToken>;

  /**
   * Get current authenticated user
   */
  getCurrentUser(): Promise<User | null>;
};
