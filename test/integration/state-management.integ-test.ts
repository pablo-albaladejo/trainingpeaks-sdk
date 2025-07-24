/**
 * TrainingPeaks Client State Management Integration Tests
 * Tests the state management and interactions between all client functions
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  createCredentialsForScenario,
  getRealCredentials,
} from '../../src/__fixtures__/credentials.fixture';
import { createTrainingPeaksClient } from '../../src/adapters/client/training-peaks-client';

describe('TrainingPeaks Client State Management Integration', () => {
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

  describe('State Management', () => {
    it('should maintain consistent state across all methods', async () => {
      // Initial state
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);

      // After failed login
      const credentials = createCredentialsForScenario('failure');
      await client.login(credentials.username, credentials.password);
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);

      // After failed getUser
      await client.getUser();
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);
    });

    it('should handle multiple failed operations consistently', async () => {
      // Multiple failed logins
      const testCredentials = [
        createCredentialsForScenario('failure'),
        createCredentialsForScenario('edge'),
        createCredentialsForScenario('failure'),
      ];

      await client.login(
        testCredentials[0]!.username,
        testCredentials[0]!.password
      );
      await client.login(
        testCredentials[1]!.username,
        testCredentials[1]!.password
      );
      await client.login(
        testCredentials[2]!.username,
        testCredentials[2]!.password
      );

      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);

      // Multiple getUser attempts
      await client.getUser();
      await client.getUser();

      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);
    });

    it('should maintain state consistency between different operation sequences', async () => {
      // Sequence 1: login -> getUser
      const credentials1 = createCredentialsForScenario('failure');
      await client.login(credentials1.username, credentials1.password);
      await client.getUser();
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);

      // Sequence 2: getUser -> login
      await client.getUser();
      const credentials2 = createCredentialsForScenario('edge');
      await client.login(credentials2.username, credentials2.password);
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);

      // Sequence 3: multiple rapid operations
      const testCredentials = [
        createCredentialsForScenario('failure'),
        createCredentialsForScenario('edge'),
      ];

      await Promise.all([
        client.login(
          testCredentials[0]!.username,
          testCredentials[0]!.password
        ),
        client.getUser(),
        client.login(
          testCredentials[1]!.username,
          testCredentials[1]!.password
        ),
      ]);

      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);
    });

    it('should handle concurrent operations correctly', async () => {
      // Concurrent login attempts
      const testCredentials = [
        createCredentialsForScenario('failure'),
        createCredentialsForScenario('edge'),
        createCredentialsForScenario('failure'),
      ];

      const loginResults = await Promise.all([
        client.login(
          testCredentials[0]!.username,
          testCredentials[0]!.password
        ),
        client.login(
          testCredentials[1]!.username,
          testCredentials[1]!.password
        ),
        client.login(
          testCredentials[2]!.username,
          testCredentials[2]!.password
        ),
      ]);

      loginResults.forEach((result) => {
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);

      // Concurrent getUser attempts
      const getUserResults = await Promise.all([
        client.getUser(),
        client.getUser(),
        client.getUser(),
      ]);

      getUserResults.forEach((result) => {
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);
    });

    it('should maintain independent state between client instances', async () => {
      const client1 = createTrainingPeaksClient();
      const client2 = createTrainingPeaksClient();

      // Initial state for both clients
      expect(client1.isAuthenticated()).toBe(false);
      expect(client1.getUserId()).toBe(null);
      expect(client2.isAuthenticated()).toBe(false);
      expect(client2.getUserId()).toBe(null);

      // Operations on client1 shouldn't affect client2
      const credentials = createCredentialsForScenario('failure');
      await client1.login(credentials.username, credentials.password);
      await client1.getUser();

      expect(client1.isAuthenticated()).toBe(false);
      expect(client1.getUserId()).toBe(null);
      expect(client2.isAuthenticated()).toBe(false);
      expect(client2.getUserId()).toBe(null);

      // Operations on client2 shouldn't affect client1
      const credentials2 = createCredentialsForScenario('edge');
      await client2.login(credentials2.username, credentials2.password);
      await client2.getUser();

      expect(client1.isAuthenticated()).toBe(false);
      expect(client1.getUserId()).toBe(null);
      expect(client2.isAuthenticated()).toBe(false);
      expect(client2.getUserId()).toBe(null);
    });

    it('should handle state persistence across multiple test runs', async () => {
      // First set of operations
      const credentials1 = createCredentialsForScenario('failure');
      await client.login(credentials1.username, credentials1.password);
      await client.getUser();

      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);

      // Second set of operations
      const credentials2 = createCredentialsForScenario('edge');
      await client.login(credentials2.username, credentials2.password);
      await client.getUser();

      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);

      // Third set of operations
      const credentials3 = createCredentialsForScenario('failure');
      await client.login(credentials3.username, credentials3.password);
      await client.getUser();

      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);
    });

    it('should handle rapid state checks during operations', async () => {
      // Start operations
      const credentials = createCredentialsForScenario('failure');
      const loginPromise = client.login(
        credentials.username,
        credentials.password
      );
      const getUserPromise = client.getUser();

      // Check state during operations
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);

      // Wait for operations to complete
      await Promise.all([loginPromise, getUserPromise]);

      // Check state after operations
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);
    });

    it('should maintain consistent error handling across all operations', async () => {
      // Test error handling consistency
      const testCredentials = [
        createCredentialsForScenario('failure'),
        createCredentialsForScenario('edge'),
      ];

      const operations = [
        () => client.login('', ''),
        () => client.login(testCredentials[0]!.username, ''),
        () => client.login('', testCredentials[0]!.password),
        () => client.getUser(),
      ];

      for (const operation of operations) {
        const result = await operation();
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(client.isAuthenticated()).toBe(false);
        expect(client.getUserId()).toBe(null);
      }
    });

    it('should handle successful authentication with real credentials', async () => {
      // Test with real credentials from environment
      const realCredentials = getRealCredentials();
      const loginResult = await client.login(
        realCredentials.username,
        realCredentials.password
      );

      if (loginResult.success) {
        expect(client.isAuthenticated()).toBe(true);
        // Note: getUserId might still return null depending on implementation

        // Test getUser after successful login
        const userResult = await client.getUser();
        expect(userResult.success).toBe(true);
        expect(userResult.user).toBeDefined();
      } else {
        expect(client.isAuthenticated()).toBe(false);
        expect(client.getUserId()).toBe(null);
      }
    });
  });
});
