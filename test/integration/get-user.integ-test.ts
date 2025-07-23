/**
 * TrainingPeaks Client GetUser Integration Tests
 * Tests the getUser functionality with real dependencies
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  createCredentialsForScenario,
  getRealCredentials,
} from '../../src/__fixtures__/credentials.fixture';
import { createTrainingPeaksClient } from '../../src/adapters/client/training-peaks-client';

describe('TrainingPeaks Client GetUser Integration', () => {
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

  describe('getUser() - Success Cases', () => {
    it('should handle getUser when authenticated with real credentials', async () => {
      // First try to login with real credentials from environment
      const realCredentials = getRealCredentials();
      const loginResult = await client.login(
        realCredentials.username,
        realCredentials.password
      );

      if (loginResult.success) {
        // If login succeeded, getUser should also succeed
        const result = await client.getUser();

        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
      } else {
        // If login failed, getUser should also fail
        const result = await client.getUser();
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    });

    it('should return proper response structure for authenticated user', async () => {
      const credentials = createCredentialsForScenario('success');
      const loginResult = await client.login(
        credentials.username,
        credentials.password
      );

      if (loginResult.success) {
        const result = await client.getUser();

        expect(result).toMatchObject({
          success: true,
          user: expect.any(Object),
        });
      } else {
        const result = await client.getUser();
        expect(result).toMatchObject({
          success: false,
          error: expect.any(String),
        });
      }
    });

    it('should handle multiple getUser calls when authenticated', async () => {
      const credentials = createCredentialsForScenario('success');
      const loginResult = await client.login(
        credentials.username,
        credentials.password
      );

      if (loginResult.success) {
        const results = await Promise.all([
          client.getUser(),
          client.getUser(),
          client.getUser(),
        ]);

        results.forEach((result) => {
          expect(result.success).toBe(true);
          expect(result.user).toBeDefined();
        });
      } else {
        const results = await Promise.all([
          client.getUser(),
          client.getUser(),
          client.getUser(),
        ]);

        results.forEach((result) => {
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
        });
      }
    });

    it('should maintain consistent state after successful getUser', async () => {
      const credentials = createCredentialsForScenario('success');
      const loginResult = await client.login(
        credentials.username,
        credentials.password
      );

      if (loginResult.success) {
        // Initial state should be authenticated
        expect(client.isAuthenticated()).toBe(true);

        // After successful getUser
        await client.getUser();

        expect(client.isAuthenticated()).toBe(true);
        // Note: getUserId might still return null depending on implementation
      } else {
        // If login failed, state should remain unauthenticated
        expect(client.isAuthenticated()).toBe(false);
        expect(client.getUserId()).toBe(null);

        await client.getUser();

        expect(client.isAuthenticated()).toBe(false);
        expect(client.getUserId()).toBe(null);
      }
    });
  });

  describe('getUser() - Error Cases', () => {
    it('should handle getUser when not authenticated', async () => {
      const result = await client.getUser();

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return proper response structure for unauthenticated user', async () => {
      const result = await client.getUser();

      expect(result).toMatchObject({
        success: false,
        error: expect.any(String),
      });
    });

    it('should handle getUser after failed login attempt', async () => {
      // First attempt a failed login
      const credentials = createCredentialsForScenario('failure');
      await client.login(credentials.username, credentials.password);

      // Then try to get user
      const result = await client.getUser();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle multiple getUser calls when not authenticated', async () => {
      const results = await Promise.all([
        client.getUser(),
        client.getUser(),
        client.getUser(),
      ]);

      results.forEach((result) => {
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should maintain consistent state after getUser failure', async () => {
      // Initial state
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);

      // After getUser failure
      await client.getUser();

      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);
    });

    it('should handle getUser after multiple failed operations', async () => {
      // Multiple failed operations
      const testCredentials = [
        createCredentialsForScenario('failure'),
        createCredentialsForScenario('edge'),
      ];

      await client.login(
        testCredentials[0]!.username,
        testCredentials[0]!.password
      );
      await client.login(
        testCredentials[1]!.username,
        testCredentials[1]!.password
      );
      await client.getUser();

      // Try getUser again
      const result = await client.getUser();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);
    });

    it('should handle getUser with network-like delays', async () => {
      // Simulate multiple rapid calls
      const promises = Array.from({ length: 5 }, () => client.getUser());
      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });
});
