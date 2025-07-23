/**
 * TrainingPeaks Client Creation Integration Tests
 * Tests the client creation and configuration functionality
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { createTrainingPeaksClient } from '../../src/adapters/client/training-peaks-client';

describe('TrainingPeaks Client Creation Integration', () => {
  let client: ReturnType<typeof createTrainingPeaksClient>;

  beforeEach(() => {
    client = createTrainingPeaksClient({
      // Use test configuration
      debug: {
        enabled: false,
        logAuth: false,
        logNetwork: false,
        logBrowser: false,
      },
    });
  });

  describe('Client Creation', () => {
    it('should create a client with all required methods', () => {
      expect(client).toBeDefined();
      expect(typeof client.login).toBe('function');
      expect(typeof client.getUser).toBe('function');
      expect(typeof client.isAuthenticated).toBe('function');
      expect(typeof client.getUserId).toBe('function');
    });

    it('should accept configuration options', () => {
      const clientWithConfig = createTrainingPeaksClient({
        debug: {
          enabled: true,
          logAuth: true,
          logNetwork: true,
          logBrowser: true,
        },
        timeouts: {
          default: 10000,
          apiAuth: 5000,
        },
      });

      expect(clientWithConfig).toBeDefined();
      expect(typeof clientWithConfig.login).toBe('function');
      expect(typeof clientWithConfig.getUser).toBe('function');
      expect(typeof clientWithConfig.isAuthenticated).toBe('function');
      expect(typeof clientWithConfig.getUserId).toBe('function');
    });

    it('should create client with default configuration when no config provided', () => {
      const defaultClient = createTrainingPeaksClient();

      expect(defaultClient).toBeDefined();
      expect(typeof defaultClient.login).toBe('function');
      expect(typeof defaultClient.getUser).toBe('function');
      expect(typeof defaultClient.isAuthenticated).toBe('function');
      expect(typeof defaultClient.getUserId).toBe('function');
    });

    it('should create multiple independent client instances', () => {
      const client1 = createTrainingPeaksClient();
      const client2 = createTrainingPeaksClient();

      expect(client1).not.toBe(client2);
      expect(typeof client1.login).toBe('function');
      expect(typeof client2.login).toBe('function');
    });
  });
});
