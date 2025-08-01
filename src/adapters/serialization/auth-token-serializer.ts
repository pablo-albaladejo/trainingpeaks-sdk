/**
 * AuthToken Serializer
 * Handles safe transformation between different auth token data formats
 * This is an adapter implementation, not domain logic
 */

import type { AuthToken } from '@/domain/entities/auth-token';
import { createAuthToken } from '@/domain/entities/auth-token';
import type { AuthTokenStorageData } from '@/domain/schemas';
import {
  DeserializationError,
  InvalidDateError,
  InvalidTypeError,
  JsonParseError,
  MissingFieldError,
} from '../errors/serialization-errors';

// Result type for operations that can fail
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };


/**
 * Serialize AuthToken entity to storage format
 */
export const serializeAuthTokenToStorage = (
  token: AuthToken
): AuthTokenStorageData => {
  return {
    accessToken: token.accessToken,
    tokenType: token.tokenType,
    expiresAt: token.expiresAt.toISOString(),
    refreshToken: token.refreshToken,
  };
};

/**
 * Deserialize storage data to AuthToken entity
 */
export const deserializeStorageToAuthToken = (
  data: unknown
): Result<AuthToken, DeserializationError> => {
  if (!data || typeof data !== 'object') {
    return {
      success: false,
      error: new DeserializationError('Data must be a non-null object'),
    };
  }

  const storageData = data as AuthTokenStorageData;

  // Validate required fields
  if (!storageData.accessToken) {
    return {
      success: false,
      error: new MissingFieldError('accessToken'),
    };
  }

  if (typeof storageData.accessToken !== 'string') {
    return {
      success: false,
      error: new InvalidTypeError(
        'accessToken',
        'string',
        storageData.accessToken
      ),
    };
  }

  if (!storageData.tokenType) {
    return {
      success: false,
      error: new MissingFieldError('tokenType'),
    };
  }

  if (typeof storageData.tokenType !== 'string') {
    return {
      success: false,
      error: new InvalidTypeError('tokenType', 'string', storageData.tokenType),
    };
  }

  if (!storageData.expiresAt) {
    return {
      success: false,
      error: new MissingFieldError('expiresAt'),
    };
  }

  if (typeof storageData.expiresAt !== 'string') {
    return {
      success: false,
      error: new InvalidTypeError('expiresAt', 'string', storageData.expiresAt),
    };
  }

  // Parse and validate date
  const expiresAt = new Date(storageData.expiresAt);
  if (isNaN(expiresAt.getTime())) {
    return {
      success: false,
      error: new InvalidDateError('expiresAt', storageData.expiresAt),
    };
  }

  const authToken = createAuthToken(
    storageData.accessToken,
    storageData.tokenType,
    expiresAt,
    storageData.refreshToken
  );

  return { success: true, data: authToken };
};

/**
 * Safely deserialize auth token from JSON string
 */
export const deserializeAuthTokenFromJson = (
  jsonString: string
): Result<AuthToken, JsonParseError | DeserializationError> => {
  try {
    const parsed = JSON.parse(jsonString);
    return deserializeStorageToAuthToken(parsed);
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
