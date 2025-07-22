// AuthToken business logic
export type IsTokenExpired = (expiresAt: Date) => boolean;
export type IsTokenValidFor = (expiresAt: Date, durationMs: number) => boolean;
export type GetTimeUntilExpiry = (expiresAt: Date) => number;
export type GetAuthorizationHeader = (
  tokenType: string,
  accessToken: string
) => string;
export type EqualsAuthToken = (
  accessToken1: string,
  accessToken2: string
) => boolean;
