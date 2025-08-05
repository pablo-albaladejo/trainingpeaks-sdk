/**
 * User Entity
 * Core business entity for user management
 */

import { ValidationError } from '@/domain/errors/domain-errors';
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
    throw new ValidationError('User ID cannot be empty', 'id');
  }

  if (!name || name.trim().length === 0) {
    throw new ValidationError('User name cannot be empty', 'name');
  }

  if (name.trim().length > 100) {
    throw new ValidationError('User name cannot exceed 100 characters', 'name');
  }

  if (avatar && !isValidUrl(avatar)) {
    throw new ValidationError('Avatar must be a valid URL', 'avatar');
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
    throw new ValidationError('User name cannot be empty', 'name');
  }

  if (newName.trim().length > 100) {
    throw new ValidationError('User name cannot exceed 100 characters', 'name');
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
    throw new ValidationError('Avatar must be a valid URL', 'avatar');
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
