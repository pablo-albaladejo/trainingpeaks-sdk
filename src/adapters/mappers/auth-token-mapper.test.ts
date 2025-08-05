/**
 * AuthToken Mapper Tests
 * Tests for mapping TrainingPeaks API token responses to domain AuthToken entities
 */

import { describe, expect, it } from 'vitest';

import type { TokenEndpointResponse } from '@/adapters/public-api/endpoints/users/v3/token';

import {
  mapTPTokenToAuthToken,
  mapTPTokenToAuthTokenSafe,
} from './auth-token-mapper';

describe('AuthToken Mappers', () => {
  describe('mapTPTokenToAuthToken', () => {
    it('should map TrainingPeaks token to AuthToken entity', () => {
      // Arrange
      const tpToken: TokenEndpointResponse['token'] = {
        access_token: 'abc123token',
        token_type: 'Bearer',
        expires_in: 3600,
        expires: '2024-12-31T23:59:59.000Z',
        refresh_token: 'refresh123token',
        scope: 'read write',
      };

      // Act
      const authToken = mapTPTokenToAuthToken(tpToken);

      // Assert
      expect(authToken.accessToken).toBe('abc123token');
      expect(authToken.tokenType).toBe('Bearer');
      expect(authToken.expiresIn).toBe(3600);
      expect(authToken.expires).toEqual(new Date('2024-12-31T23:59:59.000Z'));
      expect(authToken.refreshToken).toBe('refresh123token');
    });

    it('should handle token without refresh_token', () => {
      // Arrange
      const tpToken: TokenEndpointResponse['token'] = {
        access_token: 'abc123token',
        token_type: 'Bearer',
        expires_in: 3600,
        expires: '2024-12-31T23:59:59.000Z',
        scope: 'read',
        // refresh_token intentionally omitted
      };

      // Act
      const authToken = mapTPTokenToAuthToken(tpToken);

      // Assert
      expect(authToken.accessToken).toBe('abc123token');
      expect(authToken.tokenType).toBe('Bearer');
      expect(authToken.expiresIn).toBe(3600);
      expect(authToken.expires).toEqual(new Date('2024-12-31T23:59:59.000Z'));
      expect(authToken.refreshToken).toBeUndefined();
    });

    it('should handle token with null refresh_token', () => {
      // Arrange
      const tpToken: TokenEndpointResponse['token'] = {
        access_token: 'abc123token',
        token_type: 'Bearer',
        expires_in: 3600,
        expires: '2024-12-31T23:59:59.000Z',
        refresh_token: null,
        scope: 'read',
      };

      // Act
      const authToken = mapTPTokenToAuthToken(tpToken);

      // Assert
      expect(authToken.accessToken).toBe('abc123token');
      expect(authToken.refreshToken).toBeUndefined();
    });

    it('should handle token with empty string refresh_token', () => {
      // Arrange
      const tpToken: TokenEndpointResponse['token'] = {
        access_token: 'abc123token',
        token_type: 'Bearer',
        expires_in: 3600,
        expires: '2024-12-31T23:59:59.000Z',
        refresh_token: '',
        scope: 'read',
      };

      // Act
      const authToken = mapTPTokenToAuthToken(tpToken);

      // Assert
      expect(authToken.accessToken).toBe('abc123token');
      expect(authToken.refreshToken).toBeUndefined();
    });

    it('should handle different token types', () => {
      // Arrange
      const tpToken: TokenEndpointResponse['token'] = {
        access_token: 'jwt.token.here',
        token_type: 'JWT',
        expires_in: 7200,
        expires: '2024-12-31T23:59:59.000Z',
        scope: 'admin',
      };

      // Act
      const authToken = mapTPTokenToAuthToken(tpToken);

      // Assert
      expect(authToken.accessToken).toBe('jwt.token.here');
      expect(authToken.tokenType).toBe('JWT');
      expect(authToken.expiresIn).toBe(7200);
    });

    it('should handle zero expires_in', () => {
      // Arrange
      const tpToken: TokenEndpointResponse['token'] = {
        access_token: 'never_expires_token',
        token_type: 'Bearer',
        expires_in: 0,
        expires: '2099-12-31T23:59:59.000Z',
        scope: 'read',
      };

      // Act
      const authToken = mapTPTokenToAuthToken(tpToken);

      // Assert
      expect(authToken.expiresIn).toBe(0);
      expect(authToken.expires).toEqual(new Date('2099-12-31T23:59:59.000Z'));
    });

    it('should handle large expires_in values', () => {
      // Arrange
      const tpToken: TokenEndpointResponse['token'] = {
        access_token: 'long_lived_token',
        token_type: 'Bearer',
        expires_in: 31536000, // 1 year in seconds
        expires: '2025-12-31T23:59:59.000Z',
        scope: 'read write admin',
      };

      // Act
      const authToken = mapTPTokenToAuthToken(tpToken);

      // Assert
      expect(authToken.expiresIn).toBe(31536000);
      expect(authToken.expires).toEqual(new Date('2025-12-31T23:59:59.000Z'));
    });
  });

  describe('mapTPTokenToAuthTokenSafe', () => {
    it('should map valid token safely', () => {
      // Arrange
      const tpToken: TokenEndpointResponse['token'] = {
        access_token: 'safe_token',
        token_type: 'Bearer',
        expires_in: 3600,
        expires: '2024-12-31T23:59:59.000Z',
        refresh_token: 'safe_refresh',
        scope: 'read',
      };

      // Act
      const authToken = mapTPTokenToAuthTokenSafe(tpToken);

      // Assert
      expect(authToken).not.toBeNull();
      expect(authToken!.accessToken).toBe('safe_token');
      expect(authToken!.tokenType).toBe('Bearer');
      expect(authToken!.refreshToken).toBe('safe_refresh');
    });

    it('should return null for undefined token', () => {
      // Arrange
      const tpToken = undefined;

      // Act
      const authToken = mapTPTokenToAuthTokenSafe(tpToken);

      // Assert
      expect(authToken).toBeNull();
    });

    it('should return null for null token', () => {
      // Arrange
      const tpToken = null;

      // Act
      const authToken = mapTPTokenToAuthTokenSafe(tpToken);

      // Assert
      expect(authToken).toBeNull();
    });

    it('should preserve all token properties when mapping safely', () => {
      // Arrange
      const tpToken: TokenEndpointResponse['token'] = {
        access_token: 'comprehensive_token',
        token_type: 'OAuth',
        expires_in: 1800,
        expires: '2024-01-01T12:00:00.000Z',
        refresh_token: 'comprehensive_refresh',
        scope: 'read write delete admin',
      };

      // Act
      const authToken = mapTPTokenToAuthTokenSafe(tpToken);

      // Assert
      expect(authToken).not.toBeNull();
      expect(authToken!.accessToken).toBe('comprehensive_token');
      expect(authToken!.tokenType).toBe('OAuth');
      expect(authToken!.expiresIn).toBe(1800);
      expect(authToken!.expires).toEqual(new Date('2024-01-01T12:00:00.000Z'));
      expect(authToken!.refreshToken).toBe('comprehensive_refresh');
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle token with ISO date string variations', () => {
      // Arrange
      const variations = [
        '2024-12-31T23:59:59Z',
        '2024-12-31T23:59:59.123Z',
        '2024-12-31T23:59:59.123456Z',
        '2024-12-31T23:59:59+00:00',
      ];

      variations.forEach((dateString) => {
        const tpToken: TokenEndpointResponse['token'] = {
          access_token: 'date_test_token',
          token_type: 'Bearer',
          expires_in: 3600,
          expires: dateString,
          scope: 'test',
        };

        // Act
        const authToken = mapTPTokenToAuthToken(tpToken);

        // Assert
        expect(authToken.expires).toBeInstanceOf(Date);
        expect(authToken.expires.getTime()).not.toBeNaN();
      });
    });

    it('should create AuthToken entities with all properties', () => {
      // Arrange
      const tpToken: TokenEndpointResponse['token'] = {
        access_token: 'complete_token',
        token_type: 'Bearer',
        expires_in: 3600,
        expires: '2024-12-31T23:59:59.000Z',
        refresh_token: 'complete_refresh',
        scope: 'read',
      };

      // Act
      const authToken = mapTPTokenToAuthToken(tpToken);

      // Assert
      expect(authToken.accessToken).toBe('complete_token');
      expect(authToken.tokenType).toBe('Bearer');
      expect(authToken.expiresIn).toBe(3600);
      expect(authToken.expires).toEqual(new Date('2024-12-31T23:59:59.000Z'));
      expect(authToken.refreshToken).toBe('complete_refresh');
    });

    it('should handle realistic TrainingPeaks token structure', () => {
      // Arrange
      const realisticTPToken: TokenEndpointResponse['token'] = {
        access_token:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0cmFpbmluZ3BlYWtzIiwic3ViIjoxMjM0NTY3ODkwLCJpYXQiOjE2MzI0OTE2MDAsImV4cCI6MTYzMjQ5NTIwMH0',
        token_type: 'Bearer',
        expires_in: 3600,
        expires: '2024-01-15T10:30:00.000Z',
        refresh_token: 'refresh_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9',
        scope: 'user:profile workouts:read workouts:write',
      };

      // Act
      const authToken = mapTPTokenToAuthToken(realisticTPToken);

      // Assert
      expect(authToken.accessToken).toContain('eyJ0eXAiOiJKV1QiLC');
      expect(authToken.tokenType).toBe('Bearer');
      expect(authToken.expiresIn).toBe(3600);
      expect(authToken.refreshToken).toContain('refresh_eyJ0eXAiOiJKV1QiLC');
    });

    it('should handle mapping chain: unsafe -> safe -> unsafe', () => {
      // Arrange
      const tpToken: TokenEndpointResponse['token'] = {
        access_token: 'chain_token',
        token_type: 'Bearer',
        expires_in: 1200,
        expires: '2024-06-15T14:30:00.000Z',
        refresh_token: 'chain_refresh',
        scope: 'chain_test',
      };

      // Act
      const unsafeMapping = mapTPTokenToAuthToken(tpToken);
      const safeMapping = mapTPTokenToAuthTokenSafe(tpToken);
      const nullSafeMapping = mapTPTokenToAuthTokenSafe(null);

      // Assert
      expect(unsafeMapping.accessToken).toBe(safeMapping!.accessToken);
      expect(unsafeMapping.tokenType).toBe(safeMapping!.tokenType);
      expect(unsafeMapping.expiresIn).toBe(safeMapping!.expiresIn);
      expect(unsafeMapping.expires.getTime()).toBe(
        safeMapping!.expires.getTime()
      );
      expect(unsafeMapping.refreshToken).toBe(safeMapping!.refreshToken);
      expect(nullSafeMapping).toBeNull();
    });
  });
});
