/**
 * Logout Use Case Tests
 * Tests for the logout use case following @unit-test-rule.mdc
 */

import { AuthRepository } from '@/application/ports/auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createLogoutUseCase } from './logout';

describe('Logout Use Case', () => {
  let mockAuthRepository: AuthRepository;
  let logoutUseCase: ReturnType<typeof createLogoutUseCase>;

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

    logoutUseCase = createLogoutUseCase(mockAuthRepository);
  });

  describe('execute', () => {
    it('should logout successfully', async () => {
      // Arrange
      mockAuthRepository.clearAuth = vi.fn().mockResolvedValue(undefined);

      // Act
      await logoutUseCase.execute();

      // Assert
      expect(mockAuthRepository.clearAuth).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.clearAuth).toHaveBeenCalledWith();
    });

    it('should handle logout errors correctly', async () => {
      // Arrange
      const expectedError = new Error('Logout failed');
      mockAuthRepository.clearAuth = vi.fn().mockRejectedValue(expectedError);

      // Act & Assert
      await expect(logoutUseCase.execute()).rejects.toThrow('Logout failed');
      expect(mockAuthRepository.clearAuth).toHaveBeenCalledTimes(1);
    });

    it('should return false when logout fails', async () => {
      // Arrange
      const expectedError = new Error('Authentication service unavailable');
      mockAuthRepository.clearAuth = vi.fn().mockRejectedValue(expectedError);

      // Act & Assert
      await expect(logoutUseCase.execute()).rejects.toThrow(
        'Authentication service unavailable'
      );
      expect(mockAuthRepository.clearAuth).toHaveBeenCalledTimes(1);
    });

    it('should work without any parameters', async () => {
      // Arrange
      mockAuthRepository.clearAuth = vi.fn().mockResolvedValue(undefined);

      // Act
      await logoutUseCase.execute();

      // Assert
      expect(mockAuthRepository.clearAuth).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.clearAuth).toHaveBeenCalledWith();
    });

    it('should handle multiple logout calls', async () => {
      // Arrange
      mockAuthRepository.clearAuth = vi.fn().mockResolvedValue(undefined);

      // Act
      await logoutUseCase.execute();
      await logoutUseCase.execute();

      // Assert
      expect(mockAuthRepository.clearAuth).toHaveBeenCalledTimes(2);
    });
  });
});
