/**
 * Authentication Constants
 * Centralized definition of authentication-related constants used across the application
 */

export const AUTH_CONSTANTS = {
  DEFAULT_AUTH_COOKIE: 'Production_tpAuth',
} as const;

export type AuthConstant = typeof AUTH_CONSTANTS[keyof typeof AUTH_CONSTANTS]; 