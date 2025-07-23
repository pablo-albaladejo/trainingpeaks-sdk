/**
 * User Entity
 * Core business entity for user management
 */

import type { User as UserType } from '@/domain/schemas/entities.schema';

export type User = UserType;

/**
 * Create a new User instance
 */
export const createUser = (
  id: string,
  name: string,
  avatar?: string,
  preferences?: Record<string, unknown>
): User => ({
  id,
  name,
  avatar,
  preferences,
});

/**
 * Update user name
 */
export const updateUserName = (user: User, newName: string): User => ({
  ...user,
  name: newName,
});

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
