/**
 * Authentication Application Service Contract
 * Defines the interface for authentication orchestration operations
 */

import { LoginRequest, LoginResponse } from '@/application/use-cases/login';
import { AuthToken, User } from '@/domain';

/**
 * Contract for authentication application operations
 * Defines what authentication capabilities the system needs
 */

/**
 * Authenticate user with credentials
 * @param request - The login request containing credentials
 * @returns Promise resolving to login response
 */
export type login = (request: LoginRequest) => Promise<LoginResponse>;

/**
 * Logout current user
 * @returns Promise resolving when logout is complete
 */
export type logout = () => Promise<void>;

/**
 * Get current authenticated user
 * @returns Promise resolving to current user
 */
export type getCurrentUser = () => Promise<User>;

/**
 * Check if user is currently authenticated
 * @returns Boolean indicating if user is authenticated
 */
export type isAuthenticated = () => boolean;

/**
 * Get current authentication token
 * @returns Current auth token or null if not authenticated
 */
export type getCurrentToken = () => AuthToken | null;

/**
 * Get current user ID
 * @returns Current user ID or null if not authenticated
 */
export type getUserId = () => string | null;

/**
 * Factory function signature for creating authentication application service
 * This defines the contract for how the service should be instantiated
 */
export type AuthApplicationServiceFactory = (authRepository: unknown) => {
  login: login;
  logout: logout;
  getCurrentUser: getCurrentUser;
  isAuthenticated: isAuthenticated;
  getCurrentToken: getCurrentToken;
  getUserId: getUserId;
};
