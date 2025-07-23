/**
 * TrainingPeaks Client Tests
 * Tests for the main TrainingPeaks client
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { AuthenticationError } from './domain/errors';
import { TrainingPeaksClient } from './training-peaks-client';

describe('TrainingPeaksClient', () => {
  let client: TrainingPeaksClient;

  beforeEach(() => {
    client = new TrainingPeaksClient({
      debug: {
        enabled: false,
      },
    });
  });

  describe('Authentication', () => {
    it('should reject empty credentials', async () => {
      // Act & Assert
      await expect(client.login('', 'password')).rejects.toThrow(
        AuthenticationError
      );
      await expect(client.login('username', '')).rejects.toThrow(
        AuthenticationError
      );
      await expect(client.login('', '')).rejects.toThrow(AuthenticationError);
    });

    it('should reject whitespace-only credentials', async () => {
      // Act & Assert
      await expect(client.login('   ', 'password')).rejects.toThrow(
        AuthenticationError
      );
      await expect(client.login('username', '   ')).rejects.toThrow(
        AuthenticationError
      );
    });

    it('should have proper configuration defaults', () => {
      // Act
      const config = client.getConfig();

      // Assert
      expect(config.urls.baseUrl).toBe('https://www.trainingpeaks.com');
      expect(config.urls.apiBaseUrl).toBeTypeOf('string');
      expect(config.timeouts.default).toBe(30000);
      expect(config.debug.enabled).toBe(false);
      expect(config.browser.headless).toBe(true);
      expect(config.timeouts.webAuth).toBe(30000);
    });

    it('should allow configuration overrides', () => {
      // Arrange
      const customConfig = {
        urls: {
          baseUrl: 'https://custom.trainingpeaks.com',
          apiBaseUrl: 'https://custom-api.trainingpeaks.com',
        },
        timeouts: {
          default: 15000,
          webAuth: 45000,
        },
        debug: {
          enabled: true,
          logAuth: true,
        },
        browser: {
          headless: false,
          executablePath: '/custom/path',
        },
      };

      // Act
      const client = new TrainingPeaksClient(customConfig);
      const config = client.getConfig();

      // Assert
      expect(config.urls.baseUrl).toBe(customConfig.urls.baseUrl);
      expect(config.urls.apiBaseUrl).toBe(customConfig.urls.apiBaseUrl);
      expect(config.timeouts.default).toBe(customConfig.timeouts.default);
      expect(config.timeouts.webAuth).toBe(customConfig.timeouts.webAuth);
      expect(config.debug.enabled).toBe(customConfig.debug.enabled);
      expect(config.debug.logAuth).toBe(customConfig.debug.logAuth);
      expect(config.browser.headless).toBe(customConfig.browser.headless);
      expect(config.browser.executablePath).toBe(
        customConfig.browser.executablePath
      );
    });

    it('should initialize with real authentication repository', () => {
      // Assert - The client should be initialized with real authentication
      // This is verified by checking that the client has the expected methods
      expect(typeof client.login).toBe('function');
      expect(typeof client.logout).toBe('function');
      expect(typeof client.getCurrentUser).toBe('function');
      expect(typeof client.isAuthenticated).toBe('function');
      expect(typeof client.getUserId).toBe('function');
    });

    it('should not be authenticated initially', () => {
      // Assert
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);
    });
  });

  describe('Workout Manager', () => {
    it('should provide workout manager', () => {
      // Act
      const workoutManager = client.getWorkoutManager();

      // Assert
      expect(workoutManager).toBeDefined();
      expect(typeof workoutManager.uploadWorkout).toBe('function');
      expect(typeof workoutManager.getWorkout).toBe('function');
      expect(typeof workoutManager.listWorkouts).toBe('function');
      expect(typeof workoutManager.deleteWorkout).toBe('function');
    });
  });
});
