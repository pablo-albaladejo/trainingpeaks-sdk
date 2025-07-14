/**
 * TrainingPeaks Client Integration Tests
 * Tests the full integration between client and infrastructure
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { TrainingPeaksClient } from './training-peaks-client';

describe('TrainingPeaks Client Integration Tests', () => {
  let client: TrainingPeaksClient;

  beforeEach(() => {
    client = new TrainingPeaksClient();
  });

  describe('Authentication Flow', () => {
    it('should successfully login with real credentials', async () => {
      // Skip this test if no real credentials are available
      if (!process.env.TP_USERNAME || !process.env.TP_PASSWORD) {
        console.warn('Skipping integration test - no credentials provided');
        return;
      }

      // Arrange
      const username = process.env.TP_USERNAME;
      const password = process.env.TP_PASSWORD;

      // Use basic client configuration
      const client = new TrainingPeaksClient({
        baseUrl: 'https://api.trainingpeaks.com',
        timeout: 10000,
        debug: false,
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
      expect(currentUser.username).toBe(username);
    });

    it('should handle authentication errors gracefully', async () => {
      // Arrange
      const invalidUsername = 'invalid_user';
      const invalidPassword = 'invalid_password';

      // Use basic client configuration
      const client = new TrainingPeaksClient({
        baseUrl: 'https://api.trainingpeaks.com',
        timeout: 10000,
        debug: false,
      });

      // Act & Assert
      await expect(
        client.login(invalidUsername, invalidPassword)
      ).rejects.toThrow();

      // Verify authentication state
      expect(client.isAuthenticated()).toBe(false);
    });

    it('should successfully logout', async () => {
      // Arrange
      const username = process.env.TP_USERNAME;
      const password = process.env.TP_PASSWORD;

      if (!username || !password) {
        console.warn('Skipping integration test - no credentials provided');
        return;
      }

      // Use basic client configuration
      const client = new TrainingPeaksClient({
        baseUrl: 'https://api.trainingpeaks.com',
        timeout: 10000,
        debug: false,
      });

      // Login first
      await client.login(username, password);
      expect(client.isAuthenticated()).toBe(true);

      // Act
      const result = await client.logout();

      // Assert
      expect(result.success).toBe(true);
      expect(client.isAuthenticated()).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should use centralized configuration', () => {
      // Arrange & Act
      const client = new TrainingPeaksClient();
      const config = client.getConfig();

      // Assert
      expect(config).toBeDefined();
      expect(config.baseUrl).toBeDefined();
      expect(config.timeout).toBeDefined();
    });

    it('should allow configuration overrides', () => {
      // Arrange
      const customConfig = {
        baseUrl: 'https://custom.trainingpeaks.com',
        timeout: 15000,
        debug: true,
      };

      // Act
      const client = new TrainingPeaksClient(customConfig);
      const config = client.getConfig();

      // Assert
      expect(config.baseUrl).toBe(customConfig.baseUrl);
      expect(config.timeout).toBe(customConfig.timeout);
      expect(config.debug).toBe(customConfig.debug);
    });
  });
});
