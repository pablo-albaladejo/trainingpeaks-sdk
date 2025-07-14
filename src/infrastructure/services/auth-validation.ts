/**
 * Authentication Validation Service Implementation
 * Implements the AuthValidationService contract with business logic for token validation
 */

import type {
  AuthValidationService,
  AuthValidationServiceFactory,
} from '@/application/services/auth-validation';
import { getSDKConfig } from '@/config';
import { AuthToken } from '@/domain/entities/auth-token';

/**
 * IMPLEMENTATION of AuthValidationService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createAuthValidationService: AuthValidationServiceFactory =
  (): AuthValidationService => {
    const sdkConfig = getSDKConfig();

    return {
      shouldRefreshToken: (token: AuthToken): boolean => {
        if (!token.expiresAt) {
          return false;
        }

        const now = new Date();
        const refreshWindow = sdkConfig.tokens.refreshWindow;
        const refreshTime = new Date(token.expiresAt.getTime() - refreshWindow);

        return now >= refreshTime;
      },

      isTokenValid: (token: AuthToken): boolean => {
        if (!token.expiresAt) {
          return true; // Tokens without expiration are considered valid
        }

        const now = new Date();
        const validationWindow = sdkConfig.tokens.validationWindow;
        const validationTime = new Date(
          token.expiresAt.getTime() - validationWindow
        );

        return now < validationTime;
      },

      isTokenExpired: (token: AuthToken): boolean => {
        if (!token.expiresAt) {
          return false; // Tokens without expiration never expire
        }

        return new Date() >= token.expiresAt;
      },

      getTimeUntilExpiration: (token: AuthToken): number => {
        if (!token.expiresAt) {
          return Number.MAX_SAFE_INTEGER;
        }

        return Math.max(0, token.expiresAt.getTime() - Date.now());
      },

      getTimeUntilRefresh: (token: AuthToken): number => {
        if (!token.expiresAt) {
          return Number.MAX_SAFE_INTEGER;
        }

        const refreshWindow = sdkConfig.tokens.refreshWindow;
        const refreshTime = new Date(token.expiresAt.getTime() - refreshWindow);

        return Math.max(0, refreshTime.getTime() - Date.now());
      },
    };
  };
