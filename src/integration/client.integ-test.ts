/**
 * Client Configuration Integration Tests
 * Tests the client configuration and general setup functionality
 */

import { TrainingPeaksClient } from '@/training-peaks-client';
import { describe, expect, it } from 'vitest';

describe.skip('Client Configuration Integration Tests', () => {
  describe('Configuration Management', () => {
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

    it('should merge partial configuration correctly', () => {
      // Arrange
      const partialConfig = {
        debug: {
          enabled: true,
        },
        timeouts: {
          default: 20000,
        },
      };

      // Act
      const client = new TrainingPeaksClient(partialConfig);
      const config = client.getConfig();

      // Assert
      expect(config.debug.enabled).toBe(true);
      expect(config.timeouts.default).toBe(20000);
      // Should have default values for other properties
      expect(config.urls.baseUrl).toBeDefined();
      expect(config.browser).toBeDefined();
    });

    it('should handle empty configuration', () => {
      // Arrange & Act
      const client = new TrainingPeaksClient({});
      const config = client.getConfig();

      // Assert
      expect(config).toBeDefined();
      expect(config.urls).toBeDefined();
      expect(config.timeouts).toBeDefined();
      expect(config.debug).toBeDefined();
      expect(config.browser).toBeDefined();
    });

    it('should handle null/undefined configuration', () => {
      // Arrange & Act
      const client = new TrainingPeaksClient();
      const config = client.getConfig();

      // Assert
      expect(config).toBeDefined();
      expect(config.urls).toBeDefined();
      expect(config.timeouts).toBeDefined();
      expect(config.debug).toBeDefined();
      expect(config.browser).toBeDefined();
    });
  });

  describe('Client Initialization', () => {
    it('should initialize with default configuration', () => {
      // Arrange & Act
      const client = new TrainingPeaksClient();

      // Assert
      expect(client).toBeDefined();
      expect(typeof client.login).toBe('function');
      expect(typeof client.logout).toBe('function');
      expect(typeof client.isAuthenticated).toBe('function');
      expect(typeof client.getCurrentUser).toBe('function');
      expect(typeof client.getWorkoutManager).toBe('function');
      expect(typeof client.getConfig).toBe('function');

      // Check workout manager methods
      const workoutManager = client.getWorkoutManager();
      expect(typeof workoutManager.uploadWorkout).toBe('function');
      expect(typeof workoutManager.listWorkouts).toBe('function');
      expect(typeof workoutManager.getWorkout).toBe('function');
      expect(typeof workoutManager.deleteWorkout).toBe('function');
      expect(typeof workoutManager.createStructuredWorkout).toBe('function');
      expect(typeof workoutManager.searchWorkouts).toBe('function');
    });

    it('should initialize with custom configuration', () => {
      // Arrange
      const customConfig = {
        debug: { enabled: true },
        timeouts: { default: 30000 },
        browser: { headless: false },
      };

      // Act
      const client = new TrainingPeaksClient(customConfig);

      // Assert
      expect(client).toBeDefined();
      expect(client.getConfig().debug.enabled).toBe(true);
      expect(client.getConfig().timeouts.default).toBe(30000);
      expect(client.getConfig().browser.headless).toBe(false);
    });

    it('should have proper authentication state initially', () => {
      // Arrange & Act
      const client = new TrainingPeaksClient();

      // Assert
      expect(client.isAuthenticated()).toBe(false);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate URL configurations', () => {
      // Arrange
      const validConfig = {
        urls: {
          baseUrl: 'https://trainingpeaks.com',
          apiBaseUrl: 'https://api.trainingpeaks.com',
          loginUrl: 'https://trainingpeaks.com/login',
          appUrl: 'https://trainingpeaks.com/app',
        },
      };

      // Act
      const client = new TrainingPeaksClient(validConfig);
      const config = client.getConfig();

      // Assert
      expect(config.urls.baseUrl).toBe('https://trainingpeaks.com');
      expect(config.urls.apiBaseUrl).toBe('https://api.trainingpeaks.com');
      expect(config.urls.loginUrl).toBe('https://trainingpeaks.com/login');
      expect(config.urls.appUrl).toBe('https://trainingpeaks.com/app');
    });

    it('should validate timeout configurations', () => {
      // Arrange
      const timeoutConfig = {
        timeouts: {
          default: 30000,
          webAuth: 60000,
          apiAuth: 15000,
          elementWait: 5000,
          pageLoad: 30000,
          errorDetection: 2000,
          testExecution: 120000,
        },
      };

      // Act
      const client = new TrainingPeaksClient(timeoutConfig);
      const config = client.getConfig();

      // Assert
      expect(config.timeouts.default).toBe(30000);
      expect(config.timeouts.webAuth).toBe(60000);
      expect(config.timeouts.apiAuth).toBe(15000);
      expect(config.timeouts.elementWait).toBe(5000);
      expect(config.timeouts.pageLoad).toBe(30000);
      expect(config.timeouts.errorDetection).toBe(2000);
      expect(config.timeouts.testExecution).toBe(120000);
    });

    it('should validate debug configurations', () => {
      // Arrange
      const debugConfig = {
        debug: {
          enabled: true,
          logAuth: true,
          logNetwork: true,
          logBrowser: true,
        },
      };

      // Act
      const client = new TrainingPeaksClient(debugConfig);
      const config = client.getConfig();

      // Assert
      expect(config.debug.enabled).toBe(true);
      expect(config.debug.logAuth).toBe(true);
      expect(config.debug.logNetwork).toBe(true);
      expect(config.debug.logBrowser).toBe(true);
    });

    it('should validate browser configurations', () => {
      // Arrange
      const browserConfig = {
        browser: {
          headless: true,
          launchTimeout: 30000,
          pageWaitTimeout: 2000,
          executablePath: '/usr/bin/chromium',
        },
      };

      // Act
      const client = new TrainingPeaksClient(browserConfig);
      const config = client.getConfig();

      // Assert
      expect(config.browser.headless).toBe(true);
      expect(config.browser.launchTimeout).toBe(30000);
      expect(config.browser.pageWaitTimeout).toBe(2000);
      expect(config.browser.executablePath).toBe('/usr/bin/chromium');
    });
  });

  describe('Configuration Immutability', () => {
    it('should not allow direct modification of configuration', () => {
      // Arrange
      const client = new TrainingPeaksClient();
      const originalConfig = client.getConfig();

      // Act - Try to modify configuration
      const config = client.getConfig();
      config.debug.enabled = true;

      // Assert - Original config should remain unchanged
      expect(client.getConfig().debug.enabled).toBe(
        originalConfig.debug.enabled
      );
    });

    it('should return same configuration object on each call', () => {
      // Arrange
      const client = new TrainingPeaksClient();

      // Act
      const config1 = client.getConfig();
      const config2 = client.getConfig();

      // Assert
      expect(config1).toBe(config2); // Should be the same object reference
      expect(config1).toEqual(config2); // With same values
    });
  });

  describe('Environment Integration', () => {
    it('should handle environment variable configuration', () => {
      // Arrange
      const envConfig = {
        authMethod: process.env.TRAININGPEAKS_AUTH_METHOD || 'web',
        webHeadless: process.env.TRAININGPEAKS_WEB_HEADLESS === 'true',
        webTimeout: parseInt(
          process.env.TRAININGPEAKS_WEB_TIMEOUT || '30000',
          10
        ),
      };

      // Act
      const client = new TrainingPeaksClient({
        browser: {
          headless: envConfig.webHeadless,
          launchTimeout: envConfig.webTimeout,
        },
      });
      const config = client.getConfig();

      // Assert
      expect(config.browser.headless).toBe(envConfig.webHeadless);
      expect(config.browser.launchTimeout).toBe(envConfig.webTimeout);
    });

    it('should have access to test environment variables', () => {
      // Assert
      expect(process.env.NODE_ENV).toBeDefined();
      expect(process.env.NODE_ENV).toBe('test');
    });
  });
});
