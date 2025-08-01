/**
 * AuthToken Entity
 * Core business entity for authentication token management
 */

import type { AuthToken as AuthTokenType } from '@/domain/schemas/entities.schema';

export type AuthToken = AuthTokenType;

/**
 * Create a new AuthToken entity
 */
export const createAuthToken = (
  accessToken: string,
  tokenType: string,
  expiresAt: Date,
  refreshToken?: string
): AuthToken => ({
  accessToken,
  tokenType,
  expiresAt,
  refreshToken,
});

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: AuthToken): boolean => {
  return new Date() > token.expiresAt;
};

/**
 * Check if token is valid (not expired)
 */
export const isTokenValid = (token: AuthToken): boolean => {
  return !isTokenExpired(token);
};

/**
 * Refresh token with new expiration time
 */
export const refreshAuthToken = (
  token: AuthToken,
  newAccessToken: string,
  newExpiresAt: Date,
  newRefreshToken?: string
): AuthToken => ({
  ...token,
  accessToken: newAccessToken,
  expiresAt: newExpiresAt,
  refreshToken: newRefreshToken || token.refreshToken,
});

/**
 * Check if token needs refresh (expires in less than 5 minutes)
 */
export const shouldRefreshToken = (token: AuthToken): boolean => {
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  return token.expiresAt <= fiveMinutesFromNow;
};

/**
 * Get remaining validity time in milliseconds
 */
export const getRemainingValidityTime = (token: AuthToken): number => {
  const now = new Date();
  const remaining = token.expiresAt.getTime() - now.getTime();
  return Math.max(0, remaining);
};

/**
 * Check if token has refresh capability
 */
export const hasRefreshCapability = (token: AuthToken): boolean => {
  return Boolean(token.refreshToken);
};