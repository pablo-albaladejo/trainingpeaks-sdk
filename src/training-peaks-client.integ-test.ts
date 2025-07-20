/**
 * TrainingPeaks Client Integration Tests
 * Tests the full integration between client and infrastructure
 */

import { describe, expect, it } from 'vitest';
import { TrainingPeaksClient } from './training-peaks-client';

describe('TrainingPeaks Client Integration Tests', () => {
  describe('Environment Setup', () => {
    it('should have required environment variables for integration tests', () => {
      expect(process.env.TRAININGPEAKS_TEST_USERNAME).toBeDefined();
      expect(process.env.TRAININGPEAKS_TEST_USERNAME).not.toBe('');
      expect(process.env.TRAININGPEAKS_TEST_USERNAME).not.toBeUndefined();
      expect(process.env.TRAININGPEAKS_TEST_PASSWORD).toBeDefined();
      expect(process.env.TRAININGPEAKS_TEST_PASSWORD).not.toBe('');
      expect(process.env.TRAININGPEAKS_TEST_PASSWORD).not.toBeUndefined();
    });
  });

  describe('Authentication Flow', () => {
    it('should authenticate with valid credentials', async () => {
      // Arrange
      const username = process.env.TRAININGPEAKS_TEST_USERNAME!;
      const password = process.env.TRAININGPEAKS_TEST_PASSWORD!;

      // Use centralized configuration
      const client = new TrainingPeaksClient({
        debug: {
          enabled: true,
          logAuth: true,
          logNetwork: true,
          logBrowser: true,
        },
        browser: {
          headless: true,
          launchTimeout: 30000,
          pageWaitTimeout: 2000,
        },
        timeouts: {
          webAuth: 30000,
          apiAuth: 10000,
          default: 10000,
        },
      });

      // Act
      const result = await client.login(username, password);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.username).toBe(username);
      expect(result.token).toBeDefined();
      expect(result.token.accessToken).toBeTruthy();

      // Verify authentication state
      expect(client.isAuthenticated()).toBe(true);

      // Verify getCurrentUser works
      const currentUser = await client.getCurrentUser();
      expect(currentUser).toBeDefined();
      expect(currentUser?.username).toBe(username);
    }, 60_000); // Increase test timeout to 60 seconds

    it('should handle authentication failure gracefully', async () => {
      // Arrange
      const invalidUsername = 'invalid_user_that_does_not_exist_12345';
      const invalidPassword = 'invalid_password_that_does_not_exist_12345';

      // Use centralized configuration
      const client = new TrainingPeaksClient({
        debug: {
          enabled: true,
          logAuth: true,
          logNetwork: true,
          logBrowser: true,
        },
        browser: {
          headless: true,
          launchTimeout: 30000,
          pageWaitTimeout: 2000,
        },
        timeouts: {
          webAuth: 30000,
          apiAuth: 10000,
          default: 10000,
        },
      });

      // Ensure client is not authenticated before test
      if (client.isAuthenticated()) {
        await client.logout();
      }

      // Act & Assert
      await expect(
        client.login(invalidUsername, invalidPassword)
      ).rejects.toThrow();

      // Verify authentication state
      expect(client.isAuthenticated()).toBe(false);
    }, 60000);

    it('should successfully logout', async () => {
      // Arrange
      const username = process.env.TRAININGPEAKS_TEST_USERNAME!;
      const password = process.env.TRAININGPEAKS_TEST_PASSWORD!;

      // Use centralized configuration
      const client = new TrainingPeaksClient({
        debug: {
          enabled: true,
          logAuth: true,
          logNetwork: true,
          logBrowser: true,
        },
        browser: {
          headless: true,
          launchTimeout: 30000,
          pageWaitTimeout: 2000,
        },
        timeouts: {
          webAuth: 30000,
          apiAuth: 10000,
          default: 10000,
        },
      });

      // Login first
      await client.login(username, password);
      expect(client.isAuthenticated()).toBe(true);

      // Act
      const result = await client.logout();

      // Assert
      expect(result.success).toBe(true);
      expect(client.isAuthenticated()).toBe(false);
    }, 60000);
  });

  describe('Configuration', () => {
    it('should use centralized configuration', () => {
      // Arrange & Act
      const client = new TrainingPeaksClient();
      const config = client.getConfig();

      // Assert
      expect(config).toBeDefined();
      expect(config.urls).toBeDefined();
      expect(config.urls.baseUrl).toBeDefined();
      expect(config.timeouts).toBeDefined();
      expect(config.timeouts.default).toBeDefined();
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
    });
  });
});
