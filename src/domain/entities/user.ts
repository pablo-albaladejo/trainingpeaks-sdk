/**
 * User Entity
 * Core business entity for user management
 */

import type { User as UserType } from '@/domain/schemas/entities.schema';

export type User = UserType;

/**
 * Create a new User entity with domain invariants
 */
export const createUser = (
  id: string,
  name: string,
  avatar?: string,
  preferences?: Record<string, unknown>
): User => {
  // Validate invariants
  if (!id || id.trim().length === 0) {
    throw new Error('User ID cannot be empty');
  }
  
  if (!name || name.trim().length === 0) {
    throw new Error('User name cannot be empty');
  }
  
  if (name.trim().length > 100) {
    throw new Error('User name cannot exceed 100 characters');
  }
  
  if (avatar && !isValidUrl(avatar)) {
    throw new Error('Avatar must be a valid URL');
  }
  
  return {
    id: id.trim(),
    name: name.trim(),
    avatar,
    preferences,
  };
};

/**
 * Update user name with validation
 */
export const updateUserName = (user: User, newName: string): User => {
  if (!newName || newName.trim().length === 0) {
    throw new Error('User name cannot be empty');
  }
  
  if (newName.trim().length > 100) {
    throw new Error('User name cannot exceed 100 characters');
  }
  
  return {
    ...user,
    name: newName.trim(),
  };
};

/**
 * Update user preferences
 */
export const updateUserPreferences = (
  user: User,
  preferences: Record<string, unknown>
): User => ({
  ...user,
  preferences,
});

/**
 * Update user avatar with validation
 */
export const updateUserAvatar = (user: User, avatar?: string): User => {
  if (avatar && !isValidUrl(avatar)) {
    throw new Error('Avatar must be a valid URL');
  }
  
  return {
    ...user,
    avatar,
  };
};

/**
 * Check if user has specific preference
 */
export const hasUserPreference = (user: User, key: string): boolean => {
  return user.preferences ? key in user.preferences : false;
};

/**
 * Get user preference value
 */
export const getUserPreference = <T>(
  user: User,
  key: string,
  defaultValue?: T
): T | undefined => {
  if (!user.preferences || !(key in user.preferences)) {
    return defaultValue;
  }
  return user.preferences[key] as T;
};

/**
 * Helper function to validate URL format
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
