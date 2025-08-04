/**
 * TrainingPeaks Client Tests
 * Tests for the new functional client implementation
 */
import { faker } from '@faker-js/faker';
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
    const client = createTrainingPeaksSdk({
      debug: {
        enabled: true,
        level: 'debug',
      },
    });

    // Verify logger is working by checking it exists and has methods
    expect(client.logger).toBeDefined();
    expect(typeof client.logger.info).toBe('function');
    expect(typeof client.logger.debug).toBe('function');
    expect(typeof client.logger.warn).toBe('function');
    expect(typeof client.logger.error).toBe('function');

    expect(client).toBeDefined();
    expect(typeof client.login).toBe('function');
    expect(typeof client.logout).toBe('function');
  });

  it('should accept configuration options', () => {
    const config = {
      apiKey: faker.string.uuid(),
      baseUrl: faker.internet.url(),
    };

    expect(() => createTrainingPeaksSdk(config)).not.toThrow();
  });
});
