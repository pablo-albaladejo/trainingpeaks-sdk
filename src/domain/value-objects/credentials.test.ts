/**
 * Credentials Value Object Tests
 * Tests for the credentials value object and related utilities
 */

import { describe, expect, it } from 'vitest';

import { ValidationError } from '@/domain/errors/domain-errors';

import {
  areCredentialsEqual,
  createCredentials,
  createMaskedCredentials,
  type Credentials,
  validateCredentials,
} from './credentials';

describe('Credentials Value Object', () => {
  describe('createCredentials', () => {
    it('should create valid credentials', () => {
      // Arrange
      const username = 'john_doe';
      const password = 'secret123';

      // Act
      const credentials = createCredentials(username, password);

      // Assert
      expect(credentials.username).toBe('john_doe');
      expect(credentials.password).toBe('secret123');
      expect(Object.isFrozen(credentials)).toBe(true);
    });

    it('should trim whitespace from username', () => {
      // Arrange
      const username = '  john_doe  ';
      const password = 'secret123';

      // Act
      const credentials = createCredentials(username, password);

      // Assert
      expect(credentials.username).toBe('john_doe');
      expect(credentials.password).toBe('secret123');
    });

    it('should create frozen immutable object', () => {
      // Arrange
      const username = 'john_doe';
      const password = 'secret123';

      // Act
      const credentials = createCredentials(username, password);

      // Assert
      expect(Object.isFrozen(credentials)).toBe(true);
      expect(() => {
        (credentials as unknown as { username: string }).username = 'modified';
      }).toThrow();
    });

    describe('Validation Errors', () => {
      it('should throw ValidationError for empty username', () => {
        // Arrange
        const username = '';
        const password = 'secret123';

        // Act & Assert
        expect(() => createCredentials(username, password)).toThrow(
          ValidationError
        );
        expect(() => createCredentials(username, password)).toThrow(
          'Username cannot be empty'
        );
      });

      it('should throw ValidationError for whitespace-only username', () => {
        // Arrange
        const username = '   ';
        const password = 'secret123';

        // Act & Assert
        expect(() => createCredentials(username, password)).toThrow(
          ValidationError
        );
        expect(() => createCredentials(username, password)).toThrow(
          'Username cannot be empty'
        );
      });

      it('should throw ValidationError for empty password', () => {
        // Arrange
        const username = 'john_doe';
        const password = '';

        // Act & Assert
        expect(() => createCredentials(username, password)).toThrow(
          ValidationError
        );
        expect(() => createCredentials(username, password)).toThrow(
          'Password cannot be empty'
        );
      });

      it('should throw ValidationError for username exceeding 100 characters', () => {
        // Arrange
        const username = 'a'.repeat(101); // 101 characters
        const password = 'secret123';

        // Act & Assert
        expect(() => createCredentials(username, password)).toThrow(
          ValidationError
        );
        expect(() => createCredentials(username, password)).toThrow(
          'Username cannot exceed 100 characters'
        );
      });

      it('should include field context in validation errors', () => {
        // Arrange & Act & Assert
        try {
          createCredentials('', 'password');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).field).toBe('username');
        }

        try {
          createCredentials('username', '');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).field).toBe('password');
        }

        try {
          createCredentials('a'.repeat(101), 'password');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).field).toBe('username');
        }
      });
    });

    describe('Edge Cases', () => {
      it('should accept username with exactly 100 characters', () => {
        // Arrange
        const username = 'a'.repeat(100); // Exactly 100 characters
        const password = 'secret123';

        // Act
        const credentials = createCredentials(username, password);

        // Assert
        expect(credentials.username).toBe(username);
        expect(credentials.password).toBe(password);
      });

      it('should handle special characters in username', () => {
        // Arrange
        const username = 'john.doe+test@domain';
        const password = 'secret123';

        // Act
        const credentials = createCredentials(username, password);

        // Assert
        expect(credentials.username).toBe('john.doe+test@domain');
      });

      it('should handle special characters in password', () => {
        // Arrange
        const username = 'john_doe';
        const password = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?';

        // Act
        const credentials = createCredentials(username, password);

        // Assert
        expect(credentials.password).toBe('P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?');
      });

      it('should handle unicode characters', () => {
        // Arrange
        const username = 'josé_müller';
        const password = 'пароль123';

        // Act
        const credentials = createCredentials(username, password);

        // Assert
        expect(credentials.username).toBe('josé_müller');
        expect(credentials.password).toBe('пароль123');
      });
    });
  });

  describe('validateCredentials', () => {
    it('should return true for valid credentials', () => {
      // Arrange
      const credentials = createCredentials('john_doe', 'secret123');

      // Act
      const isValid = validateCredentials(credentials);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should return false for credentials with empty username', () => {
      // Arrange
      const credentials: Credentials = { username: '', password: 'secret123' };

      // Act
      const isValid = validateCredentials(credentials);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should return false for credentials with empty password', () => {
      // Arrange
      const credentials: Credentials = { username: 'john_doe', password: '' };

      // Act
      const isValid = validateCredentials(credentials);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should return false for credentials with both empty fields', () => {
      // Arrange
      const credentials: Credentials = { username: '', password: '' };

      // Act
      const isValid = validateCredentials(credentials);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should return true for credentials with single character fields', () => {
      // Arrange
      const credentials: Credentials = { username: 'a', password: 'b' };

      // Act
      const isValid = validateCredentials(credentials);

      // Assert
      expect(isValid).toBe(true);
    });
  });

  describe('createMaskedCredentials', () => {
    it('should create masked credentials with original username', () => {
      // Arrange
      const original = createCredentials('john_doe', 'secret123');

      // Act
      const masked = createMaskedCredentials(original);

      // Assert
      expect(masked.username).toBe('john_doe');
      expect(masked.password).toBe('***');
    });

    it('should create immutable masked credentials', () => {
      // Arrange
      const original = createCredentials('john_doe', 'secret123');

      // Act
      const masked = createMaskedCredentials(original);

      // Assert
      expect(Object.isFrozen(masked)).toBe(true);
    });

    it('should handle credentials with special characters in username', () => {
      // Arrange
      const original = createCredentials(
        'john.doe+test@domain',
        'complex_password'
      );

      // Act
      const masked = createMaskedCredentials(original);

      // Assert
      expect(masked.username).toBe('john.doe+test@domain');
      expect(masked.password).toBe('***');
    });

    it('should not affect original credentials', () => {
      // Arrange
      const original = createCredentials('john_doe', 'secret123');

      // Act
      const masked = createMaskedCredentials(original);

      // Assert
      expect(original.username).toBe('john_doe');
      expect(original.password).toBe('secret123');
      expect(masked.username).toBe('john_doe');
      expect(masked.password).toBe('***');
    });
  });

  describe('areCredentialsEqual', () => {
    it('should return true for identical credentials', () => {
      // Arrange
      const cred1 = createCredentials('john_doe', 'secret123');
      const cred2 = createCredentials('john_doe', 'secret123');

      // Act
      const areEqual = areCredentialsEqual(cred1, cred2);

      // Assert
      expect(areEqual).toBe(true);
    });

    it('should return false for different usernames', () => {
      // Arrange
      const cred1 = createCredentials('john_doe', 'secret123');
      const cred2 = createCredentials('jane_doe', 'secret123');

      // Act
      const areEqual = areCredentialsEqual(cred1, cred2);

      // Assert
      expect(areEqual).toBe(false);
    });

    it('should return false for different passwords', () => {
      // Arrange
      const cred1 = createCredentials('john_doe', 'secret123');
      const cred2 = createCredentials('john_doe', 'different_password');

      // Act
      const areEqual = areCredentialsEqual(cred1, cred2);

      // Assert
      expect(areEqual).toBe(false);
    });

    it('should return false for different usernames and passwords', () => {
      // Arrange
      const cred1 = createCredentials('john_doe', 'secret123');
      const cred2 = createCredentials('jane_doe', 'different_password');

      // Act
      const areEqual = areCredentialsEqual(cred1, cred2);

      // Assert
      expect(areEqual).toBe(false);
    });

    it('should handle case sensitivity correctly', () => {
      // Arrange
      const cred1 = createCredentials('john_doe', 'Secret123');
      const cred2 = createCredentials('John_Doe', 'secret123');

      // Act
      const areEqual = areCredentialsEqual(cred1, cred2);

      // Assert
      expect(areEqual).toBe(false);
    });

    it('should compare masked credentials correctly', () => {
      // Arrange
      const original = createCredentials('john_doe', 'secret123');
      const masked1 = createMaskedCredentials(original);
      const masked2 = createMaskedCredentials(original);

      // Act
      const areEqual = areCredentialsEqual(masked1, masked2);

      // Assert
      expect(areEqual).toBe(true);
    });

    it('should return false when comparing original to masked', () => {
      // Arrange
      const original = createCredentials('john_doe', 'secret123');
      const masked = createMaskedCredentials(original);

      // Act
      const areEqual = areCredentialsEqual(original, masked);

      // Assert
      expect(areEqual).toBe(false);
    });

    it('should handle empty credentials comparison', () => {
      // Arrange
      const cred1: Credentials = { username: '', password: '' };
      const cred2: Credentials = { username: '', password: '' };

      // Act
      const areEqual = areCredentialsEqual(cred1, cred2);

      // Assert
      expect(areEqual).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should work with complete credentials workflow', () => {
      // Arrange
      const username = '  athlete@trainingpeaks.com  ';
      const password = 'MySecurePassword123!';

      // Act
      const credentials = createCredentials(username, password);
      const isValid = validateCredentials(credentials);
      const masked = createMaskedCredentials(credentials);
      const sameCredentials = createCredentials(
        'athlete@trainingpeaks.com',
        'MySecurePassword123!'
      );
      const areEqual = areCredentialsEqual(credentials, sameCredentials);

      // Assert
      expect(credentials.username).toBe('athlete@trainingpeaks.com');
      expect(credentials.password).toBe('MySecurePassword123!');
      expect(isValid).toBe(true);
      expect(masked.password).toBe('***');
      expect(areEqual).toBe(true);
    });

    it('should handle validation failure scenarios', () => {
      // Arrange
      const validCredentials = createCredentials('user', 'pass');
      const invalidUsername: Credentials = { username: '', password: 'valid' };
      const invalidPassword: Credentials = { username: 'valid', password: '' };

      // Act
      const validResult = validateCredentials(validCredentials);
      const invalidUsernameResult = validateCredentials(invalidUsername);
      const invalidPasswordResult = validateCredentials(invalidPassword);

      // Assert
      expect(validResult).toBe(true);
      expect(invalidUsernameResult).toBe(false);
      expect(invalidPasswordResult).toBe(false);
    });
  });
});
