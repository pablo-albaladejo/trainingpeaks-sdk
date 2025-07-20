/**
 * Auth Validation Service Tests
 * Tests for the auth validation service implementation following @unit-test-rule.mdc
 */

import { describe, expect, it } from 'vitest';
import { AuthTokenFixture } from '../../__fixtures__/auth.fixture';
import { randomNumber } from '../../__fixtures__/utils.fixture';
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
      const token = new AuthTokenFixture()
        .withExpiresIn(300) // 5 minutes
        .build();

      // Act
      const result = shouldRefreshToken(token);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when token does not need refresh', () => {
      // Arrange - Token that expires in 30 minutes (should not trigger refresh)
      const token = new AuthTokenFixture()
        .withExpiresIn(1800) // 30 minutes
        .build();

      // Act
      const result = shouldRefreshToken(token);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isTokenValid', () => {
    it('should return true for valid tokens', () => {
      // Arrange - Token that expires in 10 minutes
      const token = new AuthTokenFixture()
        .withExpiresIn(600) // 10 minutes
        .build();

      // Act
      const result = isTokenValid(token);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for tokens close to expiration', () => {
      // Arrange - Token that expires in 2 minutes (within validation threshold)
      const token = new AuthTokenFixture()
        .withExpiresIn(120) // 2 minutes
        .build();

      // Act
      const result = isTokenValid(token);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for unexpired tokens', () => {
      // Arrange - Token that expires in 10 minutes
      const token = new AuthTokenFixture()
        .withExpiresIn(600) // 10 minutes
        .build();

      // Act
      const result = isTokenExpired(token);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for expired tokens', () => {
      // Arrange - Token that expired 1 minute ago
      const token = new AuthTokenFixture()
        .withExpiresIn(-60) // 1 minute ago
        .build();

      // Act
      const result = isTokenExpired(token);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('getTimeUntilExpiration', () => {
    it('should return correct time until expiration', () => {
      // Arrange - Token that expires in 10 minutes
      const token = new AuthTokenFixture()
        .withExpiresIn(600) // 10 minutes
        .build();

      // Act
      const result = getTimeUntilExpiration(token);

      // Assert
      expect(result).toBeGreaterThan(590000); // Should be close to 10 minutes (600s)
      expect(result).toBeLessThanOrEqual(600000); // Allow exactly 600000ms
    });

    it('should return 0 for expired tokens', () => {
      // Arrange - Token that expired 5 minutes ago
      const token = new AuthTokenFixture()
        .withExpiresIn(-300) // 5 minutes ago
        .build();

      // Act
      const result = getTimeUntilExpiration(token);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('getTimeUntilRefresh', () => {
    it('should return correct time until refresh', () => {
      // Arrange - Token that expires in 10 minutes
      const token = new AuthTokenFixture()
        .withExpiresIn(600) // 10 minutes
        .build();

      // Act
      const result = getTimeUntilRefresh(token);

      // Assert
      expect(result).toBeGreaterThan(0); // Should be positive
      expect(result).toBeLessThan(600000); // Should be less than expiration time
    });

    it('should return 0 when refresh time has passed', () => {
      // Arrange - Token that expires in 2 minutes (within refresh threshold)
      const token = new AuthTokenFixture()
        .withExpiresIn(120) // 2 minutes
        .build();

      // Act
      const result = getTimeUntilRefresh(token);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('edge cases and integration scenarios', () => {
    it('should handle random token expiration times correctly', () => {
      // Arrange - Generate random tokens with different expiration times
      const tokens = Array.from({ length: 10 }, () => {
        const expiresIn = randomNumber(1, 3600); // 1 second to 1 hour
        return new AuthTokenFixture().withExpiresIn(expiresIn).build();
      });

      // Act & Assert - All validation functions should work without errors
      tokens.forEach((token) => {
        expect(() => {
          const valid = isTokenValid(token);
          const expired = isTokenExpired(token);
          const shouldRefresh = shouldRefreshToken(token);
          const timeUntilExpiration = getTimeUntilExpiration(token);
          const timeUntilRefresh = getTimeUntilRefresh(token);

          // Basic consistency checks
          expect(typeof valid).toBe('boolean');
          expect(typeof expired).toBe('boolean');
          expect(typeof shouldRefresh).toBe('boolean');
          expect(typeof timeUntilExpiration).toBe('number');
          expect(typeof timeUntilRefresh).toBe('number');
        }).not.toThrow();
      });
    });

    it('should be consistent with token validation logic', () => {
      // Arrange - Token with specific expiration time
      const token = new AuthTokenFixture()
        .withExpiresIn(180) // 3 minutes
        .build();

      // Act
      const valid = isTokenValid(token);
      const expired = isTokenExpired(token);
      const shouldRefresh = shouldRefreshToken(token);

      // Assert - Logic should be consistent
      expect(expired).toBe(false); // Should not be expired
      expect(valid).toBe(true); // Should be valid (3 min > 2 min threshold)
      expect(shouldRefresh).toBe(true); // Should need refresh (3 min < 5 min threshold)
    });

    it('should handle multiple tokens correctly', () => {
      // Arrange - Multiple tokens with different states
      const validToken = new AuthTokenFixture().withExpiresIn(1800).build(); // 30 minutes
      const expiredToken = new AuthTokenFixture().withExpiresIn(-300).build(); // 5 minutes ago
      const refreshNeededToken = new AuthTokenFixture()
        .withExpiresIn(240)
        .build(); // 4 minutes

      // Act & Assert - Should handle all tokens without errors
      expect(() => {
        // Valid token tests
        isTokenValid(validToken);
        isTokenExpired(validToken);
        shouldRefreshToken(validToken);
        getTimeUntilExpiration(validToken);
        getTimeUntilRefresh(validToken);

        // Expired token tests
        isTokenValid(expiredToken);
        isTokenExpired(expiredToken);
        shouldRefreshToken(expiredToken);
        getTimeUntilExpiration(expiredToken);
        getTimeUntilRefresh(expiredToken);

        // Refresh needed token tests
        const token = refreshNeededToken;
        isTokenValid(token);
        isTokenExpired(token);
        shouldRefreshToken(token);
        getTimeUntilExpiration(token);
        getTimeUntilRefresh(token);
      }).not.toThrow();
    });
  });
});
