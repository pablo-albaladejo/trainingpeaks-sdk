/**
 * Authentication Validation Service Implementation
 * Individual function implementations that receive dependencies as parameters
 */

import type {
  GetTimeUntilExpiration,
  GetTimeUntilRefresh,
  IsTokenExpired,
  IsTokenValid,
  ShouldRefreshToken,
  TokenValidationConfig,
} from '@/application/services/auth-validation';
import type { AuthToken } from '@/domain';

export const shouldRefreshToken: ShouldRefreshToken = (
  token: AuthToken,
  config?: TokenValidationConfig
): boolean => {
  if (!token.expiresAt) {
    return false;
  }

  const now = Date.now();
  const expiresAt = new Date(token.expiresAt).getTime();
  const timeUntilExpiration = expiresAt - now;

  // Refresh if token expires within 5 minutes (or configured threshold)
  const refreshThreshold = (config?.refreshThreshold || 5) * 60 * 1000;
  return timeUntilExpiration <= refreshThreshold;
};

export const isTokenValid: IsTokenValid = (
  token: AuthToken,
  config?: TokenValidationConfig
): boolean => {
  if (!token.expiresAt) {
    return true; // Non-expiring token
  }

  const now = Date.now();
  const expiresAt = new Date(token.expiresAt).getTime();
  const timeUntilExpiration = expiresAt - now;

  // Token is invalid if it's close to expiration (within 2 minutes by default)
  const validityThreshold = (config?.refreshThreshold || 2) * 60 * 1000;
  return timeUntilExpiration > validityThreshold;
};

export const isTokenExpired: IsTokenExpired = (
  token: AuthToken,
  config?: TokenValidationConfig
): boolean => {
  if (!token.expiresAt) {
    return false; // Non-expiring token
  }

  const now = Date.now();
  const expiresAt = new Date(token.expiresAt).getTime();
  const timeUntilExpiration = expiresAt - now;

  // Apply clock skew tolerance
  const clockSkew = (config?.clockSkew || 0) * 1000;
  return timeUntilExpiration <= clockSkew;
};

export const getTimeUntilExpiration: GetTimeUntilExpiration = (
  token: AuthToken
): number => {
  if (!token.expiresAt) {
    return Number.MAX_SAFE_INTEGER; // Never expires
  }

  const now = Date.now();
  const expiresAt = new Date(token.expiresAt).getTime();
  return Math.max(0, expiresAt - now);
};

export const getTimeUntilRefresh: GetTimeUntilRefresh = (
  token: AuthToken,
  config?: TokenValidationConfig
): number => {
  if (!token.expiresAt) {
    return Number.MAX_SAFE_INTEGER; // Never needs refresh
  }

  const now = Date.now();
  const expiresAt = new Date(token.expiresAt).getTime();
  const timeUntilExpiration = expiresAt - now;

  // Refresh threshold (5 minutes default)
  const refreshThreshold = (config?.refreshThreshold || 5) * 60 * 1000;
  return Math.max(0, timeUntilExpiration - refreshThreshold);
};
