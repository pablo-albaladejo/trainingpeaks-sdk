/**
 * Login Use Case Tests
 * Tests for the login use case following @unit-test-rule.mdc
 */

import { faker } from '@faker-js/faker';
import { describe, expect, it, vi } from 'vitest';
import { executeLoginUseCase, LoginRequest, LoginResponse } from './login';

describe('Login Use Case', () => {
  describe('execute', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const username = faker.internet.userName();
      const password = faker.internet.password();
      const request: LoginRequest = {
        credentials: { username, password },
      };

      const expectedUser = {
        id: faker.string.uuid(),
        name: username,
      };

      const expectedResponse: LoginResponse = {
        success: true,
        user: expectedUser,
      };

      const mockLoginService = vi.fn().mockResolvedValue({
        token: {
          accessToken: faker.string.alphanumeric(32),
          tokenType: 'Bearer',
          expiresAt: new Date(Date.now() + 3600000),
        },
        user: expectedUser,
      });

      const mockGetCurrentUserService = vi.fn().mockResolvedValue(expectedUser);

      const loginUseCase = executeLoginUseCase(
        mockLoginService,
        mockGetCurrentUserService
      );

      // Act
      const result = await loginUseCase(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(mockLoginService).toHaveBeenCalledWith(
        expect.objectContaining({
          username,
          password,
        })
      );
      expect(mockGetCurrentUserService).toHaveBeenCalledTimes(1);
    });

    it('should return error when credentials are invalid', async () => {
      // Arrange
      const request: LoginRequest = {
        credentials: { username: '', password: '' },
      };

      const mockLoginService = vi
        .fn()
        .mockRejectedValue(new Error('Invalid credentials'));
      const mockGetCurrentUserService = vi.fn().mockResolvedValue(null);

      const loginUseCase = executeLoginUseCase(
        mockLoginService,
        mockGetCurrentUserService
      );

      // Act
      const result = await loginUseCase(request);

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Invalid credentials',
      });
    });

    it('should return error when authentication fails', async () => {
      // Arrange
      const request: LoginRequest = {
        credentials: { username: 'user', password: 'pass' },
      };

      const mockLoginService = vi
        .fn()
        .mockRejectedValue(new Error('Auth failed'));
      const mockGetCurrentUserService = vi.fn().mockResolvedValue(null);

      const loginUseCase = executeLoginUseCase(
        mockLoginService,
        mockGetCurrentUserService
      );

      // Act
      const result = await loginUseCase(request);

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Auth failed',
      });
    });

    it('should return error when user retrieval fails', async () => {
      // Arrange
      const request: LoginRequest = {
        credentials: { username: 'user', password: 'pass' },
      };

      const mockLoginService = vi.fn().mockResolvedValue({
        token: {
          accessToken: faker.string.alphanumeric(32),
          tokenType: 'Bearer',
          expiresAt: new Date(Date.now() + 3600000),
        },
        user: { id: '1', name: 'User' },
      });
      const mockGetCurrentUserService = vi.fn().mockResolvedValue(null);

      const loginUseCase = executeLoginUseCase(
        mockLoginService,
        mockGetCurrentUserService
      );

      // Act
      const result = await loginUseCase(request);

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Failed to retrieve user information',
      });
    });
  });
});
