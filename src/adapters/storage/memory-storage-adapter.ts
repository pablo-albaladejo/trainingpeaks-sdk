/**
 * In-Memory Storage Adapter
 * Implements storage operations using in-memory storage
 */

import type {
  ClearStorage,
  GetToken,
  GetUser,
  GetUserId,
  HasValidAuth,
  StoreToken,
  StoreUser,
} from '@/application/services/storage-service';
import type { AuthToken, User } from '@/domain';
import { isTokenExpired } from '@/domain/value-objects/auth-token';

// In-memory storage
let storedToken: AuthToken | null = null;
let storedUser: User | null = null;

/**
 * Store authentication token in memory
 */
export const storeToken: StoreToken = async (
  token: AuthToken
): Promise<void> => {
  storedToken = token;
};

/**
 * Retrieve stored authentication token
 */
export const getToken: GetToken = async (): Promise<AuthToken | null> => {
  return storedToken;
};

/**
 * Store user information in memory
 */
export const storeUser: StoreUser = async (user: User): Promise<void> => {
  storedUser = user;
};

/**
 * Retrieve stored user information
 */
export const getUser: GetUser = async (): Promise<User | null> => {
  return storedUser;
};

/**
 * Get user ID from stored data
 */
export const getUserId: GetUserId = async (): Promise<string | null> => {
  return storedUser?.id || null;
};

/**
 * Clear all stored authentication data
 */
export const clearStorage: ClearStorage = async (): Promise<void> => {
  storedToken = null;
  storedUser = null;
};

/**
 * Check if there is valid stored authentication
 */
export const hasValidAuth: HasValidAuth = async (): Promise<boolean> => {
  if (!storedToken) {
    return false;
  }

  return !isTokenExpired(storedToken);
};
