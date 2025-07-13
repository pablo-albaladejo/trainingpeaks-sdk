/**
 * Authentication Domain Service
 * Contains business logic for authentication operations
 */

import { getSDKConfig } from '../../config';
import { AuthToken } from '../entities/auth-token';

export class AuthDomainService {
  private readonly sdkConfig = getSDKConfig();

  /**
   * Check if token needs refresh
   * Returns true if token will expire within the configured refresh window
   */
  public shouldRefreshToken(token: AuthToken): boolean {
    if (!token.expiresAt) {
      return false;
    }

    const now = new Date();
    const refreshWindow = this.sdkConfig.tokens.refreshWindow;
    const refreshTime = new Date(token.expiresAt.getTime() - refreshWindow);

    return now >= refreshTime;
  }

  /**
   * Validate token is still valid
   */
  public isTokenValid(token: AuthToken): boolean {
    if (!token.expiresAt) {
      return true; // Tokens without expiration are considered valid
    }

    const now = new Date();
    const validationWindow = this.sdkConfig.tokens.validationWindow;
    const validationTime = new Date(
      token.expiresAt.getTime() - validationWindow
    );

    return now < validationTime;
  }

  /**
   * Check if token is expired
   */
  public isTokenExpired(token: AuthToken): boolean {
    if (!token.expiresAt) {
      return false; // Tokens without expiration never expire
    }

    return new Date() >= token.expiresAt;
  }

  /**
   * Get time until token expires in milliseconds
   */
  public getTimeUntilExpiration(token: AuthToken): number {
    if (!token.expiresAt) {
      return Number.MAX_SAFE_INTEGER;
    }

    return Math.max(0, token.expiresAt.getTime() - Date.now());
  }

  /**
   * Get time until token needs refresh in milliseconds
   */
  public getTimeUntilRefresh(token: AuthToken): number {
    if (!token.expiresAt) {
      return Number.MAX_SAFE_INTEGER;
    }

    const refreshWindow = this.sdkConfig.tokens.refreshWindow;
    const refreshTime = new Date(token.expiresAt.getTime() - refreshWindow);

    return Math.max(0, refreshTime.getTime() - Date.now());
  }
}
