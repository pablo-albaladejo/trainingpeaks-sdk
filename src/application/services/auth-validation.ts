/**
 * Authentication Validation Service Contract
 * Defines the interface for authentication token validation and calculations
 */

import { AuthToken } from '@/domain/entities/auth-token';

/**
 * Contract for authentication validation operations
 * Defines what validation capabilities the system needs
 */

/**
 * Check if token needs refresh
 * Returns true if token will expire within the configured refresh window
 * @param token - The authentication token to check
 * @returns Boolean indicating if token should be refreshed
 */
export type shouldRefreshToken = (token: AuthToken) => boolean;

/**
 * Validate token is still valid
 * @param token - The authentication token to validate
 * @returns Boolean indicating if token is valid
 */
export type isTokenValid = (token: AuthToken) => boolean;

/**
 * Check if token is expired
 * @param token - The authentication token to check
 * @returns Boolean indicating if token is expired
 */
export type isTokenExpired = (token: AuthToken) => boolean;

/**
 * Get time until token expiration in milliseconds
 * @param token - The authentication token to check
 * @returns Number of milliseconds until expiration (0 if no expiration)
 */
export type getTimeUntilExpiration = (token: AuthToken) => number;

/**
 * Get time until token refresh in milliseconds
 * @param token - The authentication token to check
 * @returns Number of milliseconds until refresh should happen (0 if no expiration)
 */
export type getTimeUntilRefresh = (token: AuthToken) => number;

/**
 * Factory function signature for creating authentication validation service
 * This defines the contract for how the service should be instantiated
 */
export type AuthValidationServiceFactory = () => {
  shouldRefreshToken: shouldRefreshToken;
  isTokenValid: isTokenValid;
  isTokenExpired: isTokenExpired;
  getTimeUntilExpiration: getTimeUntilExpiration;
  getTimeUntilRefresh: getTimeUntilRefresh;
};
