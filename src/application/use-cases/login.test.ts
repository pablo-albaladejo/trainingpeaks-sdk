/**
 * Login Use Case Tests
 * Tests for the login use case following @unit-test-rule.mdc
 */

import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthTokenFixture, UserFixture } from '../../__fixtures__/auth.fixture';
import { randomNumber, randomString } from '../../__fixtures__/utils.fixture';
import { AuthRepository } from '../ports/auth';
import { createLoginUseCase, LoginRequest, LoginResponse } from './login';

describe('Login Use Case', () => {
  let mockAuthRepository: AuthRepository;
  let loginUseCase: ReturnType<typeof createLoginUseCase>;

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

    loginUseCase = createLoginUseCase(mockAuthRepository);
  });

  describe('execute', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const username = faker.internet.userName();
      const password = faker.internet.password();
      const request: LoginRequest = { username, password };

      const expectedToken = AuthTokenFixture.random();
      const expectedUser = UserFixture.random();
      const expectedResponse: LoginResponse = {
        token: expectedToken,
        user: expectedUser,
      };

      mockAuthRepository.authenticate = vi
        .fn()
        .mockResolvedValue(expectedToken);
      mockAuthRepository.getCurrentUser = vi
        .fn()
        .mockResolvedValue(expectedUser);

      // Act
      const result = await loginUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(mockAuthRepository.authenticate).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.authenticate).toHaveBeenCalledWith(
        expect.objectContaining({
          username,
          password,
        })
      );
      expect(mockAuthRepository.getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('should create credentials with username and password', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'testpassword';
      const request: LoginRequest = { username, password };

      const expectedToken = AuthTokenFixture.default();
      const expectedUser = UserFixture.default();
      const expectedResponse: LoginResponse = {
        token: expectedToken,
        user: expectedUser,
      };

      mockAuthRepository.authenticate = vi
        .fn()
        .mockResolvedValue(expectedToken);
      mockAuthRepository.getCurrentUser = vi
        .fn()
        .mockResolvedValue(expectedUser);

      // Act
      const result = await loginUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(mockAuthRepository.authenticate).toHaveBeenCalledWith(
        expect.objectContaining({
          username,
          password,
        })
      );
    });

    it('should handle repository errors correctly', async () => {
      // Arrange
      const username = faker.internet.userName();
      const password = faker.internet.password();
      const request: LoginRequest = { username, password };

      const expectedError = new Error('Authentication failed');
      mockAuthRepository.authenticate = vi
        .fn()
        .mockRejectedValue(expectedError);

      // Act & Assert
      await expect(loginUseCase.execute(request)).rejects.toThrow(
        'Authentication failed'
      );
      expect(mockAuthRepository.authenticate).toHaveBeenCalledTimes(1);
    });

    it('should work with empty credentials', async () => {
      // Arrange
      const request: LoginRequest = { username: '', password: '' };

      // Act & Assert
      await expect(loginUseCase.execute(request)).rejects.toThrow(
        'Username cannot be empty'
      );
    });

    it('should work with special characters in credentials', async () => {
      // Arrange
      const request: LoginRequest = {
        username: 'user@domain.com',
        password: 'P@ssw0rd!',
      };

      const expectedToken = new AuthTokenFixture()
        .withAccessToken('special-token')
        .build();
      const expectedUser = new UserFixture()
        .withName('user@domain.com')
        .build();
      const expectedResponse: LoginResponse = {
        token: expectedToken,
        user: expectedUser,
      };

      mockAuthRepository.authenticate = vi
        .fn()
        .mockResolvedValue(expectedToken);
      mockAuthRepository.getCurrentUser = vi
        .fn()
        .mockResolvedValue(expectedUser);

      // Act
      const result = await loginUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(mockAuthRepository.authenticate).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'user@domain.com',
          password: 'P@ssw0rd!',
        })
      );
    });

    it('should preserve token properties in response', async () => {
      // Arrange
      const request: LoginRequest = {
        username: 'testuser',
        password: 'testpassword',
      };

      const expectedToken = new AuthTokenFixture()
        .withAccessToken('access-123')
        .withRefreshToken('refresh-456')
        .withExpiresIn(7200)
        .withTokenType('Bearer')
        .build();
      const expectedUser = new UserFixture()
        .withId('123')
        .withName('Test User')
        .build();
      const expectedResponse: LoginResponse = {
        token: expectedToken,
        user: expectedUser,
      };

      mockAuthRepository.authenticate = vi
        .fn()
        .mockResolvedValue(expectedToken);
      mockAuthRepository.getCurrentUser = vi
        .fn()
        .mockResolvedValue(expectedUser);

      // Act
      const result = await loginUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(result.token.accessToken).toBe('access-123');
      expect(result.token.refreshToken).toBe('refresh-456');
      expect(result.token.tokenType).toBe('Bearer');
      expect(result.user.id).toBe('123');
      expect(result.user.name).toBe('Test User');
    });

    it('should handle random data correctly', async () => {
      // Arrange
      const request: LoginRequest = {
        username: randomString(randomNumber(5, 15)),
        password: randomString(randomNumber(8, 20)),
      };

      const expectedToken = AuthTokenFixture.random();
      const expectedUser = UserFixture.random();
      const expectedResponse: LoginResponse = {
        token: expectedToken,
        user: expectedUser,
      };

      mockAuthRepository.authenticate = vi
        .fn()
        .mockResolvedValue(expectedToken);
      mockAuthRepository.getCurrentUser = vi
        .fn()
        .mockResolvedValue(expectedUser);

      // Act
      const result = await loginUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(mockAuthRepository.authenticate).toHaveBeenCalledWith(
        expect.objectContaining({
          username: expect.any(String),
          password: expect.any(String),
        })
      );
      expect(mockAuthRepository.getCurrentUser).toHaveBeenCalledTimes(1);
    });
  });
});
