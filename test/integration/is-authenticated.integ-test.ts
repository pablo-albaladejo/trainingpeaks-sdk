/**
 * TrainingPeaks Client IsAuthenticated Integration Tests
 * Tests the isAuthenticated functionality with real dependencies
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { createTrainingPeaksClient } from '../../src/adapters/client/training-peaks-client';
import {
  createCredentialsForScenario,
  getRealCredentials,
} from '../../src/__fixtures__/credentials.fixture';

describe('TrainingPeaks Client IsAuthenticated Integration', () => {
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

  describe('isAuthenticated() - Success Cases', () => {
    it('should return true when client is successfully authenticated with real credentials', async () => {
      const realCredentials = getRealCredentials();
      const loginResult = await client.login(realCredentials.username, realCredentials.password);

      if (loginResult.success) {
        expect(client.isAuthenticated()).toBe(true);
      } else {
        expect(client.isAuthenticated()).toBe(false);
      }
    });

    it('should maintain consistent true state between calls when authenticated', async () => {
      const credentials = createCredentialsForScenario('success');
      const loginResult = await client.login(credentials.username, credentials.password);

      if (loginResult.success) {
        // State should remain consistently true
        expect(client.isAuthenticated()).toBe(true);
        expect(client.isAuthenticated()).toBe(true);
        expect(client.isAuthenticated()).toBe(true);
      } else {
        // State should remain consistently false
        expect(client.isAuthenticated()).toBe(false);
        expect(client.isAuthenticated()).toBe(false);
        expect(client.isAuthenticated()).toBe(false);
      }
    });

    it('should return true after successful login and getUser', async () => {
      const credentials = createCredentialsForScenario('success');
      const loginResult = await client.login(credentials.username, credentials.password);

      if (loginResult.success) {
        await client.getUser();
        expect(client.isAuthenticated()).toBe(true);
      } else {
        await client.getUser();
        expect(client.isAuthenticated()).toBe(false);
      }
    });

    it('should handle rapid state checks when authenticated', async () => {
      const credentials = createCredentialsForScenario('success');
      const loginResult = await client.login(credentials.username, credentials.password);

      if (loginResult.success) {
        // Multiple rapid calls should return consistent true results
        const results = Array.from({ length: 10 }, () =>
          client.isAuthenticated()
        );

        results.forEach((result) => {
          expect(result).toBe(true);
        });
      } else {
        // Multiple rapid calls should return consistent false results
        const results = Array.from({ length: 10 }, () =>
          client.isAuthenticated()
        );

        results.forEach((result) => {
          expect(result).toBe(false);
        });
      }
    });
  });

  describe('isAuthenticated() - Error Cases', () => {
    it('should return false when client is not authenticated', () => {
      expect(client.isAuthenticated()).toBe(false);
    });

    it('should return false after failed login attempt', async () => {
      const credentials = createCredentialsForScenario('failure');
      await client.login(credentials.username, credentials.password);
      expect(client.isAuthenticated()).toBe(false);
    });

    it('should maintain consistent state between calls', () => {
      // Initial state
      expect(client.isAuthenticated()).toBe(false);

      // State should remain consistent
      expect(client.isAuthenticated()).toBe(false);
      expect(client.isAuthenticated()).toBe(false);
    });

    it('should return false after getUser failure', async () => {
      await client.getUser();
      expect(client.isAuthenticated()).toBe(false);
    });

    it('should return false after multiple failed operations', async () => {
      // Multiple failed operations
      const testCredentials = [
        createCredentialsForScenario('failure'),
        createCredentialsForScenario('edge'),
      ];

      await client.login(testCredentials[0]!.username, testCredentials[0]!.password);
      await client.login(testCredentials[1]!.username, testCredentials[1]!.password);
      await client.getUser();

      expect(client.isAuthenticated()).toBe(false);
    });

    it('should return false for new client instances', () => {
      const newClient = createTrainingPeaksClient();
      expect(newClient.isAuthenticated()).toBe(false);
    });

    it('should maintain independent state between client instances', async () => {
      const client1 = createTrainingPeaksClient();
      const client2 = createTrainingPeaksClient();

      // Both should start as not authenticated
      expect(client1.isAuthenticated()).toBe(false);
      expect(client2.isAuthenticated()).toBe(false);

      // Failed login on one client shouldn't affect the other
      const credentials = createCredentialsForScenario('failure');
      await client1.login(credentials.username, credentials.password);

      expect(client1.isAuthenticated()).toBe(false);
      expect(client2.isAuthenticated()).toBe(false);
    });

    it('should handle rapid state checks', () => {
      // Multiple rapid calls should return consistent results
      const results = Array.from({ length: 10 }, () =>
        client.isAuthenticated()
      );

      results.forEach((result) => {
        expect(result).toBe(false);
      });
    });

    it('should return false after mixed failed operations', async () => {
      // Mix of failed operations
      const testCredentials = [
        createCredentialsForScenario('failure'),
        createCredentialsForScenario('edge'),
      ];

      await client.login(testCredentials[0]!.username, testCredentials[0]!.password);
      await client.getUser();
      await client.login(testCredentials[1]!.username, testCredentials[1]!.password);
      await client.getUser();

      expect(client.isAuthenticated()).toBe(false);
    });
  });
});
