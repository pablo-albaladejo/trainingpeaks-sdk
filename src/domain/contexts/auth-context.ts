/**
 * Authentication Context Interface
 * Centralized authentication state management
 */

import type { AuthToken } from '../entities/auth-token';

/**
 * Authentication context that manages token lifecycle
 * Provides centralized access to authentication state across the application
 */
export interface AuthContext {
  /**
   * Get current auth token, auto-refreshing if expired
   */
  getToken(): Promise<AuthToken | null>;

  /**
   * Store auth token in persistent storage
   */
  setToken(token: AuthToken): Promise<void>;

  /**
   * Clear auth token from storage (logout)
   */
  clearToken(): Promise<void>;

  /**
   * Refresh expired token and update storage
   */
  refreshToken(): Promise<AuthToken>;

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Get current user ID if authenticated
   */
  getUserId(): Promise<string | null>;
}