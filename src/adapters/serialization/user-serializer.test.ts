/**
 * User Serializer Tests
 * Tests for safe data transformation without type assertions
 */

import { describe, expect, it } from 'vitest';
import { createUser } from '../../domain/entities/user';
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
  type UserStorageData,
} from './user-serializer';

describe('User Serializer', () => {
  describe('serializeApiResponseToUser', () => {
    it('should serialize valid API response to User entity', () => {
      const apiResponse: UserApiResponse = {
        user: {
          userId: '123',
          username: 'testuser',
          name: 'Test User',
          preferences: { theme: 'dark' },
        },
      };

      const user = serializeApiResponseToUser(apiResponse);

      expect(user).toEqual({
        id: '123',
        name: 'Test User',
        avatar: undefined,
        preferences: { theme: 'dark' },
      });
    });

    it('should handle numeric userId', () => {
      const apiResponse: UserApiResponse = {
        user: {
          userId: 456,
          username: 'testuser',
          name: 'Test User',
        },
      };

      const user = serializeApiResponseToUser(apiResponse);

      expect(user.id).toBe('456');
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
      const user = createUser('123', 'Test User', 'avatar.jpg', {
        theme: 'light',
      });

      const storageData = serializeUserToStorage(user);

      expect(storageData).toEqual({
        id: '123',
        name: 'Test User',
        avatar: 'avatar.jpg',
        preferences: { theme: 'light' },
      });
    });
  });

  describe('deserializeStorageToUser', () => {
    it('should deserialize valid storage data to User entity', () => {
      const storageData: UserStorageData = {
        id: '123',
        name: 'Test User',
        avatar: 'avatar.jpg',
        preferences: { theme: 'dark' },
      };

      const result = deserializeStorageToUser(storageData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          id: '123',
          name: 'Test User',
          avatar: 'avatar.jpg',
          preferences: { theme: 'dark' },
        });
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
      const invalidData = {
        name: 'Test User',
        // missing id
      };

      const result = deserializeStorageToUser(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(MissingFieldError);
      }
    });

    it('should return error for invalid field types', () => {
      const invalidData = {
        id: 123, // should be string
        name: 'Test User',
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
      const jsonString = JSON.stringify({
        id: '123',
        name: 'Test User',
        avatar: 'avatar.jpg',
        preferences: { theme: 'light' },
      });

      const result = deserializeUserFromJson(jsonString);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          id: '123',
          name: 'Test User',
          avatar: 'avatar.jpg',
          preferences: { theme: 'light' },
        });
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
      const invalidJson = JSON.stringify({
        name: 'Test User',
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
