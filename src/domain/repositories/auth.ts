/**
 * Authentication Repository Interface
 * Defines the contract for authentication operations
 */

import { AuthToken } from '@/domain/entities/auth-token';
import { User } from '@/domain/entities/user';
import { Credentials } from '@/domain/value-objects/credentials';

export interface AuthRepository {
  /**
   * Authenticate user with credentials
   */
  authenticate(credentials: Credentials): Promise<AuthToken>;

  /**
   * Get current authenticated user
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Refresh authentication token
   */
  refreshToken(refreshToken: string): Promise<AuthToken>;

  /**
   * Check if currently authenticated
   */
  isAuthenticated(): boolean;

  /**
   * Get current authentication token
   */
  getCurrentToken(): AuthToken | null;

  /**
   * Store authentication token
   */
  storeToken(token: AuthToken): Promise<void>;

  /**
   * Store user information
   */
  storeUser(user: User): Promise<void>;

  /**
   * Clear authentication data
   */
  clearAuth(): Promise<void>;

  /**
   * Get user ID from stored authentication
   */
  getUserId(): string | null;
}
