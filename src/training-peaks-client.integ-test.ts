/**
 * TrainingPeaks Client Integration Tests
 *
 * These tests verify the complete authentication flow
 */

import { describe, expect, it } from 'vitest';
import { testEnvironment } from './__fixtures__/test-environment';
import { getSDKConfig } from './config';
import { TrainingPeaksClient } from './training-peaks-client';

describe('TrainingPeaks Client Integration Tests', () => {
  const sdkConfig = getSDKConfig();

  // Helper function to check if test environment is configured
  const isTestConfigured = () => {
    return !!(testEnvironment.testUsername && testEnvironment.testPassword);
  };

  describe('Authentication Flow', () => {
    it(
      'should successfully login with real credentials',
      async () => {
        // Arrange: Skip test if environment is not configured
        if (!isTestConfigured()) {
          console.log(
            '⚠️  Skipping integration test - environment not configured'
          );
          return;
        }

        // Use SDK config for client configuration
        const client = new TrainingPeaksClient({
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

        // Act: Perform login
        const user = await client.login(
          testEnvironment.testUsername,
          testEnvironment.testPassword
        );

        // Assert: Verify successful authentication
        expect(user).toBeDefined();
        expect(user.id).toBeTruthy();
        expect(user.name).toBeTruthy();
        expect(client.isAuthenticated()).toBe(true);

        // Verify token is available
        const token = client.getCurrentToken();
        expect(token).toBeTruthy();
        expect(token?.accessToken).toBeTruthy();
        expect(token?.tokenType).toBe('Bearer');
        expect(token?.expiresAt).toBeInstanceOf(Date);

        console.log('🔓 Token validation successful!');
        console.log(`🔑 Token Type: ${token?.tokenType}`);
        console.log(`⏱️  Token Expires: ${token?.expiresAt?.toLocaleString()}`);
        console.log(`👤 User: ${user.name}`);
        console.log(`🆔 User ID: ${user.id}`);
      },
      sdkConfig.timeouts.testExecution
    );

    it(
      'should handle authentication errors gracefully',
      async () => {
        // Arrange: Skip test if environment is not configured
        if (!isTestConfigured()) {
          console.log(
            '⚠️  Skipping integration test - environment not configured'
          );
          return;
        }

        // Use SDK config for client configuration
        const client = new TrainingPeaksClient({
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

        // Act & Assert: Attempt login with invalid credentials
        await expect(
          client.login('invalid_username', 'invalid_password')
        ).rejects.toThrowError();

        // Verify no authentication state
        expect(client.isAuthenticated()).toBe(false);
        expect(client.getCurrentToken()).toBeNull();
        expect(client.getCurrentUser()).resolves.toBeNull();
      },
      sdkConfig.timeouts.testExecution
    );

    it(
      'should successfully logout',
      async () => {
        // Arrange: Skip test if environment is not configured
        if (!isTestConfigured()) {
          console.log(
            '⚠️  Skipping integration test - environment not configured'
          );
          return;
        }

        // Use SDK config for client configuration
        const client = new TrainingPeaksClient({
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

        // First login
        await client.login(
          testEnvironment.testUsername,
          testEnvironment.testPassword
        );
        expect(client.isAuthenticated()).toBe(true);

        // Act: Logout
        await client.logout();

        // Assert: Verify logout
        expect(client.isAuthenticated()).toBe(false);
        expect(client.getCurrentToken()).toBeNull();

        // Verify current user is cleared
        const currentUser = await client.getCurrentUser();
        expect(currentUser).toBeNull();
      },
      sdkConfig.timeouts.testExecution
    );
  });

  describe('Configuration', () => {
    it('should use centralized configuration', () => {
      // Arrange & Act
      const client = new TrainingPeaksClient();
      const config = client.getSDKConfig();

      // Assert
      expect(config).toBeDefined();
      expect(config.urls.baseUrl).toBe(sdkConfig.urls.baseUrl);
      expect(config.timeouts.default).toBe(sdkConfig.timeouts.default);
      expect(config.browser.headless).toBe(sdkConfig.browser.headless);
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
      const client = new TrainingPeaksClient({
        sdkConfig: customConfig,
      });
      const config = client.getSDKConfig();

      // Assert
      expect(config.debug.enabled).toBe(customConfig.debug.enabled);
      // Other properties should use defaults
      expect(config.urls.baseUrl).toBe(sdkConfig.urls.baseUrl);
      expect(config.timeouts.default).toBe(sdkConfig.timeouts.default);
    });
  });
});
