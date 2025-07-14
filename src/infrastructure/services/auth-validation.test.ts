/**
 * Auth Validation Service Tests
 * Tests for the auth validation service implementation following @unit-test-rule.mdc
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { AuthTokenFixture } from '../../__fixtures__/auth.fixture';
import { randomNumber } from '../../__fixtures__/utils.fixture';
import { createAuthValidationService } from './auth-validation';

describe('Auth Validation Service', () => {
  let authValidationService: ReturnType<typeof createAuthValidationService>;

  beforeEach(() => {
    // Arrange - Create service instance
    authValidationService = createAuthValidationService();
  });

  describe('shouldRefreshToken', () => {
    it('should return true when token needs refresh', () => {
      // Arrange - Token that expires in 5 minutes (should trigger refresh)
      const token = new AuthTokenFixture()
        .withExpiresIn(300) // 5 minutes
        .build();

      // Act
      const result = authValidationService.shouldRefreshToken(token);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when token does not need refresh', () => {
      // Arrange - Token that expires in 2 hours (should not trigger refresh)
      const token = new AuthTokenFixture()
        .withExpiresIn(7200) // 2 hours
        .build();

      // Act
      const result = authValidationService.shouldRefreshToken(token);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isTokenValid', () => {
    it('should return true for valid tokens', () => {
      // Arrange - Token that expires in 1 hour
      const token = new AuthTokenFixture()
        .withExpiresIn(3600) // 1 hour
        .build();

      // Act
      const result = authValidationService.isTokenValid(token);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for tokens close to expiration', () => {
      // Arrange - Token that expires in 1 minute
      const token = new AuthTokenFixture()
        .withExpiresIn(60) // 1 minute
        .build();

      // Act
      const result = authValidationService.isTokenValid(token);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for unexpired tokens', () => {
      // Arrange - Token that expires in 1 hour
      const token = new AuthTokenFixture()
        .withExpiresIn(3600) // 1 hour
        .build();

      // Act
      const result = authValidationService.isTokenExpired(token);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for expired tokens', () => {
      // Arrange - Token that expired 1 hour ago
      const expiredDate = new Date(Date.now() - 3600 * 1000);
      const token = new AuthTokenFixture().withExpiresAt(expiredDate).build();

      // Act
      const result = authValidationService.isTokenExpired(token);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('getTimeUntilExpiration', () => {
    it('should return correct time until expiration', () => {
      // Arrange - Token that expires in 1 hour
      const token = new AuthTokenFixture()
        .withExpiresIn(3600) // 1 hour
        .build();

      // Act
      const result = authValidationService.getTimeUntilExpiration(token);

      // Assert
      expect(result).toBeGreaterThan(3500000); // Should be close to 1 hour in ms
      expect(result).toBeLessThanOrEqual(3600000); // Should not exceed 1 hour
    });

    it('should return 0 for expired tokens', () => {
      // Arrange - Token that expired 1 hour ago
      const expiredDate = new Date(Date.now() - 3600 * 1000);
      const token = new AuthTokenFixture().withExpiresAt(expiredDate).build();

      // Act
      const result = authValidationService.getTimeUntilExpiration(token);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('getTimeUntilRefresh', () => {
    it('should return correct time until refresh', () => {
      // Arrange - Token that expires in 2 hours
      const token = new AuthTokenFixture()
        .withExpiresIn(7200) // 2 hours
        .build();

      // Act
      const result = authValidationService.getTimeUntilRefresh(token);

      // Assert
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(7200000); // Should not exceed 2 hours
    });

    it('should return 0 when refresh time has passed', () => {
      // Arrange - Token that expires in 5 minutes (should be ready for refresh)
      const token = new AuthTokenFixture()
        .withExpiresIn(300) // 5 minutes
        .build();

      // Act
      const result = authValidationService.getTimeUntilRefresh(token);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('edge cases and integration scenarios', () => {
    it('should handle random token expiration times correctly', () => {
      // Arrange
      const randomExpiresIn = randomNumber(60, 7200); // 1 minute to 2 hours
      const token = new AuthTokenFixture()
        .withExpiresIn(randomExpiresIn)
        .build();

      // Act
      const isValid = authValidationService.isTokenValid(token);
      const isExpired = authValidationService.isTokenExpired(token);
      const shouldRefresh = authValidationService.shouldRefreshToken(token);
      const timeUntilExpiration =
        authValidationService.getTimeUntilExpiration(token);
      const timeUntilRefresh = authValidationService.getTimeUntilRefresh(token);

      // Assert
      expect(typeof isValid).toBe('boolean');
      expect(typeof isExpired).toBe('boolean');
      expect(typeof shouldRefresh).toBe('boolean');
      expect(typeof timeUntilExpiration).toBe('number');
      expect(typeof timeUntilRefresh).toBe('number');
      expect(timeUntilExpiration).toBeGreaterThanOrEqual(0);
      expect(timeUntilRefresh).toBeGreaterThanOrEqual(0);
    });

    it('should be consistent with token validation logic', () => {
      // Arrange
      const token = AuthTokenFixture.random();

      // Act
      const isValid1 = authValidationService.isTokenValid(token);
      const isValid2 = authValidationService.isTokenValid(token);
      const isExpired1 = authValidationService.isTokenExpired(token);
      const isExpired2 = authValidationService.isTokenExpired(token);

      // Assert - Results should be consistent for same token
      expect(isValid1).toBe(isValid2);
      expect(isExpired1).toBe(isExpired2);
    });

    it('should handle multiple tokens correctly', () => {
      // Arrange
      const tokens = Array.from({ length: randomNumber(3, 10) }, () =>
        AuthTokenFixture.random()
      );

      // Act & Assert
      tokens.forEach((token) => {
        expect(() => {
          authValidationService.isTokenValid(token);
          authValidationService.isTokenExpired(token);
          authValidationService.shouldRefreshToken(token);
          authValidationService.getTimeUntilExpiration(token);
          authValidationService.getTimeUntilRefresh(token);
        }).not.toThrow();
      });
    });
  });
});
