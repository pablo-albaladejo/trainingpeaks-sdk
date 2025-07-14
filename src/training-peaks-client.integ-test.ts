/**
 * TrainingPeaks Client Integration Tests
 *
 * These tests verify the complete authentication flow
 */

import { describe, expect, it } from 'vitest';
import { testEnvironment } from './__fixtures__/test-environment';
import { getSDKConfig } from './config';
import { createTrainingPeaksClient } from './training-peaks-client';

describe('TrainingPeaks Client Integration Tests', () => {
  const sdkConfig = getSDKConfig();

  // Helper function to check if test environment is configured
  const isTestConfigured = () => {
    return !!(testEnvironment.testUsername && testEnvironment.testPassword);
  };

  describe('Authentication Flow', () => {
    it('should successfully login with real credentials', async () => {
      // Arrange: Skip test if environment is not configured
      if (!isTestConfigured()) {
        console.log(
          '⚠️  Skipping integration test - environment not configured'
        );
        return;
      }

      // Use SDK config for client configuration
      const client = createTrainingPeaksClient({
        sdkConfig: {
          ...sdkConfig,
          debug: {
            enabled: true,
            logAuth: true,
            logNetwork: true,
            logBrowser: true,
          },
          timeouts: {
            ...sdkConfig.timeouts,
            webAuth:
              testEnvironment.trainingPeaksConfig.webAuth?.timeout ||
              sdkConfig.timeouts.webAuth,
          },
        },
      });

      // Act: Login with credentials
      const user = await client.login(
        testEnvironment.testUsername,
        testEnvironment.testPassword
      );

      // Assert: Login was successful
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.name).toBeDefined();
      expect(client.isAuthenticated()).toBe(true);

      // Verify auth token exists
      const token = client.getCurrentToken();
      expect(token).toBeDefined();
      expect(token?.accessToken).toBeDefined();

      // Verify user info can be retrieved
      const currentUser = await client.getCurrentUser();
      expect(currentUser).toBeDefined();
      expect(currentUser?.id).toBe(user.id);
      expect(currentUser?.name).toBe(user.name);

      // Clean up: Logout
      await client.logout();
      expect(client.isAuthenticated()).toBe(false);
    }, 30000); // 30 seconds for auth operations

    it('should handle authentication errors gracefully', async () => {
      // Arrange: Skip test if environment is not configured
      if (!isTestConfigured()) {
        console.log(
          '⚠️  Skipping integration test - environment not configured'
        );
        return;
      }

      // Use SDK config for client configuration
      const client = createTrainingPeaksClient({
        sdkConfig: {
          ...sdkConfig,
          debug: {
            enabled: true,
            logAuth: true,
            logNetwork: true,
            logBrowser: true,
          },
          timeouts: {
            ...sdkConfig.timeouts,
            webAuth: 10000, // Short timeout for this test
          },
        },
      });

      // Act & Assert: Login with invalid credentials should fail
      await expect(
        client.login('invalid_username', 'invalid_password')
      ).rejects.toThrow();

      // Verify not authenticated
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getCurrentToken()).toBeNull();
    }, 20000); // 20 seconds for auth operations

    it('should successfully logout', async () => {
      // Arrange: Skip test if environment is not configured
      if (!isTestConfigured()) {
        console.log(
          '⚠️  Skipping integration test - environment not configured'
        );
        return;
      }

      // Use SDK config for client configuration
      const client = createTrainingPeaksClient({
        sdkConfig: {
          ...sdkConfig,
          debug: {
            enabled: true,
            logAuth: true,
            logNetwork: true,
            logBrowser: true,
          },
          timeouts: {
            ...sdkConfig.timeouts,
            webAuth:
              testEnvironment.trainingPeaksConfig.webAuth?.timeout ||
              sdkConfig.timeouts.webAuth,
          },
        },
      });

      // Act: Login and then logout
      await client.login(
        testEnvironment.testUsername,
        testEnvironment.testPassword
      );

      expect(client.isAuthenticated()).toBe(true);

      await client.logout();

      // Assert: Should be logged out
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getCurrentToken()).toBeNull();
      expect(await client.getCurrentUser()).toBeNull();
    }, 30000); // 30 seconds for auth operations
  });

  describe('Configuration', () => {
    it('should use centralized configuration', () => {
      // Arrange & Act
      const client = createTrainingPeaksClient();
      const config = client.getSDKConfig();

      // Assert: Should have default configuration
      expect(config).toBeDefined();
      expect(config.urls.baseUrl).toBeDefined();
      expect(config.timeouts.default).toBeDefined();
      expect(config.debug.enabled).toBeDefined();
    });

    it('should allow configuration overrides', () => {
      // Arrange
      const customConfig = {
        debug: {
          enabled: true,
          logAuth: true,
          logNetwork: true,
          logBrowser: true,
        },
      };

      // Act
      const client = createTrainingPeaksClient({
        sdkConfig: customConfig,
      });
      const resultConfig = client.getSDKConfig();

      // Assert: Should use custom configuration
      expect(resultConfig.debug.enabled).toBe(customConfig.debug.enabled);
    });
  });
});
