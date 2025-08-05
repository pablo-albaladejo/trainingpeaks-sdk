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
  expiresIn: number,
  expires: Date,
  refreshToken?: string
): AuthToken => ({
  accessToken,
  tokenType,
  expiresIn,
  expires,
  refreshToken,
});

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: AuthToken): boolean => {
  return new Date() > token.expires;
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
  newExpires: Date,
  newRefreshToken?: string
): AuthToken => ({
  ...token,
  accessToken: newAccessToken,
  expires: newExpires,
  refreshToken: newRefreshToken || token.refreshToken,
});

/**
 * Check if token needs refresh (expires in less than 5 minutes)
 */
export const shouldRefreshToken = (token: AuthToken): boolean => {
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  return token.expires <= fiveMinutesFromNow;
};

/**
 * Get remaining validity time in milliseconds
 */
export const getRemainingValidityTime = (token: AuthToken): number => {
  const now = new Date();
  const remaining = token.expires.getTime() - now.getTime();
  return Math.max(0, remaining);
};

/**
 * Check if token has refresh capability
 */
export const hasRefreshCapability = (token: AuthToken): boolean => {
  return Boolean(token.refreshToken);
};
