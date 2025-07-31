/**
 * User Serializer
 * Handles safe transformation between different user data formats
 * This is an adapter implementation, not domain logic
 */

import type { User } from '@/domain/entities/user';
import { createUser } from '@/domain/entities/user';
import { ValidationError } from '@/domain/errors/domain-errors';
import {
  DeserializationError,
  InvalidTypeError,
  JsonParseError,
  MissingFieldError,
} from '../errors/serialization-errors';

// Result type for operations that can fail
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export interface UserApiResponse {
  user: {
    userId: string | number;
    username: string;
    name: string;
    preferences?: Record<string, unknown>;
  };
}

export interface UserStorageData {
  id: string;
  name: string;
  avatar?: string;
  preferences?: Record<string, unknown>;
}

/**
 * Serialize API response to User entity
 */
export const serializeApiResponseToUser = (response: UserApiResponse): User => {
  const { user } = response;

  if (!user.userId) {
    throw new ValidationError('User ID is required', 'userId');
  }

  if (!user.name) {
    throw new ValidationError('User name is required', 'name');
  }

  return createUser(
    String(user.userId),
    user.name,
    undefined, // avatar
    user.preferences
  );
};

/**
 * Serialize User entity to storage format
 */
export const serializeUserToStorage = (user: User): UserStorageData => {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    preferences: user.preferences,
  };
};

/**
 * Deserialize storage data to User entity
 */
export const deserializeStorageToUser = (
  data: unknown
): Result<User, DeserializationError> => {
  if (!data || typeof data !== 'object') {
    return {
      success: false,
      error: new DeserializationError('Data must be a non-null object'),
    };
  }

  const storageData = data as UserStorageData;

  // Validate required fields
  if (!storageData.id) {
    return {
      success: false,
      error: new MissingFieldError('id'),
    };
  }

  if (typeof storageData.id !== 'string') {
    return {
      success: false,
      error: new InvalidTypeError('id', 'string', storageData.id),
    };
  }

  if (!storageData.name) {
    return {
      success: false,
      error: new MissingFieldError('name'),
    };
  }

  if (typeof storageData.name !== 'string') {
    return {
      success: false,
      error: new InvalidTypeError('name', 'string', storageData.name),
    };
  }

  const user = createUser(
    storageData.id,
    storageData.name,
    storageData.avatar,
    storageData.preferences
  );

  return { success: true, data: user };
};

/**
 * Safely deserialize user from JSON string
 */
export const deserializeUserFromJson = (
  jsonString: string
): Result<User, JsonParseError | DeserializationError> => {
  try {
    const parsed = JSON.parse(jsonString);
    return deserializeStorageToUser(parsed);
  } catch (error) {
    return {
      success: false,
      error: new JsonParseError(
        'Failed to parse JSON string',
        error instanceof Error ? error : new Error('Unknown JSON parse error'),
        jsonString
      ),
    };
  }
};
