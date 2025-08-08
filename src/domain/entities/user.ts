/**
 * User Entity
 * Core business entity for user management
 */

import { ValidationError } from '@/domain/errors/domain-errors';
import type { User as UserType } from '@/domain/schemas/entities.schema';

export type User = UserType;

/**
 * Map field names to consistent error keys (normalized lookup)
 */
const FIELD_KEY_MAP: Record<string, string> = {
  'user id': 'id',
  'user name': 'name',
  'username': 'username',
};

/**
 * Create a new User entity with domain invariants
 */
export const createUser = (
  id: string,
  name: string,
  username: string,
  avatar?: string,
  preferences?: Record<string, unknown>
): User => {
  // Validate invariants
  validateStringField(id, 'User ID');
  validateStringField(name, 'User name');
  validateStringField(username, 'Username');

  if (avatar) {
    validateAvatarUrl(avatar);
  }

  return {
    id: id.trim(),
    name: name.trim(),
    username: username.trim(),
    avatar,
    preferences,
  };
};

/**
 * Update user name with validation
 */
export const updateUserName = (user: User, newName: string): User => {
  validateStringField(newName, 'User name');

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
  if (avatar) {
    validateAvatarUrl(avatar);
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
 * Helper function to validate string fields
 */
const validateStringField = (
  value: string,
  fieldName: string,
  maxLength: number = 100
): void => {
  // Normalize field name for case-insensitive lookup
  const normalizedFieldName = fieldName.trim().toLowerCase();
  const fieldKey = FIELD_KEY_MAP[normalizedFieldName] || normalizedFieldName;

  const trimmed = value?.trim() || '';
  
  if (trimmed.length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`, fieldKey);
  }

  if (trimmed.length > maxLength) {
    throw new ValidationError(
      `${fieldName} cannot exceed ${maxLength} characters`,
      fieldKey
    );
  }
};

/**
 * Helper function to validate avatar URL
 */
const validateAvatarUrl = (avatar: string): void => {
  if (!isValidUrl(avatar)) {
    throw new ValidationError('Avatar must be a valid URL', 'avatar');
  }
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
