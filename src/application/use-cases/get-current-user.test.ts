/**
 * Get Current User Use Case Tests
 * Tests for the get current user use case following @unit-test-rule.mdc
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userBuilder } from '../../__fixtures__/auth.fixture';
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
    it('should get current user successfully', async () => {
      // Arrange
      const expectedUser = userBuilder.build();

      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthRepository.getCurrentUser = vi
        .fn()
        .mockResolvedValue(expectedUser);

      // Act
      const result = await getCurrentUserUseCase.execute();

      // Assert
      expect(result).toStrictEqual(expectedUser);
      expect(mockAuthRepository.isAuthenticated).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors correctly', async () => {
      // Arrange
      const expectedError = new Error('Failed to get current user');

      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthRepository.getCurrentUser = vi
        .fn()
        .mockRejectedValue(expectedError);

      // Act & Assert
      await expect(getCurrentUserUseCase.execute()).rejects.toThrow(
        'Failed to get current user'
      );
      expect(mockAuthRepository.isAuthenticated).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('should handle null user response', async () => {
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

    it('should handle undefined user response', async () => {
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

    it('should preserve user properties in response', async () => {
      // Arrange
      const expectedUser = userBuilder.build({
        id: '123',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        timezone: 'UTC',
        units: 'metric',
        language: 'en',
        theme: 'light',
        notifications: true,
      });

      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthRepository.getCurrentUser = vi
        .fn()
        .mockResolvedValue(expectedUser);

      // Act
      const result = await getCurrentUserUseCase.execute();

      // Assert
      expect(result).toStrictEqual(expectedUser);
      expect(result?.id).toBe('123');
      expect(result?.name).toBe('Test User');
      expect(result?.avatar).toBe('https://example.com/avatar.jpg');
      expect(result?.preferences.timezone).toBe('UTC');
      expect(result?.preferences.units).toBe('metric');
      expect(result?.preferences.language).toBe('en');
      expect(result?.preferences.theme).toBe('light');
      expect(result?.preferences.notifications).toBe(true);
    });

    it('should work with minimal user data', async () => {
      // Arrange
      const expectedUser = userBuilder.build({
        id: 'minimal-user',
        name: 'Minimal User',
      });

      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthRepository.getCurrentUser = vi
        .fn()
        .mockResolvedValue(expectedUser);

      // Act
      const result = await getCurrentUserUseCase.execute();

      // Assert
      expect(result).toStrictEqual(expectedUser);
      expect(result?.id).toBe('minimal-user');
      expect(result?.name).toBe('Minimal User');
    });

    it('should work with random user data', async () => {
      // Arrange
      const randomUser = userBuilder.build();

      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthRepository.getCurrentUser = vi.fn().mockResolvedValue(randomUser);

      // Act
      const result = await getCurrentUserUseCase.execute();

      // Assert
      expect(result).toStrictEqual(randomUser);
      expect(result?.id).toBeDefined();
      expect(result?.name).toBeDefined();
      expect(result?.avatar).toBeDefined();
      expect(result?.preferences).toBeDefined();
    });

    it('should handle authentication errors gracefully', async () => {
      // Arrange
      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(false);

      // Act & Assert
      await expect(getCurrentUserUseCase.execute()).rejects.toThrow(
        'No valid authentication token available'
      );
      expect(mockAuthRepository.isAuthenticated).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.getCurrentUser).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      // Arrange
      const networkError = new Error('Network timeout');

      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthRepository.getCurrentUser = vi
        .fn()
        .mockRejectedValue(networkError);

      // Act & Assert
      await expect(getCurrentUserUseCase.execute()).rejects.toThrow(
        'Network timeout'
      );
      expect(mockAuthRepository.isAuthenticated).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('should return user with default preferences when not set', async () => {
      // Arrange
      const user = userBuilder.build();
      // Remove preferences to test default behavior
      const userWithoutPreferences = { ...user, preferences: undefined };

      mockAuthRepository.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthRepository.getCurrentUser = vi
        .fn()
        .mockResolvedValue(userWithoutPreferences);

      // Act
      const result = await getCurrentUserUseCase.execute();

      // Assert
      expect(result).toStrictEqual(userWithoutPreferences);
      expect(result?.preferences).toBeUndefined();
    });
  });
});
