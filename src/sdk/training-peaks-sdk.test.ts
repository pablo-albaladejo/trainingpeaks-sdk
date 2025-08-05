/**
 * TrainingPeaks Client Tests
 * Tests for the new functional client implementation
 */
import { faker } from '@faker-js/faker';
import { trainingPeaksClientConfigBuilder } from '@fixtures/training-peaks-config.fixture';
import { describe, expect, it, vi } from 'vitest';

import { createTrainingPeaksSdk } from './training-peaks-sdk';

vi.mock('@/config', () => ({
  getSDKConfig: vi.fn(() => ({
    urls: {
      apiBaseUrl: 'https://api.trainingpeaks.com',
      loginUrl: 'https://home.trainingpeaks.com/login',
    },
    auth: { cookieName: 'Production_tpAuth' },
    timeouts: { apiAuth: 5000 },
    debug: {
      enabled: false,
      logAuth: false,
      logNetwork: false,
      logBrowser: false,
    },
  })),
}));

describe('createTrainingPeaksClient', () => {
  it('should create a client instance with all required methods', () => {
    // Arrange
    const clientConfig = trainingPeaksClientConfigBuilder.build({
      debug: {
        enabled: true,
        level: 'debug',
      },
    });

    // Act
    const client = createTrainingPeaksSdk(clientConfig);

    // Assert
    expect(client).toBeDefined();
    expect(typeof client.login).toBe('function');
    expect(typeof client.logout).toBe('function');

    // Verify logger is working by checking it exists and has methods
    expect(client.logger).toBeDefined();
    expect(typeof client.logger.info).toBe('function');
    expect(typeof client.logger.debug).toBe('function');
    expect(typeof client.logger.warn).toBe('function');
    expect(typeof client.logger.error).toBe('function');
  });

  it('should accept configuration options', () => {
    // Arrange
    const config = trainingPeaksClientConfigBuilder.build({
      apiKey: faker.string.uuid(),
      baseUrl: faker.internet.url(),
    });

    // Act & Assert
    expect(() => createTrainingPeaksSdk(config)).not.toThrow();
  });
});
