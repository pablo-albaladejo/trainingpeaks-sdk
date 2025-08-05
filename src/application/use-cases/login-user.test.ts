/**
 * Login User Use Case Tests
 * Tests for the login user use case orchestration
 */

import { describe, expect, it, vi } from 'vitest';

import {
  authTokenBuilder,
  credentialsBuilder,
  sessionBuilder,
  userBuilder,
} from '@/__fixtures__/auth.fixture';
import type { AuthenticateUser } from '@/application/services/authenticate-user';

import { executeLoginUserUseCase } from './login-user';

describe('Login User Use Case', () => {
  describe('executeLoginUserUseCase', () => {
    it('should execute login successfully with valid credentials', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build({
        username: 'test@example.com',
        password: 'password123',
      });

      const expectedSession = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'login_access_token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-12-31T23:59:59.000Z'),
        }),
        user: userBuilder.build({
          id: 'user123',
          name: 'Test User',
        }),
      });

      const mockAuthenticateUser: AuthenticateUser = vi
        .fn()
        .mockResolvedValue(expectedSession);

      // Act
      const loginUseCase = executeLoginUserUseCase(mockAuthenticateUser);
      const result = await loginUseCase(mockCredentials);

      // Assert
      expect(result).toEqual(expectedSession);
      expect(mockAuthenticateUser).toHaveBeenCalledWith(mockCredentials);
      expect(mockAuthenticateUser).toHaveBeenCalledTimes(1);
    });

    it('should handle authentication failure', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build({
        username: 'invalid@example.com',
        password: 'wrongpassword',
      });

      const authError = new Error('Authentication failed');
      const mockAuthenticateUser: AuthenticateUser = vi
        .fn()
        .mockRejectedValue(authError);

      // Act & Assert
      const loginUseCase = executeLoginUserUseCase(mockAuthenticateUser);
      await expect(loginUseCase(mockCredentials)).rejects.toThrow(
        'Authentication failed'
      );
      expect(mockAuthenticateUser).toHaveBeenCalledWith(mockCredentials);
    });

    it('should propagate authentication service errors', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build();
      const customError = new Error('Network timeout');
      const mockAuthenticateUser: AuthenticateUser = vi
        .fn()
        .mockRejectedValue(customError);

      // Act & Assert
      const loginUseCase = executeLoginUserUseCase(mockAuthenticateUser);
      await expect(loginUseCase(mockCredentials)).rejects.toThrow(
        'Network timeout'
      );
    });

    it('should handle different credential formats', async () => {
      // Arrange
      const emailCredentials = credentialsBuilder.build({
        username: 'user@trainingpeaks.com',
        password: 'secure_password',
      });

      const usernameCredentials = credentialsBuilder.build({
        username: 'athlete_username',
        password: 'another_password',
      });

      const expectedSession = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'test_token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-12-31T23:59:59.000Z'),
        }),
        user: userBuilder.build({
          id: 'user123',
          name: 'Test User',
        }),
      });

      const mockAuthenticateUser: AuthenticateUser = vi
        .fn()
        .mockResolvedValue(expectedSession);

      // Act
      const loginUseCase = executeLoginUserUseCase(mockAuthenticateUser);

      await loginUseCase(emailCredentials);
      await loginUseCase(usernameCredentials);

      // Assert
      expect(mockAuthenticateUser).toHaveBeenCalledWith(emailCredentials);
      expect(mockAuthenticateUser).toHaveBeenCalledWith(usernameCredentials);
      expect(mockAuthenticateUser).toHaveBeenCalledTimes(2);
    });

    it('should return complete session data', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build();
      const completeSession = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'complete_access_token',
          tokenType: 'JWT',
          expiresIn: 7200,
          expires: new Date('2024-12-31T23:59:59.000Z'),
          refreshToken: 'complete_refresh_token',
        }),
        user: userBuilder.build({
          id: 'complete_user',
          name: 'Complete User Profile',
          avatar: 'https://trainingpeaks.com/avatar/complete.jpg',
          preferences: {
            timezone: 'America/Denver',
            language: 'en-US',
            units: 'imperial',
            theme: 'dark',
          },
        }),
      });

      const mockAuthenticateUser: AuthenticateUser = vi
        .fn()
        .mockResolvedValue(completeSession);

      // Act
      const loginUseCase = executeLoginUserUseCase(mockAuthenticateUser);
      const result = await loginUseCase(mockCredentials);

      // Assert
      expect(result).toEqual(completeSession);
      expect(result.token.accessToken).toBe('complete_access_token');
      expect(result.token.refreshToken).toBe('complete_refresh_token');
      expect(result.user.name).toBe('Complete User Profile');
      expect(result.user.preferences?.timezone).toBe('America/Denver');
    });

    it('should maintain type safety for function composition', () => {
      // Arrange
      const mockAuthenticateUser: AuthenticateUser = vi.fn();

      // Act
      const loginUseCase = executeLoginUserUseCase(mockAuthenticateUser);

      // Assert
      expect(typeof loginUseCase).toBe('function');
      expect(loginUseCase).toHaveLength(1); // Takes one parameter (credentials)
    });

    it('should handle async operations correctly', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build();
      const mockSession = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'async_token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-12-31T23:59:59.000Z'),
        }),
        user: userBuilder.build({
          id: 'user123',
          name: 'Async User',
        }),
      });

      // Simulate delayed authentication
      const mockAuthenticateUser: AuthenticateUser = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockSession), 10);
          })
      );

      // Act
      const loginUseCase = executeLoginUserUseCase(mockAuthenticateUser);
      const startTime = Date.now();
      const result = await loginUseCase(mockCredentials);
      const endTime = Date.now();

      // Assert
      expect(result).toEqual(mockSession);
      expect(endTime - startTime).toBeGreaterThanOrEqual(9); // Allow for timing variations
      expect(mockAuthenticateUser).toHaveBeenCalledWith(mockCredentials);
    });

    it('should work with different authenticate user implementations', async () => {
      // Arrange - Create credentials with specific username to test logic
      const mockCredentials = credentialsBuilder.build({
        username: 'test@example.com',
        password: 'password123',
      });

      // Create consistent sessions using sessionBuilder
      const simpleSession = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'simple_token',
        }),
        user: userBuilder.build({
          id: 'user1',
          name: 'Simple User',
        }),
      });

      const emailSession = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'email_token',
        }),
        user: userBuilder.build({
          id: 'user2',
          name: 'Email User',
        }),
      });

      // Implementation 1: Simple success
      const simpleAuth: AuthenticateUser = vi
        .fn()
        .mockResolvedValue(simpleSession);

      // Implementation 2: Complex validation based on credential username
      const complexAuth: AuthenticateUser = vi
        .fn()
        .mockImplementation((creds: { username: string }) => {
          if (creds.username === 'test@example.com') {
            return emailSession;
          }
          return simpleSession; // fallback
        });

      // Act
      const simpleUseCase = executeLoginUserUseCase(simpleAuth);
      const complexUseCase = executeLoginUserUseCase(complexAuth);

      const simpleResult = await simpleUseCase(mockCredentials);
      const complexResult = await complexUseCase(mockCredentials);

      // Assert
      expect(simpleResult.token.accessToken).toBe('simple_token');
      expect(complexResult.token.accessToken).toBe('email_token'); // Credentials have email format
    });
  });

  describe('Use Case Orchestration', () => {
    it('should act as pure orchestration function', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build();
      const mockSession = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'orchestration_token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-12-31T23:59:59.000Z'),
        }),
        user: userBuilder.build({
          id: 'user123',
          name: 'Orchestration User',
        }),
      });

      const mockAuthenticateUser: AuthenticateUser = vi
        .fn()
        .mockResolvedValue(mockSession);

      // Act
      const loginUseCase = executeLoginUserUseCase(mockAuthenticateUser);
      const result = await loginUseCase(mockCredentials);

      // Assert
      // Use case should just orchestrate, not add business logic
      expect(result).toEqual(mockSession);
      expect(mockAuthenticateUser).toHaveBeenCalledWith(mockCredentials);
      expect(mockAuthenticateUser).toHaveBeenCalledTimes(1);
    });

    it('should support dependency injection pattern', () => {
      // Arrange
      const mockAuthenticateUser1: AuthenticateUser = vi.fn();
      const mockAuthenticateUser2: AuthenticateUser = vi.fn();

      // Act
      const useCase1 = executeLoginUserUseCase(mockAuthenticateUser1);
      const useCase2 = executeLoginUserUseCase(mockAuthenticateUser2);

      // Assert
      expect(useCase1).not.toBe(useCase2);
      expect(typeof useCase1).toBe('function');
      expect(typeof useCase2).toBe('function');
    });

    it('should maintain referential transparency', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build();
      const mockSession = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'transparent_token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-12-31T23:59:59.000Z'),
        }),
        user: userBuilder.build({
          id: 'user123',
          name: 'Transparent User',
        }),
      });

      const mockAuthenticateUser: AuthenticateUser = vi
        .fn()
        .mockResolvedValue(mockSession);

      // Act
      const loginUseCase = executeLoginUserUseCase(mockAuthenticateUser);
      const result1 = await loginUseCase(mockCredentials);
      const result2 = await loginUseCase(mockCredentials);

      // Assert
      expect(result1).toEqual(result2);
      expect(mockAuthenticateUser).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration Scenarios', () => {
    it('should support typical login flow integration', async () => {
      // Arrange - Simulate real login scenario
      const userCredentials = credentialsBuilder.build({
        username: 'athlete@trainingpeaks.com',
        password: 'MySecurePassword123!',
      });

      const loginSession = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'real_access_token_here',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date(Date.now() + 3600000),
          refreshToken: 'real_refresh_token_here',
        }),
        user: userBuilder.build({
          id: 'tp_user_12345',
          name: 'TrainingPeaks Athlete',
          avatar: 'https://trainingpeaks.com/avatars/12345.jpg',
          preferences: {
            timezone: 'America/Boulder',
            units: 'imperial',
            language: 'en-US',
          },
        }),
      });

      const mockAuthenticateUser: AuthenticateUser = vi
        .fn()
        .mockResolvedValue(loginSession);

      // Act - Execute complete login flow
      const loginUseCase = executeLoginUserUseCase(mockAuthenticateUser);
      const sessionResult = await loginUseCase(userCredentials);

      // Assert - Verify complete session data
      expect(sessionResult.token.accessToken).toBe('real_access_token_here');
      expect(sessionResult.user.name).toBe('TrainingPeaks Athlete');
      expect(sessionResult.user.preferences?.timezone).toBe('America/Boulder');
      expect(mockAuthenticateUser).toHaveBeenCalledWith(userCredentials);
    });

    it('should handle concurrent login attempts', async () => {
      // Arrange
      const credentials1 = credentialsBuilder.build({
        username: 'user1@example.com',
      });
      const credentials2 = credentialsBuilder.build({
        username: 'user2@example.com',
      });

      const session1 = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'token1',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-12-31T23:59:59.000Z'),
        }),
        user: userBuilder.build({ id: 'user1', name: 'User 1' }),
      });

      const session2 = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'token2',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-12-31T23:59:59.000Z'),
        }),
        user: userBuilder.build({ id: 'user2', name: 'User 2' }),
      });

      const mockAuthenticateUser: AuthenticateUser = vi
        .fn()
        .mockResolvedValueOnce(session1)
        .mockResolvedValueOnce(session2);

      // Act
      const loginUseCase = executeLoginUserUseCase(mockAuthenticateUser);
      const [result1, result2] = await Promise.all([
        loginUseCase(credentials1),
        loginUseCase(credentials2),
      ]);

      // Assert
      expect(result1.user.name).toBe('User 1');
      expect(result2.user.name).toBe('User 2');
      expect(mockAuthenticateUser).toHaveBeenCalledTimes(2);
    });
  });
});
