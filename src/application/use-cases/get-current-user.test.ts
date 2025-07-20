/**
 * Get Current User Use Case Tests
 * Tests for the get current user use case following @unit-test-rule.mdc
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserFixture } from '../../__fixtures__/auth.fixture';
import type { AuthRepository } from '../ports/auth';
import { createGetCurrentUserUseCase } from './get-current-user';

describe('Get Current User Use Case', () => {
  let mockAuthRepository: AuthRepository;
  let getCurrentUserUseCase: ReturnType<typeof createGetCurrentUserUseCase>;

  beforeEach(() => {
    // Arrange - Setup mocks with all required AuthRepository methods
    mockAuthRepository = {
      authenticate: vi.fn(),
      getCurrentUser: vi.fn(),
      refreshToken: vi.fn(),
      isAuthenticated: vi.fn(),
      getCurrentToken: vi.fn(),
      storeToken: vi.fn(),
      storeUser: vi.fn(),
      clearAuth: vi.fn(),
      getUserId: vi.fn(),
    };

    getCurrentUserUseCase = createGetCurrentUserUseCase(mockAuthRepository);
  });

  describe('execute', () => {
    it('should get current user successfully when authenticated', async () => {
      // Arrange
      const expectedUser = UserFixture.random();

      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthRepository.getCurrentUser = vi
        .fn()
        .mockResolvedValue(expectedUser);

      // Act
      const result = await getCurrentUserUseCase.execute();

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockAuthRepository.isAuthenticated).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('should throw error when not authenticated', async () => {
      // Arrange
      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(false);

      // Act & Assert
      await expect(getCurrentUserUseCase.execute()).rejects.toThrow(
        'No valid authentication token available'
      );
      expect(mockAuthRepository.isAuthenticated).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.getCurrentUser).not.toHaveBeenCalled();
    });

    it('should throw error when no current user found', async () => {
      // Arrange
      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthRepository.getCurrentUser = vi.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(getCurrentUserUseCase.execute()).rejects.toThrow(
        'No current user found'
      );
      expect(mockAuthRepository.isAuthenticated).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('should throw error when getCurrentUser returns undefined', async () => {
      // Arrange
      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthRepository.getCurrentUser = vi.fn().mockResolvedValue(undefined);

      // Act & Assert
      await expect(getCurrentUserUseCase.execute()).rejects.toThrow(
        'No current user found'
      );
      expect(mockAuthRepository.isAuthenticated).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors correctly', async () => {
      // Arrange
      const errorMessage = 'Repository error occurred';
      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthRepository.getCurrentUser = vi
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(getCurrentUserUseCase.execute()).rejects.toThrow(
        errorMessage
      );
      expect(mockAuthRepository.isAuthenticated).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('should return user with correct properties', async () => {
      // Arrange
      const expectedUser = new UserFixture()
        .withId('123')
        .withName('John Doe')
        .withAvatar('https://example.com/avatar.jpg')
        .build();

      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthRepository.getCurrentUser = vi
        .fn()
        .mockResolvedValue(expectedUser);

      // Act
      const result = await getCurrentUserUseCase.execute();

      // Assert
      expect(result).toEqual(expectedUser);
      expect(result.id).toBe('123');
      expect(result.name).toBe('John Doe');
      expect(result.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('should work with random user data', async () => {
      // Arrange
      const randomUser = UserFixture.random();
      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthRepository.getCurrentUser = vi.fn().mockResolvedValue(randomUser);

      // Act
      const result = await getCurrentUserUseCase.execute();

      // Assert
      expect(result).toEqual(randomUser);
      expect(result.id).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.avatar).toBeDefined();
    });

    it('should preserve user entity reference', async () => {
      // Arrange
      const user = UserFixture.default();
      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthRepository.getCurrentUser = vi.fn().mockResolvedValue(user);

      // Act
      const result = await getCurrentUserUseCase.execute();

      // Assert
      expect(result).toBe(user); // Should be exact same reference
      expect(mockAuthRepository.getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('should handle authentication check before getting user', async () => {
      // Arrange
      let isAuthenticatedCallCount = 0;
      let getCurrentUserCallCount = 0;

      mockAuthRepository.isAuthenticated = vi.fn().mockImplementation(() => {
        isAuthenticatedCallCount++;
        return true;
      });

      mockAuthRepository.getCurrentUser = vi
        .fn()
        .mockImplementation(async () => {
          getCurrentUserCallCount++;
          // Ensure isAuthenticated was called first
          expect(isAuthenticatedCallCount).toBe(1);
          return UserFixture.default();
        });

      // Act
      await getCurrentUserUseCase.execute();

      // Assert
      expect(isAuthenticatedCallCount).toBe(1);
      expect(getCurrentUserCallCount).toBe(1);
    });

    it('should not call getCurrentUser when not authenticated', async () => {
      // Arrange
      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(false);
      mockAuthRepository.getCurrentUser = vi.fn();

      // Act & Assert
      await expect(getCurrentUserUseCase.execute()).rejects.toThrow();
      expect(mockAuthRepository.getCurrentUser).not.toHaveBeenCalled();
    });
  });
});