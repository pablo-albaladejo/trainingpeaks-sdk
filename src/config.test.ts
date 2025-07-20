/**
 * Configuration Tests
 * Tests for the centralized configuration system
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  getSDKConfig,
  mergeWithDefaultConfig,
  validateConfig,
  type TrainingPeaksClientConfig,
} from './config';

describe('Configuration System', () => {
  beforeEach(() => {
    // Clear environment variables for clean tests
    delete process.env.TRAININGPEAKS_BASE_URL;
    delete process.env.TRAININGPEAKS_API_BASE_URL;
    delete process.env.TRAININGPEAKS_LOGIN_URL;
    delete process.env.TRAININGPEAKS_APP_URL;
    delete process.env.TRAININGPEAKS_DEBUG;
    delete process.env.TRAININGPEAKS_DEBUG_AUTH;
  });

  describe('Default Values', () => {
    it('should use hardcoded default values when no overrides provided', () => {
      // Act
      const config = getSDKConfig();

      // Assert
      expect(config.urls.baseUrl).toBe('https://www.trainingpeaks.com');
      expect(config.urls.apiBaseUrl).toBe('https://api.trainingpeaks.com');
      expect(config.urls.loginUrl).toBe('https://home.trainingpeaks.com/login');
      expect(config.urls.appUrl).toBe('https://app.trainingpeaks.com');
      expect(config.debug.enabled).toBe(false);
      expect(config.debug.logAuth).toBe(false);
    });
  });

  describe('Environment Variables Override', () => {
    it('should override defaults with environment variables', () => {
      // Arrange
      process.env.TRAININGPEAKS_BASE_URL = 'https://custom.trainingpeaks.com';
      process.env.TRAININGPEAKS_DEBUG = 'true';
      process.env.TRAININGPEAKS_DEBUG_AUTH = 'true';

      // Act
      const config = getSDKConfig();

      // Assert
      expect(config.urls.baseUrl).toBe('https://custom.trainingpeaks.com');
      expect(config.urls.apiBaseUrl).toBe('https://api.trainingpeaks.com'); // Still default
      expect(config.debug.enabled).toBe(true);
      expect(config.debug.logAuth).toBe(true);
    });

    it('should handle all URL environment variables', () => {
      // Arrange
      process.env.TRAININGPEAKS_BASE_URL =
        'https://custom-base.trainingpeaks.com';
      process.env.TRAININGPEAKS_API_BASE_URL =
        'https://custom-api.trainingpeaks.com';
      process.env.TRAININGPEAKS_LOGIN_URL =
        'https://custom-login.trainingpeaks.com';
      process.env.TRAININGPEAKS_APP_URL =
        'https://custom-app.trainingpeaks.com';

      // Act
      const config = getSDKConfig();

      // Assert
      expect(config.urls.baseUrl).toBe('https://custom-base.trainingpeaks.com');
      expect(config.urls.apiBaseUrl).toBe(
        'https://custom-api.trainingpeaks.com'
      );
      expect(config.urls.loginUrl).toBe(
        'https://custom-login.trainingpeaks.com'
      );
      expect(config.urls.appUrl).toBe('https://custom-app.trainingpeaks.com');
    });
  });

  describe('Client Configuration Override', () => {
    it('should override environment variables with client configuration', () => {
      // Arrange
      process.env.TRAININGPEAKS_BASE_URL = 'https://env.trainingpeaks.com';
      process.env.TRAININGPEAKS_DEBUG = 'true';

      const clientConfig: TrainingPeaksClientConfig = {
        urls: {
          baseUrl: 'https://client.trainingpeaks.com',
        },
        debug: {
          enabled: false,
        },
      };

      // Act
      const config = getSDKConfig(clientConfig);

      // Assert
      expect(config.urls.baseUrl).toBe('https://client.trainingpeaks.com'); // Client overrides env
      expect(config.debug.enabled).toBe(false); // Client overrides env
      expect(config.urls.apiBaseUrl).toBe('https://api.trainingpeaks.com'); // Still default
    });

    it('should allow partial client configuration', () => {
      // Arrange
      const clientConfig: TrainingPeaksClientConfig = {
        urls: {
          baseUrl: 'https://partial.trainingpeaks.com',
        },
        // No debug config provided
      };

      // Act
      const config = getSDKConfig(clientConfig);

      // Assert
      expect(config.urls.baseUrl).toBe('https://partial.trainingpeaks.com');
      expect(config.urls.apiBaseUrl).toBe('https://api.trainingpeaks.com'); // Still default
      expect(config.debug.enabled).toBe(false); // Still default
    });
  });

  describe('Configuration Priority', () => {
    it('should follow correct priority: defaults < environment < client', () => {
      // Arrange
      process.env.TRAININGPEAKS_BASE_URL = 'https://env.trainingpeaks.com';
      process.env.TRAININGPEAKS_DEBUG = 'true';

      const clientConfig: TrainingPeaksClientConfig = {
        urls: {
          baseUrl: 'https://client.trainingpeaks.com',
        },
        debug: {
          enabled: false,
        },
      };

      // Act
      const config = getSDKConfig(clientConfig);

      // Assert
      // Client config should override environment variables
      expect(config.urls.baseUrl).toBe('https://client.trainingpeaks.com');
      expect(config.debug.enabled).toBe(false);

      // Environment variables should override defaults for non-client-specified values
      expect(config.urls.apiBaseUrl).toBe('https://api.trainingpeaks.com'); // Default (no env override)
      expect(config.debug.logAuth).toBe(false); // Default (no env override)
    });
  });

  describe('Configuration Validation', () => {
    it('should validate URL formats', () => {
      // Arrange
      const invalidConfig: Partial<TrainingPeaksClientConfig> = {
        urls: {
          baseUrl: 'not-a-valid-url',
        },
      };

      // Act & Assert
      expect(() => getSDKConfig(invalidConfig)).toThrow('Invalid URL format');
    });

    it('should validate timeout values', () => {
      // Arrange
      const invalidConfig: Partial<TrainingPeaksClientConfig> = {
        timeouts: {
          default: -1, // Invalid negative timeout
        },
      };

      // Act & Assert
      expect(() => getSDKConfig(invalidConfig)).toThrow(
        'Invalid timeout configuration'
      );
    });

    it('should validate all URL fields', () => {
      const urlFields = [
        'baseUrl',
        'apiBaseUrl',
        'loginUrl',
        'appUrl',
      ] as const;

      urlFields.forEach((field) => {
        const invalidConfig = {
          urls: { [field]: 'invalid-url' },
        };

        expect(() => getSDKConfig(invalidConfig)).toThrow(
          `Invalid URL format for ${field}`
        );
      });
    });

    it('should validate token configurations', () => {
      const tokenFields = [
        'refreshWindow',
        'validationWindow',
        'defaultExpiration',
      ] as const;

      tokenFields.forEach((field) => {
        const invalidConfig = {
          tokens: { [field]: -1000 },
        };

        expect(() => getSDKConfig(invalidConfig)).toThrow(
          `Invalid token configuration for ${field}`
        );
      });
    });

    it('should handle empty URLs', () => {
      const invalidConfig: Partial<TrainingPeaksClientConfig> = {
        urls: {
          baseUrl: '',
        },
      };

      expect(() => getSDKConfig(invalidConfig)).toThrow(
        'Invalid URL configuration for baseUrl'
      );
    });

    it('should handle null URLs', () => {
      const invalidConfig = {
        urls: {
          baseUrl: null as unknown as string,
        },
      };

      expect(() => getSDKConfig(invalidConfig)).toThrow(
        'Invalid URL configuration for baseUrl'
      );
    });
  });

  describe('mergeWithDefaultConfig', () => {
    it('should return defaults when no config provided', () => {
      const config = mergeWithDefaultConfig();

      expect(config.urls.baseUrl).toBe('https://www.trainingpeaks.com');
      expect(config.timeouts.default).toBe(30000);
      expect(config.debug.enabled).toBe(false);
    });

    it('should merge partial configurations correctly', () => {
      const partialConfig: TrainingPeaksClientConfig = {
        urls: {
          baseUrl: 'https://custom.trainingpeaks.com',
        },
        debug: {
          enabled: true,
        },
      };

      const config = mergeWithDefaultConfig(partialConfig);

      expect(config.urls.baseUrl).toBe('https://custom.trainingpeaks.com');
      expect(config.urls.apiBaseUrl).toBe('https://api.trainingpeaks.com'); // Default preserved
      expect(config.debug.enabled).toBe(true);
      expect(config.debug.logAuth).toBe(false); // Default preserved
    });

    it('should handle deeply nested configurations', () => {
      const nestedConfig: TrainingPeaksClientConfig = {
        requests: {
          retryAttempts: 5,
        },
      };

      const config = mergeWithDefaultConfig(nestedConfig);

      expect(config.requests.retryAttempts).toBe(5);
      expect(config.requests.retryDelay).toBe(1000); // Default preserved
    });
  });

  describe('Environment Variable Handling', () => {
    it('should handle all timeout environment variables', () => {
      process.env.TRAININGPEAKS_TIMEOUT = '45000';
      process.env.TRAININGPEAKS_WEB_AUTH_TIMEOUT = '60000';
      process.env.TRAININGPEAKS_API_AUTH_TIMEOUT = '35000';

      const config = getSDKConfig();

      expect(config.timeouts.default).toBe(45000);
      expect(config.timeouts.webAuth).toBe(60000);
      expect(config.timeouts.apiAuth).toBe(35000);
    });

    it('should handle all debug environment variables', () => {
      process.env.TRAININGPEAKS_DEBUG = 'true';
      process.env.TRAININGPEAKS_DEBUG_AUTH = 'true';
      process.env.TRAININGPEAKS_DEBUG_NETWORK = 'true';
      process.env.TRAININGPEAKS_DEBUG_BROWSER = 'true';

      const config = getSDKConfig();

      expect(config.debug.enabled).toBe(true);
      expect(config.debug.logAuth).toBe(true);
      expect(config.debug.logNetwork).toBe(true);
      expect(config.debug.logBrowser).toBe(true);
    });

    it('should handle browser environment variables', () => {
      process.env.TRAININGPEAKS_BROWSER_HEADLESS = 'false';
      process.env.TRAININGPEAKS_BROWSER_EXECUTABLE_PATH = '/custom/path';
      process.env.TRAININGPEAKS_BROWSER_LAUNCH_TIMEOUT = '45000';

      const config = getSDKConfig();

      expect(config.browser.headless).toBe(false);
      expect(config.browser.executablePath).toBe('/custom/path');
      expect(config.browser.launchTimeout).toBe(45000);
    });

    it('should handle token environment variables', () => {
      process.env.TRAININGPEAKS_TOKEN_REFRESH_WINDOW = '600000';
      process.env.TRAININGPEAKS_TOKEN_VALIDATION_WINDOW = '120000';

      const config = getSDKConfig();

      expect(config.tokens.refreshWindow).toBe(600000);
      expect(config.tokens.validationWindow).toBe(120000);
    });

    it('should handle invalid numeric environment variables gracefully', () => {
      process.env.TRAININGPEAKS_TIMEOUT = 'not-a-number';
      process.env.TRAININGPEAKS_RETRY_ATTEMPTS = 'invalid';

      const config = getSDKConfig();

      // Should use defaults when env vars are invalid
      expect(config.timeouts.default).toBe(30000);
      expect(config.requests.retryAttempts).toBe(3);
    });

    it('should handle boolean environment variables correctly', () => {
      process.env.TRAININGPEAKS_BROWSER_HEADLESS = 'false';
      process.env.TRAININGPEAKS_DEBUG = 'true';

      const config = getSDKConfig();

      expect(config.browser.headless).toBe(false);
      expect(config.debug.enabled).toBe(true);
    });
  });

  describe('validateConfig function', () => {
    it('should pass validation for default config', () => {
      const config = mergeWithDefaultConfig();

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should validate all timeout fields for negative values', () => {
      const timeoutFields = [
        'default',
        'webAuth',
        'apiAuth',
        'elementWait',
        'pageLoad',
        'errorDetection',
        'testExecution',
      ] as const;

      timeoutFields.forEach((field) => {
        const testConfig = mergeWithDefaultConfig();
        testConfig.timeouts[field] = -1;

        expect(() => validateConfig(testConfig)).toThrow(
          `Invalid timeout configuration for ${field}: -1`
        );
      });
    });

    it('should validate non-numeric values', () => {
      const config = mergeWithDefaultConfig();
      (config.timeouts.default as unknown as string) = 'not-a-number';

      expect(() => validateConfig(config)).toThrow(
        'Invalid timeout configuration for default'
      );
    });
  });
});
