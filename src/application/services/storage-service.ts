/**
 * Storage Port Types
 * Individual function types for storage operations
 */

import type { AuthToken, User } from '@/domain';

/**
 * Store authentication token
 */
export type StoreToken = (token: AuthToken) => Promise<void>;

/**
 * Retrieve stored authentication token
 */
export type GetToken = () => Promise<AuthToken | null>;

/**
 * Store user information
 */
export type StoreUser = (user: User) => Promise<void>;

/**
 * Retrieve stored user information
 */
export type GetUser = () => Promise<User | null>;

/**
 * Get user ID from stored data
 */
export type GetUserId = () => Promise<string | null>;

/**
 * Clear all stored authentication data
 */
export type ClearStorage = () => Promise<void>;

/**
 * Check if there is valid stored authentication
 */
export type HasValidAuth = () => Promise<boolean>;
