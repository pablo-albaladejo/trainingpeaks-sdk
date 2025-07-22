import type {
  EqualsAuthToken,
  GetAuthorizationHeader,
  GetTimeUntilExpiry,
  IsTokenExpired,
  IsTokenValidFor,
} from '@/application/services/auth-business-logic';

// AuthToken business logic implementations
export const isTokenExpired: IsTokenExpired = (expiresAt: Date): boolean => {
  return new Date() >= expiresAt;
};

export const isTokenValidFor: IsTokenValidFor = (
  expiresAt: Date,
  durationMs: number
): boolean => {
  const requiredTime = new Date(Date.now() + durationMs);
  return requiredTime <= expiresAt;
};

export const getTimeUntilExpiry: GetTimeUntilExpiry = (
  expiresAt: Date
): number => {
  return Math.max(0, expiresAt.getTime() - Date.now());
};

export const getAuthorizationHeader: GetAuthorizationHeader = (
  tokenType: string,
  accessToken: string
): string => {
  return `${tokenType} ${accessToken}`;
};

export const equalsAuthToken: EqualsAuthToken = (
  accessToken1: string,
  accessToken2: string
): boolean => {
  return accessToken1 === accessToken2;
};
