/**
 * Authentication Application Service Contract
 * Defines the interface for authentication operations across the application
 */

import type { AuthToken, Credentials, User } from '@/domain';

/**
 * Standard authentication request with credentials
 */
export type LoginRequest = {
  credentials: Credentials;
};

/**
 * Authentication response with token and user data
 */
export type LoginResponse = {
  token: AuthToken;
  user: User;
};

/**
 * Contract for authentication operations
 * Defines what authentication capabilities the system needs
 */

/**
 * Authenticate user with credentials
 * @param request - Login request with credentials
 * @returns Promise resolving to authentication response
 */
export type Login = (request: LoginRequest) => Promise<LoginResponse>;

/**
 * End user session
 * @returns Promise resolving when logout is complete
 */
export type Logout = () => Promise<void>;

/**
 * Get current authenticated user
 * @returns Promise resolving to current user or null if not authenticated
 */
export type GetCurrentUser = () => Promise<User | null>;

/**
 * Check if user is currently authenticated
 * @returns Boolean indicating authentication status
 */
export type IsAuthenticated = () => boolean;

/**
 * Get current authentication token
 * @returns Current auth token or null if not authenticated
 */
export type GetCurrentToken = () => AuthToken | null;

/**
 * Get current user ID
 * @returns Current user ID or null if not authenticated
 */
export type GetUserId = () => string | null;
