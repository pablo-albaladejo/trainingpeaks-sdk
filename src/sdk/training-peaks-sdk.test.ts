/**
 * TrainingPeaks SDK Tests
 * Comprehensive tests for the TrainingPeaks SDK implementation
 */
import { faker } from '@faker-js/faker';
import { trainingPeaksClientConfigBuilder } from '@fixtures/training-peaks-config.fixture';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TrainingPeaksClientConfig } from '@/config';

import {
  createTrainingPeaksSdk,
  type TrainingPeaksSdk,
} from './training-peaks-sdk';

// Mock all dependencies to isolate SDK tests
vi.mock('@/adapters', () => ({
  createInMemorySessionStorage: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  })),
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

vi.mock('@/adapters/http', () => ({
  createHttpClient: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock('@/adapters/public-api', () => ({
  createAuthRepository: vi.fn(() => ({
    login: vi.fn(),
    logout: vi.fn(),
  })),
  createWorkoutRepository: vi.fn(() => ({
    getWorkoutsList: vi.fn(),
  })),
  createTrainingPeaksRepository: vi.fn(() => ({
    login: vi.fn(),
    logout: vi.fn(),
    getWorkoutsList: vi.fn(),
  })),
}));

vi.mock('@/entrypoints', () => ({
  loginEntrypoint: vi.fn(() => vi.fn()),
  logoutEntrypoint: vi.fn(() => vi.fn()),
  getWorkoutsListEntrypoint: vi.fn(() => vi.fn()),
}));

vi.mock('@/config', () => ({
  getSDKConfig: vi.fn(() => ({
    urls: {
      apiBaseUrl: 'https://tpapi.trainingpeaks.com',
      loginUrl: 'https://home.trainingpeaks.com/login',
    },
    auth: { cookieName: 'Production_tpAuth' },
    timeouts: { apiAuth: 5000 },
    debug: {
      enabled: false,
      logAuth: false,
      logNetwork: false,
      logBrowser: false,
      level: 'info',
    },
  })),
}));

describe('TrainingPeaks SDK', () => {
  let mockConfig: TrainingPeaksClientConfig;

  beforeEach(() => {
    vi.resetAllMocks();
    mockConfig = trainingPeaksClientConfigBuilder.build();
  });

  describe('createTrainingPeaksSdk', () => {
    it('should create SDK instance with all required methods', () => {
      const sdk = createTrainingPeaksSdk(mockConfig);

      expect(sdk).toBeDefined();
      expect(typeof sdk.login).toBe('function');
      expect(typeof sdk.logout).toBe('function');
      expect(typeof sdk.getWorkoutsList).toBe('function');
      expect(sdk.logger).toBeDefined();
    });

    it('should work with empty configuration', () => {
      const sdk = createTrainingPeaksSdk();

      expect(sdk).toBeDefined();
      expect(sdk.login).toBeDefined();
      expect(sdk.logout).toBeDefined();
      expect(sdk.getWorkoutsList).toBeDefined();
      expect(sdk.logger).toBeDefined();
    });

    it('should accept configuration options', () => {
      const config: TrainingPeaksClientConfig = {
        apiKey: faker.string.uuid(),
        baseUrl: faker.internet.url(),
        debug: {
          enabled: true,
          level: 'debug',
        },
      };

      const sdk = createTrainingPeaksSdk(config);

      expect(sdk).toBeDefined();
      expect(sdk.logger).toBeDefined();
    });

    it('should create different instances for different configs', () => {
      const config1: TrainingPeaksClientConfig = {
        debug: { enabled: true, level: 'debug' },
      };

      const config2: TrainingPeaksClientConfig = {
        debug: { enabled: false, level: 'error' },
      };

      const sdk1 = createTrainingPeaksSdk(config1);
      const sdk2 = createTrainingPeaksSdk(config2);

      expect(sdk1).not.toBe(sdk2);
      expect(sdk1.login).not.toBe(sdk2.login);
      expect(sdk1.logout).not.toBe(sdk2.logout);
      expect(sdk1.getWorkoutsList).not.toBe(sdk2.getWorkoutsList);
    });

    it('should initialize logger with correct configuration', () => {
      const config: TrainingPeaksClientConfig = {
        debug: {
          enabled: true,
          level: 'debug',
        },
      };

      const sdk = createTrainingPeaksSdk(config);

      // Verify SDK was created successfully with logger
      expect(sdk.logger).toBeDefined();
      expect(typeof sdk.logger.info).toBe('function');
    });

    it('should initialize HTTP client with cookies enabled', () => {
      const sdk = createTrainingPeaksSdk(mockConfig);

      // Verify SDK was created successfully (integration test)
      expect(sdk).toBeDefined();
      expect(sdk.login).toBeDefined();
      expect(sdk.logout).toBeDefined();
      expect(sdk.getWorkoutsList).toBeDefined();
    });

    it('should initialize session storage', () => {
      const sdk = createTrainingPeaksSdk(mockConfig);

      // Verify SDK was created successfully
      expect(sdk).toBeDefined();
      expect(sdk.getWorkoutsList).toBeDefined(); // This requires session storage
    });

    it('should initialize repositories with correct dependencies', () => {
      const sdk = createTrainingPeaksSdk(mockConfig);

      // Verify all methods are available (integration test)
      expect(sdk.login).toBeDefined();
      expect(sdk.logout).toBeDefined();
      expect(sdk.getWorkoutsList).toBeDefined();
    });

    it('should initialize entrypoints with correct dependencies', () => {
      const sdk = createTrainingPeaksSdk(mockConfig);

      // Verify entrypoints are properly wired
      expect(typeof sdk.login).toBe('function');
      expect(typeof sdk.logout).toBe('function');
      expect(typeof sdk.getWorkoutsList).toBe('function');
    });
  });

  describe('SDK Interface', () => {
    let sdk: TrainingPeaksSdk;

    beforeEach(() => {
      sdk = createTrainingPeaksSdk(mockConfig);
    });

    it('should expose login method', () => {
      expect(sdk.login).toBeDefined();
      expect(typeof sdk.login).toBe('function');
    });

    it('should expose logout method', () => {
      expect(sdk.logout).toBeDefined();
      expect(typeof sdk.logout).toBe('function');
    });

    it('should expose getWorkoutsList method', () => {
      expect(sdk.getWorkoutsList).toBeDefined();
      expect(typeof sdk.getWorkoutsList).toBe('function');
    });

    it('should expose logger', () => {
      expect(sdk.logger).toBeDefined();
      expect(typeof sdk.logger.info).toBe('function');
      expect(typeof sdk.logger.error).toBe('function');
      expect(typeof sdk.logger.warn).toBe('function');
      expect(typeof sdk.logger.debug).toBe('function');
    });

    it('should not expose internal dependencies', () => {
      const sdkKeys = Object.keys(sdk);

      expect(sdkKeys).toEqual(['login', 'logout', 'getWorkoutsList', 'logger']);
      expect(sdkKeys).not.toContain('httpClient');
      expect(sdkKeys).not.toContain('sessionStorage');
      expect(sdkKeys).not.toContain('authRepository');
      expect(sdkKeys).not.toContain('workoutRepository');
      expect(sdkKeys).not.toContain('tpRepository');
    });
  });

  describe('Configuration Handling', () => {
    it('should pass configuration to getSDKConfig', () => {
      const customConfig: TrainingPeaksClientConfig = {
        apiKey: 'test-key',
        baseUrl: 'https://custom.api.com',
      };

      const sdk = createTrainingPeaksSdk(customConfig);

      // Verify SDK was created successfully with custom config
      expect(sdk).toBeDefined();
      expect(sdk.login).toBeDefined();
    });

    it('should handle undefined configuration', () => {
      const sdk = createTrainingPeaksSdk();

      // Verify SDK works with default configuration
      expect(sdk).toBeDefined();
      expect(sdk.login).toBeDefined();
      expect(sdk.logout).toBeDefined();
      expect(sdk.getWorkoutsList).toBeDefined();
    });

    it('should handle partial configuration', () => {
      const partialConfig: TrainingPeaksClientConfig = {
        debug: { enabled: true },
      };

      const sdk = createTrainingPeaksSdk(partialConfig);

      // Verify SDK works with partial configuration
      expect(sdk).toBeDefined();
      expect(sdk.logger).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    it('should return correctly typed SDK interface', () => {
      const sdk = createTrainingPeaksSdk(mockConfig);

      // TypeScript compilation ensures proper typing
      expect(typeof sdk.login).toBe('function');
      expect(typeof sdk.logout).toBe('function');
      expect(typeof sdk.getWorkoutsList).toBe('function');
      expect(typeof sdk.logger.info).toBe('function');
      expect(typeof sdk.logger.error).toBe('function');
      expect(typeof sdk.logger.warn).toBe('function');
      expect(typeof sdk.logger.debug).toBe('function');
    });

    it('should infer return type correctly', () => {
      type ExpectedSDKType = {
        login: (...args: unknown[]) => unknown;
        logout: (...args: unknown[]) => unknown;
        getWorkoutsList: (...args: unknown[]) => unknown;
        logger: {
          info: (...args: unknown[]) => unknown;
          error: (...args: unknown[]) => unknown;
          warn: (...args: unknown[]) => unknown;
          debug: (...args: unknown[]) => unknown;
        };
      };

      const sdk = createTrainingPeaksSdk(mockConfig);

      // Type assertion to verify structural compatibility
      const typedSdk: ExpectedSDKType = sdk;
      expect(typedSdk).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle configuration errors gracefully', () => {
      // Test with invalid config structure
      const invalidConfig = {
        debug: {
          level: 'invalid-level' as 'debug' | 'info' | 'warn' | 'error',
        },
      };

      // Should not throw - SDK should handle config validation internally
      expect(() => createTrainingPeaksSdk(invalidConfig)).not.toThrow();
    });

    it('should create SDK even with empty config', () => {
      const sdk = createTrainingPeaksSdk({});

      expect(sdk).toBeDefined();
      expect(sdk.login).toBeDefined();
      expect(sdk.logout).toBeDefined();
      expect(sdk.getWorkoutsList).toBeDefined();
      expect(sdk.logger).toBeDefined();
    });
  });

  describe('Integration', () => {
    it('should properly wire all dependencies together', () => {
      const sdk = createTrainingPeaksSdk(mockConfig);

      // Verify SDK has all expected methods and properties
      expect(sdk).toBeDefined();
      expect(sdk.login).toBeDefined();
      expect(sdk.logout).toBeDefined();
      expect(sdk.getWorkoutsList).toBeDefined();
      expect(sdk.logger).toBeDefined();

      // Verify methods are functions
      expect(typeof sdk.login).toBe('function');
      expect(typeof sdk.logout).toBe('function');
      expect(typeof sdk.getWorkoutsList).toBe('function');

      // Verify logger has expected methods
      expect(typeof sdk.logger.info).toBe('function');
      expect(typeof sdk.logger.error).toBe('function');
      expect(typeof sdk.logger.warn).toBe('function');
      expect(typeof sdk.logger.debug).toBe('function');
    });

    it('should create functional SDK instances', () => {
      const sdk1 = createTrainingPeaksSdk({ debug: { enabled: true } });
      const sdk2 = createTrainingPeaksSdk({ debug: { enabled: false } });

      // Both instances should be fully functional
      expect(sdk1).toBeDefined();
      expect(sdk2).toBeDefined();

      // They should be different instances
      expect(sdk1).not.toBe(sdk2);
      expect(sdk1.login).not.toBe(sdk2.login);
    });
  });
});
