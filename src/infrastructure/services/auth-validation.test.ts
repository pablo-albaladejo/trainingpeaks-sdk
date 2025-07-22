/**
 * Auth Validation Service Tests
 * Tests for the auth validation service following @unit-test-rule.mdc
 */

import { describe, expect, it } from 'vitest';
import { createAuthToken } from '../../__fixtures__/auth.fixture';
import {
  getTimeUntilExpiration,
  getTimeUntilRefresh,
  isTokenExpired,
  isTokenValid,
  shouldRefreshToken,
} from './auth-validation';

describe('Auth Validation Service', () => {
  describe('shouldRefreshToken', () => {
    it('should return true when token needs refresh', () => {
      // Arrange - Token that expires in 5 minutes (should trigger refresh)
      const token = createAuthToken({
        expiresInMinutes: 5 / 60, // 5 minutes
      });

      // Act
      const result = shouldRefreshToken(token);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when token does not need refresh', () => {
      // Arrange - Token that expires in 30 minutes (should not trigger refresh)
      const token = createAuthToken({
        expiresInMinutes: 30,
      });

      // Act
      const result = shouldRefreshToken(token);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isTokenValid', () => {
    it('should return true for valid tokens', () => {
      // Arrange - Token that expires in 10 minutes
      const token = createAuthToken({
        expiresInMinutes: 10,
      });

      // Act
      const result = isTokenValid(token);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for tokens close to expiration', () => {
      // Arrange - Token that expires in 2 minutes (within validation threshold)
      const token = createAuthToken({
        expiresInMinutes: 2 / 60, // 2 minutes
      });

      // Act
      const result = isTokenValid(token);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for unexpired tokens', () => {
      // Arrange - Token that expires in 10 minutes
      const token = createAuthToken({
        expiresInMinutes: 10,
      });

      // Act
      const result = isTokenExpired(token);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for expired tokens', () => {
      // Arrange - Token that expired 1 minute ago
      const token = createAuthToken({
        expiresInMinutes: -1, // 1 minute ago
      });

      // Act
      const result = isTokenExpired(token);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('getTimeUntilExpiration', () => {
    it('should return correct time until expiration', () => {
      // Arrange - Token that expires in 10 minutes
      const token = createAuthToken({
        expiresInMinutes: 10,
      });

      // Act
      const result = getTimeUntilExpiration(token);

      // Assert
      expect(result).toBeGreaterThan(590 * 1000); // Should be close to 600 seconds
      expect(result).toBeLessThanOrEqual(600 * 1000);
    });

    it('should return 0 for expired tokens', () => {
      // Arrange - Token that expired 5 minutes ago
      const token = createAuthToken({
        expiresInMinutes: -5, // 5 minutes ago
      });

      // Act
      const result = getTimeUntilExpiration(token);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('getTimeUntilRefresh', () => {
    it('should return correct time until refresh', () => {
      // Arrange - Token that expires in 10 minutes (should refresh in 5 minutes)
      const token = createAuthToken({
        expiresInMinutes: 10,
      });

      // Act
      const result = getTimeUntilRefresh(token);

      // Assert
      expect(result).toBeGreaterThan(290 * 1000); // Should be close to 300 seconds (5 minutes before expiration)
      expect(result).toBeLessThanOrEqual(300 * 1000);
    });

    it('should return 0 when refresh time has passed', () => {
      // Arrange - Token that expires in 3 minutes (refresh time has passed)
      const token = createAuthToken({
        expiresInMinutes: 3,
      });

      // Act
      const result = getTimeUntilRefresh(token);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('edge cases and integration scenarios', () => {
    it('should handle random token expiration times correctly', () => {
      // Arrange
      const randomExpirationMinutes = Math.random() * 60; // Random time between 0 and 60 minutes
      const token = createAuthToken({
        expiresInMinutes: randomExpirationMinutes,
      });

      // Act
      const timeUntilExpiration = getTimeUntilExpiration(token);
      const timeUntilRefresh = getTimeUntilRefresh(token);
      const needsRefresh = shouldRefreshToken(token);
      const isValid = isTokenValid(token);
      const isExpired = isTokenExpired(token);

      // Assert
      if (randomExpirationMinutes > 0) {
        expect(timeUntilExpiration).toBeGreaterThan(0);
        expect(isExpired).toBe(false);
      } else {
        expect(timeUntilExpiration).toBe(0);
        expect(isExpired).toBe(true);
      }

      if (randomExpirationMinutes > 5) {
        expect(timeUntilRefresh).toBeGreaterThan(0);
        expect(needsRefresh).toBe(false);
        expect(isValid).toBe(true);
      } else if (randomExpirationMinutes > 2) {
        expect(timeUntilRefresh).toBe(0);
        expect(needsRefresh).toBe(true);
        expect(isValid).toBe(true);
      } else {
        expect(timeUntilRefresh).toBe(0);
        expect(needsRefresh).toBe(true);
        expect(isValid).toBe(false);
      }
    });

    it('should be consistent with token validation logic', () => {
      // Arrange - Token that expires in 4 minutes (within refresh threshold)
      const token = createAuthToken({
        expiresInMinutes: 4,
      });

      // Act
      const timeUntilExpiration = getTimeUntilExpiration(token);
      const timeUntilRefresh = getTimeUntilRefresh(token);
      const needsRefresh = shouldRefreshToken(token);

      // Assert
      expect(timeUntilExpiration).toBeGreaterThan(0);
      expect(timeUntilRefresh).toBe(0); // Should be 0 since it's within refresh threshold
      expect(needsRefresh).toBe(true); // Should need refresh since it's within 5 minutes
    });

    it('should handle multiple tokens correctly', () => {
      // Arrange
      const validToken = createAuthToken({
        expiresInMinutes: 30,
      });
      const expiredToken = createAuthToken({
        expiresInMinutes: -10,
      });

      // Act & Assert
      expect(isTokenValid(validToken)).toBe(true);
      expect(shouldRefreshToken(validToken)).toBe(false);
      expect(getTimeUntilExpiration(validToken)).toBeGreaterThan(0);

      expect(isTokenValid(expiredToken)).toBe(false);
      expect(shouldRefreshToken(expiredToken)).toBe(true); // Should refresh expired tokens
      expect(getTimeUntilExpiration(expiredToken)).toBe(0);
    });
  });
});
