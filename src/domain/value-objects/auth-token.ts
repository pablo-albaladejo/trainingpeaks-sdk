/**
 * AuthToken Value Object
 * Represents authentication token data
 */

import type { AuthToken as AuthTokenType } from '@/domain/schemas/entities.schema';

export type AuthToken = AuthTokenType;

/**
 * Create auth token value object
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
 * Check if token is valid
 */
export const isTokenValid = (token: AuthToken): boolean => {
  return !isTokenExpired(token);
};
