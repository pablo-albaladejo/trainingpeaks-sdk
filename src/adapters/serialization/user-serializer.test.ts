/**
 * User Serializer Tests
 * Tests for safe data transformation without type assertions
 */

import { describe, expect, it } from 'vitest';
import {
  userBuilder,
  userStorageDataBuilder,
} from '../../__fixtures__/auth.fixture';
import { ValidationError } from '../../domain/errors/domain-errors';
import {
  DeserializationError,
  InvalidTypeError,
  JsonParseError,
  MissingFieldError,
} from '../errors/serialization-errors';
import {
  deserializeStorageToUser,
  deserializeUserFromJson,
  serializeApiResponseToUser,
  serializeUserToStorage,
  type UserApiResponse,
} from './user-serializer';

describe('User Serializer', () => {
  describe('serializeApiResponseToUser', () => {
    it('should serialize valid API response to User entity', () => {
      const user = userBuilder.build();

      const apiResponse: UserApiResponse = {
        user: {
          userId: user.id,
          username: user.username,
          name: user.name,
          preferences: user.preferences,
        },
      };

      const result = serializeApiResponseToUser(apiResponse);

      expect(result).toEqual({
        id: user.id,
        name: user.name,
        avatar: undefined,
        preferences: user.preferences,
      });
    });

    it('should handle numeric userId', () => {
      const user = userBuilder.build();

      const apiResponse: UserApiResponse = {
        user: {
          userId: 456,
          username: user.username,
          name: user.name,
        },
      };

      const result = serializeApiResponseToUser(apiResponse);

      expect(result.id).toBe('456');
    });

    it('should throw ValidationError for missing userId', () => {
      const apiResponse = {
        user: {
          username: 'testuser',
          name: 'Test User',
        },
      } as UserApiResponse;

      expect(() => serializeApiResponseToUser(apiResponse)).toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for missing name', () => {
      const apiResponse = {
        user: {
          userId: '123',
          username: 'testuser',
          name: '',
        },
      } as UserApiResponse;

      expect(() => serializeApiResponseToUser(apiResponse)).toThrow(
        ValidationError
      );
    });
  });

  describe('serializeUserToStorage', () => {
    it('should serialize User entity to storage format', () => {
      const user = userBuilder.build();

      const storageData = serializeUserToStorage(user);

      expect(storageData).toEqual({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        preferences: user.preferences,
      });
    });
  });

  describe('deserializeStorageToUser', () => {
    it('should deserialize valid storage data to User entity', () => {
      const user = userBuilder.build();
      const storageData = userStorageDataBuilder.build({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        preferences: user.preferences,
      });

      const result = deserializeStorageToUser(storageData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(user);
      }
    });

    it('should return error for invalid data', () => {
      const result1 = deserializeStorageToUser(null);
      expect(result1.success).toBe(false);
      if (!result1.success) {
        expect(result1.error).toBeInstanceOf(DeserializationError);
      }

      const result2 = deserializeStorageToUser(undefined);
      expect(result2.success).toBe(false);
      if (!result2.success) {
        expect(result2.error).toBeInstanceOf(DeserializationError);
      }

      const result3 = deserializeStorageToUser('invalid');
      expect(result3.success).toBe(false);
      if (!result3.success) {
        expect(result3.error).toBeInstanceOf(DeserializationError);
      }
    });

    it('should return error for missing required fields', () => {
      const user = userBuilder.build();
      const invalidData = {
        name: user.name,
        // missing id
      };

      const result = deserializeStorageToUser(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(MissingFieldError);
      }
    });

    it('should return error for invalid field types', () => {
      const user = userBuilder.build();
      const invalidData = {
        id: 123, // should be string
        name: user.name,
      };

      const result = deserializeStorageToUser(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidTypeError);
      }
    });
  });

  describe('deserializeUserFromJson', () => {
    it('should deserialize valid JSON string', () => {
      const user = userBuilder.build({
        avatar: 'avatar.jpg',
      });

      const jsonString = JSON.stringify({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        preferences: user.preferences,
      });

      const result = deserializeUserFromJson(jsonString);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(user);
      }
    });

    it('should return error for invalid JSON', () => {
      const result = deserializeUserFromJson('invalid json');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(JsonParseError);
      }
    });

    it('should return error for JSON with invalid data', () => {
      const user = userBuilder.build();
      const invalidJson = JSON.stringify({
        name: user.name,
        // missing id
      });

      const result = deserializeUserFromJson(invalidJson);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(MissingFieldError);
      }
    });
  });
});
