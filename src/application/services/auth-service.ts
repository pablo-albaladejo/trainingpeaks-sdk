/**
 * Authentication Service Contracts
 * Individual function types for authentication services
 * Includes both internal service contracts and external adapter ports
 */

import type { AuthToken, Credentials, User } from '@/domain';

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export type AuthenticationConfig = {
  /** Base URL for authentication */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Whether to enable debug logging */
  debug?: boolean;
  /** Custom headers */
  headers?: Record<string, string>;
  /** Web authentication specific options */
  webAuth?: {
    headless?: boolean;
    timeout?: number;
    executablePath?: string;
  };
};

// ============================================================================
// INTERNAL AUTHENTICATION SERVICE CONTRACTS
// ============================================================================

/**
 * Login service contract - authenticates user and returns token + user
 */
export type LoginService = (
  credentials: Credentials
) => Promise<{ token: AuthToken; user: User }>;

/**
 * Get current user service contract - retrieves current authenticated user
 */
export type GetCurrentUserService = () => Promise<User | null>;

/**
 * Validate credentials service contract - validates credential format
 */
export type ValidateCredentialsService = (credentials: Credentials) => boolean;

/**
 * Validate token service contract - validates token format and expiration
 */
export type ValidateTokenService = (token: AuthToken) => boolean;

/**
 * Refresh token service contract - refreshes expired authentication token
 */
export type RefreshTokenService = (refreshToken: string) => Promise<AuthToken>;

/**
 * Check authentication status service contract - checks if user is authenticated
 */
export type IsAuthenticatedService = () => Promise<boolean>;

/**
 * Logout service contract - clears authentication data
 */
export type LogoutService = () => Promise<void>;

// ============================================================================
// EXTERNAL AUTHENTICATION ADAPTER PORTS
// ============================================================================

/**
 * Authenticate user and return auth token with user info
 * Port for external authentication adapters (API, Web, etc.)
 */
export type AuthenticateUser = (
  credentials: Credentials,
  config: AuthenticationConfig
) => Promise<{
  token: AuthToken;
  user: User;
}>;

/**
 * Refresh authentication token
 * Port for external authentication adapters that support token refresh
 */
export type RefreshAuthToken = (
  refreshToken: string,
  config: AuthenticationConfig
) => Promise<AuthToken>;

/**
 * Validate if adapter can handle the given configuration
 * Port for adapter capability detection
 */
export type CanHandleAuthConfig = (config: AuthenticationConfig) => boolean;
