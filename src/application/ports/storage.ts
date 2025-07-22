/**
 * Storage Port Type
 * Defines contract for storing authentication data
 */

import type { AuthToken, User } from '@/domain';

export type StoragePort = {
  /**
   * Store authentication token
   */
  storeToken(token: AuthToken): Promise<void>;

  /**
   * Retrieve stored authentication token
   */
  getToken(): Promise<AuthToken | null>;

  /**
   * Store user information
   */
  storeUser(user: User): Promise<void>;

  /**
   * Retrieve stored user information
   */
  getUser(): Promise<User | null>;

  /**
   * Get user ID from stored data
   */
  getUserId(): Promise<string | null>;

  /**
   * Clear all stored authentication data
   */
  clear(): Promise<void>;

  /**
   * Check if there is valid stored authentication
   */
  hasValidAuth(): Promise<boolean>;
};
