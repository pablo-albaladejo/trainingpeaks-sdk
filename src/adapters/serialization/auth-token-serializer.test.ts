/**
 * AuthToken Serializer Tests
 * Tests for safe data transformation without type assertions
 */

import { describe, expect, it } from 'vitest';
import { authTokenBuilder } from '../../__fixtures__/auth.fixture';
import {
  DeserializationError,
  InvalidDateError,
  InvalidTypeError,
  JsonParseError,
  MissingFieldError,
} from '../errors/serialization-errors';
import {
  deserializeAuthTokenFromJson,
  deserializeStorageToAuthToken,
  serializeAuthTokenToStorage,
  type AuthTokenStorageData,
} from './auth-token-serializer';

describe('AuthToken Serializer', () => {
  describe('serializeAuthTokenToStorage', () => {
    it('should serialize AuthToken entity to storage format', () => {
      const token = authTokenBuilder.build();

      const storageData = serializeAuthTokenToStorage(token);

      expect(storageData).toEqual({
        accessToken: token.accessToken,
        tokenType: token.tokenType,
        expiresAt: token.expiresAt.toISOString(),
        refreshToken: token.refreshToken,
      });
    });

    it('should handle token without refresh token', () => {
      const token = authTokenBuilder.build({
        refreshToken: undefined,
      });

      const storageData = serializeAuthTokenToStorage(token);

      expect(storageData).toEqual({
        accessToken: token.accessToken,
        tokenType: token.tokenType,
        expiresAt: token.expiresAt.toISOString(),
        refreshToken: undefined,
      });
    });
  });

  describe('deserializeStorageToAuthToken', () => {
    it('should deserialize valid storage data to AuthToken entity', () => {
      const token = authTokenBuilder.build();

      const storageData: AuthTokenStorageData = {
        accessToken: token.accessToken,
        tokenType: token.tokenType,
        expiresAt: token.expiresAt.toISOString(),
        refreshToken: token.refreshToken,
      };

      const result = deserializeStorageToAuthToken(storageData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(token);
      }
    });

    it('should return error for invalid data', () => {
      const result1 = deserializeStorageToAuthToken(null);
      expect(result1.success).toBe(false);
      if (!result1.success) {
        expect(result1.error).toBeInstanceOf(DeserializationError);
      }

      const result2 = deserializeStorageToAuthToken(undefined);
      expect(result2.success).toBe(false);
      if (!result2.success) {
        expect(result2.error).toBeInstanceOf(DeserializationError);
      }

      const result3 = deserializeStorageToAuthToken('invalid');
      expect(result3.success).toBe(false);
      if (!result3.success) {
        expect(result3.error).toBeInstanceOf(DeserializationError);
      }
    });

    it('should return error for missing required fields', () => {
      const invalidData = {
        tokenType: 'Bearer',
        expiresAt: '2024-12-31T23:59:59.000Z',
        // missing accessToken
      };

      const result = deserializeStorageToAuthToken(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(MissingFieldError);
      }
    });

    it('should return error for invalid field types', () => {
      const invalidData = {
        accessToken: 123, // should be string
        tokenType: 'Bearer',
        expiresAt: '2024-12-31T23:59:59.000Z',
      };

      const result = deserializeStorageToAuthToken(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidTypeError);
      }
    });

    it('should return error for invalid date format', () => {
      const invalidData = {
        accessToken: 'access-token-123',
        tokenType: 'Bearer',
        expiresAt: 'invalid-date',
      };

      const result = deserializeStorageToAuthToken(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidDateError);
      }
    });

    it('should handle storage data without refresh token', () => {
      const token = authTokenBuilder.build({
        refreshToken: undefined,
      });

      const storageData: AuthTokenStorageData = {
        accessToken: token.accessToken,
        tokenType: token.tokenType,
        expiresAt: token.expiresAt.toISOString(),
        // no refreshToken
      };

      const result = deserializeStorageToAuthToken(storageData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(token);
      }
    });
  });

  describe('deserializeAuthTokenFromJson', () => {
    it('should deserialize valid JSON string', () => {
      const token = authTokenBuilder.build();

      const jsonString = JSON.stringify({
        accessToken: token.accessToken,
        tokenType: token.tokenType,
        expiresAt: token.expiresAt.toISOString(),
        refreshToken: token.refreshToken,
      });

      const result = deserializeAuthTokenFromJson(jsonString);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(token);
      }
    });

    it('should return error for invalid JSON', () => {
      const result = deserializeAuthTokenFromJson('invalid json');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(JsonParseError);
      }
    });

    it('should return error for JSON with invalid data', () => {
      const invalidJson = JSON.stringify({
        tokenType: 'Bearer',
        expiresAt: '2024-12-31T23:59:59.000Z',
        // missing accessToken
      });

      const result = deserializeAuthTokenFromJson(invalidJson);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(MissingFieldError);
      }
    });
  });
});
