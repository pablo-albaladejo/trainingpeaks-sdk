/**
 * Authenticate User Service Tests
 * Tests for the authentication service adapter implementation
 */

import { describe, expect, it, vi } from 'vitest';

import {
  authTokenBuilder,
  credentialsBuilder,
  sessionBuilder,
  userBuilder,
} from '@/__fixtures__/auth.fixture';
import type { TrainingPeaksRepository } from '@/application/ports/trainingpeaks-repository';

import { authenticateUserService } from './authenticate-user';

describe('Authenticate User Service', () => {
  describe('authenticateUserService', () => {
    it('should authenticate user successfully', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build({
        username: 'athlete@trainingpeaks.com',
        password: 'securePassword123',
      });

      // Create consistent objects using builders
      const expectedUser = userBuilder.build({
        id: 'authenticated_user',
        name: 'Authenticated Athlete',
      });
      const expectedAuthToken = authTokenBuilder.build({
        accessToken: 'auth_access_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      });
      const expectedSession = sessionBuilder.build({
        token: expectedAuthToken,
        user: expectedUser,
      });

      const mockRepository: TrainingPeaksRepository = {
        login: vi.fn().mockResolvedValue(expectedSession),
        logout: vi.fn(),
      };

      // Act
      const authenticateUser = authenticateUserService(mockRepository);
      const result = await authenticateUser(mockCredentials);

      // Assert
      expect(result).toEqual(expectedSession);
      expect(mockRepository.login).toHaveBeenCalledWith(mockCredentials);
      expect(mockRepository.login).toHaveBeenCalledTimes(1);
    });

    it('should propagate repository login errors', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build({
        username: 'invalid@example.com',
        password: 'wrongPassword',
      });

      const authError = new Error('Invalid credentials');
      const mockRepository: TrainingPeaksRepository = {
        login: vi.fn().mockRejectedValue(authError),
        logout: vi.fn(),
      };

      // Act & Assert
      const authenticateUser = authenticateUserService(mockRepository);
      await expect(authenticateUser(mockCredentials)).rejects.toThrow(
        'Invalid credentials'
      );
      expect(mockRepository.login).toHaveBeenCalledWith(mockCredentials);
    });

    it('should handle network errors from repository', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build();
      const networkError = new Error('Network connection failed');
      const mockRepository: TrainingPeaksRepository = {
        login: vi.fn().mockRejectedValue(networkError),
        logout: vi.fn(),
      };

      // Act & Assert
      const authenticateUser = authenticateUserService(mockRepository);
      await expect(authenticateUser(mockCredentials)).rejects.toThrow(
        'Network connection failed'
      );
    });

    it('should handle different credential formats', async () => {
      // Arrange
      const emailCredentials = credentialsBuilder.build({
        username: 'user@trainingpeaks.com',
        password: 'emailPassword',
      });

      const usernameCredentials = credentialsBuilder.build({
        username: 'athlete_username',
        password: 'usernamePassword',
      });

      // Create consistent sessions using builders
      const emailUser = userBuilder.build({
        id: 'email_user',
        name: 'Email User',
      });
      const emailAuthToken = authTokenBuilder.build({
        accessToken: 'email_token',
      });
      const emailSession = sessionBuilder.build({
        token: emailAuthToken,
        user: emailUser,
      });

      const usernameUser = userBuilder.build({
        id: 'username_user',
        name: 'Username User',
      });
      const usernameAuthToken = authTokenBuilder.build({
        accessToken: 'username_token',
      });
      const usernameSession = sessionBuilder.build({
        token: usernameAuthToken,
        user: usernameUser,
      });

      const mockRepository: TrainingPeaksRepository = {
        login: vi
          .fn()
          .mockResolvedValueOnce(emailSession)
          .mockResolvedValueOnce(usernameSession),
        logout: vi.fn(),
      };

      // Act
      const authenticateUser = authenticateUserService(mockRepository);
      const emailResult = await authenticateUser(emailCredentials);
      const usernameResult = await authenticateUser(usernameCredentials);

      // Assert
      expect(emailResult).toEqual(emailSession);
      expect(usernameResult).toEqual(usernameSession);
      expect(mockRepository.login).toHaveBeenCalledWith(emailCredentials);
      expect(mockRepository.login).toHaveBeenCalledWith(usernameCredentials);
      expect(mockRepository.login).toHaveBeenCalledTimes(2);
    });

    it('should return complete session data', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build();
      // Create consistent complete session using builders
      const completeAuthToken = authTokenBuilder.build({
        accessToken: 'complete_access_token',
        tokenType: 'JWT',
        expiresIn: 7200,
        refreshToken: 'complete_refresh_token',
        scope: 'read write admin',
      });
      const completeSession = sessionBuilder.build({
        token: completeAuthToken,
        user: userBuilder.build({
          id: 'complete_user_id',
          name: 'Complete User Profile',
          avatar: 'https://trainingpeaks.com/avatars/complete.jpg',
          preferences: {
            timezone: 'America/Denver',
            language: 'en-US',
            units: 'imperial',
            theme: 'dark',
            notifications: true,
          },
        }),
      });

      const mockRepository: TrainingPeaksRepository = {
        login: vi.fn().mockResolvedValue(completeSession),
        logout: vi.fn(),
      };

      // Act
      const authenticateUser = authenticateUserService(mockRepository);
      const result = await authenticateUser(mockCredentials);

      // Assert
      expect(result).toEqual(completeSession);
      expect(result.token.accessToken).toBe('complete_access_token');
      expect(result.token.refreshToken).toBe('complete_refresh_token');
      expect(result.user.name).toBe('Complete User Profile');
      expect(result.user.preferences?.timezone).toBe('America/Denver');
    });

    it('should maintain proper function signature', () => {
      // Arrange
      const mockRepository: TrainingPeaksRepository = {
        login: vi.fn(),
        logout: vi.fn(),
      };

      // Act
      const authenticateUser = authenticateUserService(mockRepository);

      // Assert
      expect(typeof authenticateUser).toBe('function');
      expect(authenticateUser).toHaveLength(1); // Takes one parameter (credentials)
    });

    it('should support dependency injection', () => {
      // Arrange
      // Create consistent objects using builders
      const repo1User = userBuilder.build({
        id: 'user1',
        name: 'Repo1 User',
      });
      const repo1AuthToken = authTokenBuilder.build({
        accessToken: 'repo1_token',
      });
      const repository1: TrainingPeaksRepository = {
        login: vi.fn().mockResolvedValue(
          sessionBuilder.build({
            token: repo1AuthToken,
            user: repo1User,
          })
        ),
        logout: vi.fn(),
      };

      const repo2User = userBuilder.build({
        id: 'user2',
        name: 'Repo2 User',
      });
      const repo2AuthToken = authTokenBuilder.build({
        accessToken: 'repo2_token',
      });
      const repository2: TrainingPeaksRepository = {
        login: vi.fn().mockResolvedValue(
          sessionBuilder.build({
            token: repo2AuthToken,
            user: repo2User,
          })
        ),
        logout: vi.fn(),
      };

      // Act
      const authenticateUser1 = authenticateUserService(repository1);
      const authenticateUser2 = authenticateUserService(repository2);

      // Assert
      expect(authenticateUser1).not.toBe(authenticateUser2);
      expect(typeof authenticateUser1).toBe('function');
      expect(typeof authenticateUser2).toBe('function');
    });

    it('should handle async operations correctly', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build();
      // Create consistent session using builders
      const asyncUser = userBuilder.build({
        id: 'user123',
        name: 'Async User',
      });
      const asyncAuthToken = authTokenBuilder.build({
        accessToken: 'async_token',
      });
      const mockSession = sessionBuilder.build({
        token: asyncAuthToken,
        user: asyncUser,
      });

      // Simulate delayed repository response
      const mockRepository: TrainingPeaksRepository = {
        login: vi.fn().mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(() => resolve(mockSession), 10);
            })
        ),
        logout: vi.fn(),
      };

      // Act
      const authenticateUser = authenticateUserService(mockRepository);
      const startTime = Date.now();
      const result = await authenticateUser(mockCredentials);
      const endTime = Date.now();

      // Assert
      expect(result).toEqual(mockSession);
      expect(endTime - startTime).toBeGreaterThanOrEqual(9); // Allow for timing variations
      expect(mockRepository.login).toHaveBeenCalledWith(mockCredentials);
    });
  });

  describe('Service Layer Behavior', () => {
    it('should act as a thin adapter layer', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build();
      // Create consistent session using builders
      const adapterUser = userBuilder.build({
        id: 'user123',
        name: 'Adapter User',
      });
      const adapterAuthToken = authTokenBuilder.build({
        accessToken: 'adapter_token',
      });
      const mockSession = sessionBuilder.build({
        token: adapterAuthToken,
        user: adapterUser,
      });

      const mockRepository: TrainingPeaksRepository = {
        login: vi.fn().mockResolvedValue(mockSession),
        logout: vi.fn(),
      };

      // Act
      const authenticateUser = authenticateUserService(mockRepository);
      const result = await authenticateUser(mockCredentials);

      // Assert
      // Service should just delegate to repository without transformation
      expect(result).toEqual(mockSession);
      expect(mockRepository.login).toHaveBeenCalledWith(mockCredentials);
      expect(mockRepository.login).toHaveBeenCalledTimes(1);
    });

    it('should not modify credentials before passing to repository', async () => {
      // Arrange
      const originalCredentials = credentialsBuilder.build({
        username: 'original@example.com',
        password: 'originalPassword',
      });

      // Create consistent session using builders
      const credentialsUser = userBuilder.build({
        id: 'user123',
        name: 'Credentials User',
      });
      const credentialsAuthToken = authTokenBuilder.build({
        accessToken: 'credentials_token',
      });
      const mockSession = sessionBuilder.build({
        token: credentialsAuthToken,
        user: credentialsUser,
      });

      const mockRepository: TrainingPeaksRepository = {
        login: vi.fn().mockImplementation((credentials) => {
          // Verify credentials are passed unchanged
          expect(credentials).toEqual(originalCredentials);
          return Promise.resolve(mockSession);
        }),
        logout: vi.fn(),
      };

      // Act
      const authenticateUser = authenticateUserService(mockRepository);
      await authenticateUser(originalCredentials);

      // Assert
      expect(mockRepository.login).toHaveBeenCalledWith(originalCredentials);
    });

    it('should not modify session data from repository', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build();
      // Create consistent session using builders
      const originalUser = userBuilder.build({
        id: 'original_user',
        name: 'Original User',
      });
      const originalAuthToken = authTokenBuilder.build({
        accessToken: 'original_token',
      });
      const originalSession = sessionBuilder.build({
        token: originalAuthToken,
        user: originalUser,
      });

      const mockRepository: TrainingPeaksRepository = {
        login: vi.fn().mockResolvedValue(originalSession),
        logout: vi.fn(),
      };

      // Act
      const authenticateUser = authenticateUserService(mockRepository);
      const result = await authenticateUser(mockCredentials);

      // Assert
      expect(result).toEqual(originalSession);
      expect(result.token.accessToken).toBe('original_token');
      expect(result.user.name).toBe('Original User');
    });
  });

  describe('Error Scenarios and Edge Cases', () => {
    it('should handle repository throwing non-Error objects', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build();
      const mockRepository: TrainingPeaksRepository = {
        login: vi.fn().mockRejectedValue('String error'),
        logout: vi.fn(),
      };

      // Act & Assert
      const authenticateUser = authenticateUserService(mockRepository);
      await expect(authenticateUser(mockCredentials)).rejects.toBe(
        'String error'
      );
    });

    it('should handle repository returning null or undefined', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build();
      const mockRepository: TrainingPeaksRepository = {
        login: vi.fn().mockResolvedValue(null),
        logout: vi.fn(),
      };

      // Act
      const authenticateUser = authenticateUserService(mockRepository);
      const result = await authenticateUser(mockCredentials);

      // Assert
      expect(result).toBeNull();
      expect(mockRepository.login).toHaveBeenCalledWith(mockCredentials);
    });

    it('should handle multiple concurrent authentication attempts', async () => {
      // Arrange
      const credentials1 = credentialsBuilder.build({
        username: 'user1@example.com',
        password: 'password1',
      });
      const credentials2 = credentialsBuilder.build({
        username: 'user2@example.com',
        password: 'password2',
      });

      // Create consistent sessions using builders only
      const authToken1 = authTokenBuilder.build({
        accessToken: 'token1',
      });
      const user1 = userBuilder.build({
        id: 'user1',
        name: 'User 1',
      });
      const session1 = sessionBuilder.build({
        token: authToken1,
        user: user1,
      });

      const authToken2 = authTokenBuilder.build({
        accessToken: 'token2',
      });
      const user2 = userBuilder.build({
        id: 'user2',
        name: 'User 2',
      });
      const session2 = sessionBuilder.build({
        token: authToken2,
        user: user2,
      });

      const mockRepository: TrainingPeaksRepository = {
        login: vi.fn().mockImplementation((creds: { username: string }) => {
          if (creds.username === 'user1@example.com') {
            return Promise.resolve(session1);
          }
          if (creds.username === 'user2@example.com') {
            return Promise.resolve(session2);
          }
          return Promise.resolve(session2); // default
        }),
        logout: vi.fn(),
      };

      // Act
      const authenticateUser = authenticateUserService(mockRepository);
      const [result1, result2] = await Promise.all([
        authenticateUser(credentials1),
        authenticateUser(credentials2),
      ]);

      // Assert
      expect(result1).toEqual(session1);
      expect(result2).toEqual(session2);
      expect(mockRepository.login).toHaveBeenCalledTimes(2);
    });

    it('should handle repository timeout scenarios', async () => {
      // Arrange
      const mockCredentials = credentialsBuilder.build();
      const timeoutError = new Error('Request timeout after 30s');
      const mockRepository: TrainingPeaksRepository = {
        login: vi.fn().mockRejectedValue(timeoutError),
        logout: vi.fn(),
      };

      // Act & Assert
      const authenticateUser = authenticateUserService(mockRepository);
      await expect(authenticateUser(mockCredentials)).rejects.toThrow(
        'Request timeout after 30s'
      );
    });
  });

  describe('Integration Scenarios', () => {
    it('should support real authentication workflow', async () => {
      // Arrange - Simulate real TrainingPeaks authentication
      const athleteCredentials = credentialsBuilder.build({
        username: 'pro.athlete@trainingpeaks.com',
        password: 'TrainingPeaks2024!',
      });

      // Create consistent athlete session using hybrid approach
      const athleteAuthToken = authTokenBuilder.build({
        accessToken: 'tp_access_token_abc123def456',
        expiresIn: 3600,
        expires: new Date(Date.now() + 3600000),
        refreshToken: 'tp_refresh_token_xyz789',
        scope: 'athlete:read athlete:write workouts:read',
      });
      const athleteSession = sessionBuilder.build({
        token: athleteAuthToken,
        user: userBuilder.build({
          id: 'tp_athlete_12345',
          name: 'Pro Athlete',
          avatar:
            'https://trainingpeaks-prod.s3.amazonaws.com/avatars/12345/large.jpg',
          preferences: {
            timezone: 'America/Boulder',
            units: 'imperial',
            language: 'en-US',
            autoSync: true,
            privateProfile: false,
          },
        }),
      });

      const mockRepository: TrainingPeaksRepository = {
        login: vi.fn().mockResolvedValue(athleteSession),
        logout: vi.fn(),
      };

      // Act - Execute authentication service
      const authenticateUser = authenticateUserService(mockRepository);
      const sessionResult = await authenticateUser(athleteCredentials);

      // Assert - Verify complete authentication result
      expect(sessionResult.token.accessToken).toBe(
        'tp_access_token_abc123def456'
      );
      expect(sessionResult.token.scope).toBe(
        'athlete:read athlete:write workouts:read'
      );
      expect(sessionResult.user.name).toBe('Pro Athlete');
      expect(sessionResult.user.preferences?.timezone).toBe('America/Boulder');
      expect(mockRepository.login).toHaveBeenCalledWith(athleteCredentials);
    });

    it('should handle service composition with higher-level use cases', async () => {
      // Arrange - Simulate service being used by use case
      const mockCredentials = credentialsBuilder.build();
      // Create consistent session using builders
      const compositionUser = userBuilder.build({
        id: 'user123',
        name: 'Composition User',
      });
      const compositionAuthToken = authTokenBuilder.build({
        accessToken: 'composition_token',
      });
      const mockSession = sessionBuilder.build({
        token: compositionAuthToken,
        user: compositionUser,
      });

      const mockRepository: TrainingPeaksRepository = {
        login: vi.fn().mockResolvedValue(mockSession),
        logout: vi.fn(),
      };

      // Act - Create service and use it as dependency
      const authenticateUser = authenticateUserService(mockRepository);

      // Simulate use case calling the service
      const useCaseResult = await authenticateUser(mockCredentials);

      // Assert - Service should integrate seamlessly
      expect(useCaseResult).toEqual(mockSession);
      expect(mockRepository.login).toHaveBeenCalledWith(mockCredentials);
    });
  });
});
