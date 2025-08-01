/**
 * Authentication Port Type
 * Defines contract for external authentication adapters
 */

import type { AuthToken, Credentials, User } from '@/domain';

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

export type AuthenticationPort = {
  /**
   * Authenticate user and return auth token
   */
  authenticate(
    credentials: Credentials,
    config: AuthenticationConfig
  ): Promise<{
    token: AuthToken;
    user: User;
  }>;

  /**
   * Refresh authentication token
   */
  refreshToken(
    refreshToken: string,
    config: AuthenticationConfig
  ): Promise<AuthToken>;

  /**
   * Validate if adapter can handle the given configuration
   */
  canHandle(config: AuthenticationConfig): boolean;
};
