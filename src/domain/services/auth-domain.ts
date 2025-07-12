/**
 * Authentication Domain Service
 * Contains domain logic for authentication operations
 */

import { AuthToken } from '../entities/auth-token';
import { Credentials } from '../value-objects/credentials';

export class AuthDomainService {
  /**
   * Validates if credentials are suitable for authentication
   */
  public static validateCredentialsForAuth(credentials: Credentials): void {
    // Domain rule: For TrainingPeaks, username should be email format
    if (!credentials.isValidEmailFormat()) {
      throw new Error('TrainingPeaks requires email format for username');
    }
  }

  /**
   * Determines if a token needs refresh based on domain rules
   */
  public static shouldRefreshToken(token: AuthToken): boolean {
    // Domain rule: Refresh if token expires in less than 5 minutes
    const fiveMinutesInMs = 5 * 60 * 1000;
    return !token.isValidFor(fiveMinutesInMs);
  }

  /**
   * Validates if a token is suitable for API requests
   */
  public static validateTokenForApiUse(token: AuthToken): void {
    if (token.isExpired()) {
      throw new Error('Token is expired and cannot be used for API requests');
    }

    // Domain rule: Token should be valid for at least 1 minute for API use
    const oneMinuteInMs = 60 * 1000;
    if (!token.isValidFor(oneMinuteInMs)) {
      throw new Error('Token expires too soon for reliable API use');
    }
  }

  /**
   * Determines if authentication session should be considered active
   */
  public static isSessionActive(token: AuthToken | null): boolean {
    if (!token) {
      return false;
    }

    return !token.isExpired();
  }

  /**
   * Calculates recommended token refresh time
   */
  public static calculateRefreshTime(token: AuthToken): number {
    // Domain rule: Refresh when 80% of token lifetime has passed
    const totalLifetime = token.expiresAtTimestamp - Date.now();
    const refreshAt = Date.now() + totalLifetime * 0.8;

    return Math.max(refreshAt, Date.now() + 60000); // At least 1 minute from now
  }
}
