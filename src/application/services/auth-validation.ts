/**
 * Authentication Validation Service Contract
 * Defines the interface for authentication validation operations
 */

import type { AuthToken } from '@/domain';

/**
 * Token validation configuration
 */
export type TokenValidationConfig = {
  refreshThreshold?: number; // Minutes before expiration to refresh
  clockSkew?: number; // Seconds to account for clock differences
};

/**
 * Contract for authentication validation operations
 * Defines what validation capabilities the system needs for authentication
 */

/**
 * Determine if token should be refreshed based on expiration time
 * @param token - The authentication token to check
 * @param config - Optional validation configuration
 * @returns Boolean indicating if token should be refreshed
 */
export type ShouldRefreshToken = (
  token: AuthToken,
  config?: TokenValidationConfig
) => boolean;

/**
 * Validate if token is still valid (not expired)
 * @param token - The authentication token to validate
 * @param config - Optional validation configuration
 * @returns Boolean indicating if token is valid
 */
export type IsTokenValid = (
  token: AuthToken,
  config?: TokenValidationConfig
) => boolean;

/**
 * Check if token is expired
 * @param token - The authentication token to check
 * @param config - Optional validation configuration
 * @returns Boolean indicating if token is expired
 */
export type IsTokenExpired = (
  token: AuthToken,
  config?: TokenValidationConfig
) => boolean;

/**
 * Get time until token expiration
 * @param token - The authentication token to check
 * @returns Number of milliseconds until expiration (negative if already expired)
 */
export type GetTimeUntilExpiration = (token: AuthToken) => number;

/**
 * Get time until token should be refreshed
 * @param token - The authentication token to check
 * @param config - Optional validation configuration
 * @returns Number of milliseconds until refresh is recommended
 */
export type GetTimeUntilRefresh = (
  token: AuthToken,
  config?: TokenValidationConfig
) => number;
