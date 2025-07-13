/**
 * Authentication Port Interface
 * Defines contract for external authentication adapters
 */

import { AuthToken } from '@/domain/entities/auth-token';
import { User } from '@/domain/entities/user';
import { Credentials } from '@/domain/value-objects/credentials';

export interface AuthenticationConfig {
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
}

export interface AuthenticationPort {
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
}
