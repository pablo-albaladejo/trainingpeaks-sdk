/**
 * AuthToken Entity Tests
 * Tests for the AuthToken entity and related utility functions
 */

import { describe, expect, it, vi } from 'vitest';

import {
  type AuthToken,
  createAuthToken,
  getRemainingValidityTime,
  hasRefreshCapability,
  isTokenExpired,
  isTokenValid,
  refreshAuthToken,
  shouldRefreshToken,
} from './auth-token';

describe('AuthToken Entity', () => {
  describe('createAuthToken', () => {
    it('should create a valid AuthToken with all properties', () => {
      // Arrange
      const accessToken = 'access_token_123';
      const tokenType = 'Bearer';
      const expiresIn = 3600;
      const expires = new Date('2024-12-31T23:59:59.000Z');
      const refreshToken = 'refresh_token_456';

      // Act
      const authToken = createAuthToken(
        accessToken,
        tokenType,
        expiresIn,
        expires,
        refreshToken
      );

      // Assert
      expect(authToken.accessToken).toBe('access_token_123');
      expect(authToken.tokenType).toBe('Bearer');
      expect(authToken.expiresIn).toBe(3600);
      expect(authToken.expires).toEqual(new Date('2024-12-31T23:59:59.000Z'));
      expect(authToken.refreshToken).toBe('refresh_token_456');
    });

    it('should create AuthToken without refresh token', () => {
      // Arrange
      const accessToken = 'access_token_no_refresh';
      const tokenType = 'JWT';
      const expiresIn = 1800;
      const expires = new Date('2024-06-15T12:00:00.000Z');

      // Act
      const authToken = createAuthToken(
        accessToken,
        tokenType,
        expiresIn,
        expires
      );

      // Assert
      expect(authToken.accessToken).toBe('access_token_no_refresh');
      expect(authToken.tokenType).toBe('JWT');
      expect(authToken.expiresIn).toBe(1800);
      expect(authToken.expires).toEqual(new Date('2024-06-15T12:00:00.000Z'));
      expect(authToken.refreshToken).toBeUndefined();
    });

    it('should create AuthToken with zero expires in', () => {
      // Arrange
      const accessToken = 'never_expires_token';
      const tokenType = 'Bearer';
      const expiresIn = 0;
      const expires = new Date('2099-01-01T00:00:00.000Z');

      // Act
      const authToken = createAuthToken(
        accessToken,
        tokenType,
        expiresIn,
        expires
      );

      // Assert
      expect(authToken.expiresIn).toBe(0);
      expect(authToken.expires).toEqual(new Date('2099-01-01T00:00:00.000Z'));
    });

    it('should create AuthToken with large expires in value', () => {
      // Arrange
      const accessToken = 'long_lived_token';
      const tokenType = 'Bearer';
      const expiresIn = 31536000; // 1 year
      const expires = new Date('2025-12-31T23:59:59.000Z');

      // Act
      const authToken = createAuthToken(
        accessToken,
        tokenType,
        expiresIn,
        expires
      );

      // Assert
      expect(authToken.expiresIn).toBe(31536000);
      expect(authToken.expires).toEqual(new Date('2025-12-31T23:59:59.000Z'));
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired token', () => {
      // Arrange
      const expiredToken: AuthToken = {
        accessToken: 'expired_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expires: new Date('2020-01-01T00:00:00.000Z'), // Past date
      };

      // Act
      const isExpired = isTokenExpired(expiredToken);

      // Assert
      expect(isExpired).toBe(true);
    });

    it('should return false for valid token', () => {
      // Arrange
      const validToken: AuthToken = {
        accessToken: 'valid_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expires: new Date('2099-01-01T00:00:00.000Z'), // Future date
      };

      // Act
      const isExpired = isTokenExpired(validToken);

      // Assert
      expect(isExpired).toBe(false);
    });

    it('should return true for token that expires exactly now', () => {
      // Arrange
      const now = new Date();
      const tokenExpiringNow: AuthToken = {
        accessToken: 'expiring_now_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expires: now,
      };

      // Act
      // Add small delay to ensure expiration
      vi.useFakeTimers();
      vi.setSystemTime(new Date(now.getTime() + 1000)); // 1 second later
      const isExpired = isTokenExpired(tokenExpiringNow);
      vi.useRealTimers();

      // Assert
      expect(isExpired).toBe(true);
    });

    it('should handle edge case with very close expiration time', () => {
      // Arrange
      const almostExpiredToken: AuthToken = {
        accessToken: 'almost_expired_token',
        tokenType: 'Bearer',
        expiresIn: 1,
        expires: new Date(Date.now() + 100), // 100ms from now
      };

      // Act
      const isExpired = isTokenExpired(almostExpiredToken);

      // Assert
      expect(isExpired).toBe(false); // Should still be valid for 100ms
    });
  });

  describe('isTokenValid', () => {
    it('should return true for valid token', () => {
      // Arrange
      const validToken: AuthToken = {
        accessToken: 'valid_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expires: new Date('2099-01-01T00:00:00.000Z'),
      };

      // Act
      const isValid = isTokenValid(validToken);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should return false for expired token', () => {
      // Arrange
      const expiredToken: AuthToken = {
        accessToken: 'expired_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expires: new Date('2020-01-01T00:00:00.000Z'),
      };

      // Act
      const isValid = isTokenValid(expiredToken);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should be inverse of isTokenExpired', () => {
      // Arrange
      const tokens: AuthToken[] = [
        {
          accessToken: 'token1',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2099-01-01T00:00:00.000Z'),
        },
        {
          accessToken: 'token2',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2020-01-01T00:00:00.000Z'),
        },
      ];

      tokens.forEach((token) => {
        // Act
        const isValid = isTokenValid(token);
        const isExpired = isTokenExpired(token);

        // Assert
        expect(isValid).toBe(!isExpired);
      });
    });
  });

  describe('refreshAuthToken', () => {
    it('should create refreshed token with new access token and expiration', () => {
      // Arrange
      const originalToken: AuthToken = {
        accessToken: 'old_access_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expires: new Date('2024-01-01T00:00:00.000Z'),
        refreshToken: 'original_refresh_token',
      };
      const newAccessToken = 'new_access_token';
      const newExpires = new Date('2024-12-31T23:59:59.000Z');
      const newRefreshToken = 'new_refresh_token';

      // Act
      const refreshedToken = refreshAuthToken(
        originalToken,
        newAccessToken,
        newExpires,
        newRefreshToken
      );

      // Assert
      expect(refreshedToken.accessToken).toBe('new_access_token');
      expect(refreshedToken.expires).toEqual(
        new Date('2024-12-31T23:59:59.000Z')
      );
      expect(refreshedToken.refreshToken).toBe('new_refresh_token');
      expect(refreshedToken.tokenType).toBe('Bearer'); // Preserved
      expect(refreshedToken.expiresIn).toBe(3600); // Preserved
    });

    it('should preserve original refresh token when new one not provided', () => {
      // Arrange
      const originalToken: AuthToken = {
        accessToken: 'old_access_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expires: new Date('2024-01-01T00:00:00.000Z'),
        refreshToken: 'original_refresh_token',
      };
      const newAccessToken = 'new_access_token';
      const newExpires = new Date('2024-12-31T23:59:59.000Z');

      // Act
      const refreshedToken = refreshAuthToken(
        originalToken,
        newAccessToken,
        newExpires
      );

      // Assert
      expect(refreshedToken.accessToken).toBe('new_access_token');
      expect(refreshedToken.expires).toEqual(
        new Date('2024-12-31T23:59:59.000Z')
      );
      expect(refreshedToken.refreshToken).toBe('original_refresh_token');
    });

    it('should handle token without original refresh token', () => {
      // Arrange
      const originalToken: AuthToken = {
        accessToken: 'old_access_token',
        tokenType: 'JWT',
        expiresIn: 1800,
        expires: new Date('2024-01-01T00:00:00.000Z'),
        // No refresh token
      };
      const newAccessToken = 'new_access_token';
      const newExpires = new Date('2024-12-31T23:59:59.000Z');
      const newRefreshToken = 'new_refresh_token';

      // Act
      const refreshedToken = refreshAuthToken(
        originalToken,
        newAccessToken,
        newExpires,
        newRefreshToken
      );

      // Assert
      expect(refreshedToken.accessToken).toBe('new_access_token');
      expect(refreshedToken.refreshToken).toBe('new_refresh_token');
    });

    it('should create new object and not mutate original', () => {
      // Arrange
      const originalToken: AuthToken = {
        accessToken: 'original_access_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expires: new Date('2024-01-01T00:00:00.000Z'),
        refreshToken: 'original_refresh_token',
      };
      const newAccessToken = 'new_access_token';
      const newExpires = new Date('2024-12-31T23:59:59.000Z');

      // Act
      const refreshedToken = refreshAuthToken(
        originalToken,
        newAccessToken,
        newExpires
      );

      // Assert
      expect(originalToken.accessToken).toBe('original_access_token');
      expect(originalToken.expires).toEqual(
        new Date('2024-01-01T00:00:00.000Z')
      );
      expect(refreshedToken).not.toBe(originalToken);
    });
  });

  describe('shouldRefreshToken', () => {
    it('should return true for token expiring in less than 5 minutes', () => {
      // Arrange
      const soonExpiringToken: AuthToken = {
        accessToken: 'soon_expiring_token',
        tokenType: 'Bearer',
        expiresIn: 240, // 4 minutes
        expires: new Date(Date.now() + 4 * 60 * 1000), // 4 minutes from now
      };

      // Act
      const shouldRefresh = shouldRefreshToken(soonExpiringToken);

      // Assert
      expect(shouldRefresh).toBe(true);
    });

    it('should return false for token expiring in more than 5 minutes', () => {
      // Arrange
      const laterExpiringToken: AuthToken = {
        accessToken: 'later_expiring_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      };

      // Act
      const shouldRefresh = shouldRefreshToken(laterExpiringToken);

      // Assert
      expect(shouldRefresh).toBe(false);
    });

    it('should return true for token expiring exactly in 5 minutes', () => {
      // Arrange
      const exactlyFiveMinutesToken: AuthToken = {
        accessToken: 'five_minutes_token',
        tokenType: 'Bearer',
        expiresIn: 300,
        expires: new Date(Date.now() + 5 * 60 * 1000), // Exactly 5 minutes
      };

      // Act
      const shouldRefresh = shouldRefreshToken(exactlyFiveMinutesToken);

      // Assert
      expect(shouldRefresh).toBe(true);
    });

    it('should return true for already expired token', () => {
      // Arrange
      const expiredToken: AuthToken = {
        accessToken: 'expired_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expires: new Date('2020-01-01T00:00:00.000Z'),
      };

      // Act
      const shouldRefresh = shouldRefreshToken(expiredToken);

      // Assert
      expect(shouldRefresh).toBe(true);
    });
  });

  describe('getRemainingValidityTime', () => {
    it('should return correct remaining time for valid token', () => {
      // Arrange
      const futureTime = Date.now() + 3600000; // 1 hour from now
      const validToken: AuthToken = {
        accessToken: 'valid_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expires: new Date(futureTime),
      };

      // Act
      const remainingTime = getRemainingValidityTime(validToken);

      // Assert
      expect(remainingTime).toBeGreaterThan(3590000); // Almost 1 hour
      expect(remainingTime).toBeLessThanOrEqual(3600000); // At most 1 hour
    });

    it('should return 0 for expired token', () => {
      // Arrange
      const expiredToken: AuthToken = {
        accessToken: 'expired_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expires: new Date('2020-01-01T00:00:00.000Z'),
      };

      // Act
      const remainingTime = getRemainingValidityTime(expiredToken);

      // Assert
      expect(remainingTime).toBe(0);
    });

    it('should return small positive value for token expiring very soon', () => {
      // Arrange
      const almostExpiredToken: AuthToken = {
        accessToken: 'almost_expired_token',
        tokenType: 'Bearer',
        expiresIn: 1,
        expires: new Date(Date.now() + 1000), // 1 second from now
      };

      // Act
      const remainingTime = getRemainingValidityTime(almostExpiredToken);

      // Assert
      expect(remainingTime).toBeGreaterThan(0);
      expect(remainingTime).toBeLessThanOrEqual(1000);
    });
  });

  describe('hasRefreshCapability', () => {
    it('should return true for token with refresh token', () => {
      // Arrange
      const tokenWithRefresh: AuthToken = {
        accessToken: 'access_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expires: new Date('2099-01-01T00:00:00.000Z'),
        refreshToken: 'refresh_token_123',
      };

      // Act
      const hasRefresh = hasRefreshCapability(tokenWithRefresh);

      // Assert
      expect(hasRefresh).toBe(true);
    });

    it('should return false for token without refresh token', () => {
      // Arrange
      const tokenWithoutRefresh: AuthToken = {
        accessToken: 'access_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expires: new Date('2099-01-01T00:00:00.000Z'),
        // No refresh token
      };

      // Act
      const hasRefresh = hasRefreshCapability(tokenWithoutRefresh);

      // Assert
      expect(hasRefresh).toBe(false);
    });

    it('should return false for token with empty string refresh token', () => {
      // Arrange
      const tokenWithEmptyRefresh: AuthToken = {
        accessToken: 'access_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expires: new Date('2099-01-01T00:00:00.000Z'),
        refreshToken: '',
      };

      // Act
      const hasRefresh = hasRefreshCapability(tokenWithEmptyRefresh);

      // Assert
      expect(hasRefresh).toBe(false);
    });

    it('should return false for token with null refresh token', () => {
      // Arrange
      const tokenWithNullRefresh: AuthToken = {
        accessToken: 'access_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expires: new Date('2099-01-01T00:00:00.000Z'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        refreshToken: null as any,
      };

      // Act
      const hasRefresh = hasRefreshCapability(tokenWithNullRefresh);

      // Assert
      expect(hasRefresh).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete token lifecycle', () => {
      // Arrange
      const initialExpires = new Date(Date.now() + 3600000); // 1 hour

      // Act - Create token
      const token = createAuthToken(
        'initial_access_token',
        'Bearer',
        3600,
        initialExpires,
        'initial_refresh_token'
      );

      // Assert - Initial state
      expect(isTokenValid(token)).toBe(true);
      expect(hasRefreshCapability(token)).toBe(true);
      expect(shouldRefreshToken(token)).toBe(false);

      // Act - Simulate token refresh
      const newExpires = new Date(Date.now() + 7200000); // 2 hours
      const refreshedToken = refreshAuthToken(
        token,
        'new_access_token',
        newExpires,
        'new_refresh_token'
      );

      // Assert - After refresh
      expect(refreshedToken.accessToken).toBe('new_access_token');
      expect(refreshedToken.refreshToken).toBe('new_refresh_token');
      expect(isTokenValid(refreshedToken)).toBe(true);
      expect(hasRefreshCapability(refreshedToken)).toBe(true);
    });

    it('should handle token near expiration scenarios', () => {
      // Arrange
      const closeToExpirationTime = new Date(Date.now() + 4 * 60 * 1000); // 4 minutes
      const token = createAuthToken(
        'expiring_soon_token',
        'Bearer',
        240,
        closeToExpirationTime,
        'refresh_token'
      );

      // Act & Assert
      expect(isTokenValid(token)).toBe(true);
      expect(shouldRefreshToken(token)).toBe(true);
      expect(hasRefreshCapability(token)).toBe(true);
      expect(getRemainingValidityTime(token)).toBeGreaterThan(0);
      expect(getRemainingValidityTime(token)).toBeLessThan(5 * 60 * 1000);
    });

    it('should handle expired token scenarios', () => {
      // Arrange
      const expiredTime = new Date('2020-01-01T00:00:00.000Z');
      const expiredToken = createAuthToken(
        'expired_access_token',
        'Bearer',
        3600,
        expiredTime
      );

      // Act & Assert
      expect(isTokenValid(expiredToken)).toBe(false);
      expect(isTokenExpired(expiredToken)).toBe(true);
      expect(shouldRefreshToken(expiredToken)).toBe(true);
      expect(hasRefreshCapability(expiredToken)).toBe(false);
      expect(getRemainingValidityTime(expiredToken)).toBe(0);
    });
  });
});
