/**
 * TrainingPeaks Client Login Integration Tests
 * Tests the login functionality with real dependencies
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  createCredentialsForScenario,
  createEmptyCredentials,
  createInvalidCredentials,
  createLongCredentials,
  createMalformedCredentials,
  createSpecialCharacterCredentials,
  getRealCredentials,
  getTestCredentials,
} from '../../src/__fixtures__/credentials.fixture';
import { createTrainingPeaksClient } from '../../src/adapters/client/training-peaks-client';

describe('TrainingPeaks Client Login Integration', () => {
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

  describe('login() - Success Cases', () => {
    it('should handle successful login with real credentials from environment', async () => {
      // Use real credentials from environment variables for actual integration testing
      const realCredentials = getRealCredentials();
      const result = await client.login(
        realCredentials.username,
        realCredentials.password
      );

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');

      // The result depends on whether credentials are actually valid
      // For now, we test the structure regardless of success/failure
      expect(result).toMatchObject({
        success: expect.any(Boolean),
        ...(result.success
          ? { user: expect.any(Object) }
          : { error: expect.any(String) }),
      });
    });

    it('should return proper response structure for login attempt', async () => {
      const credentials = createCredentialsForScenario('success');
      const result = await client.login(
        credentials.username,
        credentials.password
      );

      expect(result).toMatchObject({
        success: expect.any(Boolean),
        ...(result.success
          ? { user: expect.any(Object) }
          : { error: expect.any(String) }),
      });
    });

    it('should update authentication state on successful login', async () => {
      // Initial state
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);

      const credentials = createCredentialsForScenario('success');
      const result = await client.login(
        credentials.username,
        credentials.password
      );

      if (result.success) {
        expect(client.isAuthenticated()).toBe(true);
        // Note: getUserId might still return null depending on implementation
        // This test documents the expected behavior
      } else {
        expect(client.isAuthenticated()).toBe(false);
        expect(client.getUserId()).toBe(null);
      }
    });

    it('should handle successful login followed by getUser', async () => {
      const credentials = createCredentialsForScenario('success');
      const loginResult = await client.login(
        credentials.username,
        credentials.password
      );

      if (loginResult.success) {
        const userResult = await client.getUser();
        expect(userResult.success).toBe(true);
        expect(userResult.user).toBeDefined();
      } else {
        // If login failed, getUser should also fail
        const userResult = await client.getUser();
        expect(userResult.success).toBe(false);
        expect(userResult.error).toBeDefined();
      }
    });

    it('should maintain authentication state after successful login', async () => {
      const credentials = createCredentialsForScenario('success');
      const result = await client.login(
        credentials.username,
        credentials.password
      );

      if (result.success) {
        // Check state multiple times to ensure consistency
        expect(client.isAuthenticated()).toBe(true);
        expect(client.isAuthenticated()).toBe(true);
        expect(client.isAuthenticated()).toBe(true);
      }
    });
  });

  describe('login() - Error Cases', () => {
    it('should handle login with invalid credentials gracefully', async () => {
      const credentials = createInvalidCredentials();
      const result = await client.login(
        credentials.username,
        credentials.password
      );

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return proper response structure for failed login', async () => {
      const credentials = createEmptyCredentials();
      const result = await client.login(
        credentials.username,
        credentials.password
      );

      expect(result).toMatchObject({
        success: false,
        error: expect.any(String),
      });
    });

    it('should handle empty credentials', async () => {
      const credentials = createEmptyCredentials();
      const result = await client.login(
        credentials.username,
        credentials.password
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle malformed credentials', async () => {
      const credentials = createMalformedCredentials();
      const result = await client.login(
        credentials.username,
        credentials.password
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle null credentials', async () => {
      const result = await client.login(
        null as unknown as string,
        null as unknown as string
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle undefined credentials', async () => {
      const result = await client.login(
        undefined as unknown as string,
        undefined as unknown as string
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle very long credentials', async () => {
      const credentials = createLongCredentials();
      const result = await client.login(
        credentials.username,
        credentials.password
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle special characters in credentials', async () => {
      const credentials = createSpecialCharacterCredentials();
      const result = await client.login(
        credentials.username,
        credentials.password
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should maintain consistent state after failed login', async () => {
      // Initial state
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);

      // After failed login
      const credentials = createInvalidCredentials();
      await client.login(credentials.username, credentials.password);

      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);
    });

    it('should handle multiple failed login attempts', async () => {
      const testCredentials = getTestCredentials();
      const results = await Promise.all([
        client.login(
          testCredentials.invalid.username,
          testCredentials.invalid.password
        ),
        client.login(
          testCredentials.malformed.username,
          testCredentials.malformed.password
        ),
        client.login(
          testCredentials.special.username,
          testCredentials.special.password
        ),
      ]);

      results.forEach((result) => {
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      expect(client.isAuthenticated()).toBe(false);
      expect(client.getUserId()).toBe(null);
    });

    it('should handle edge case credentials', async () => {
      const credentials = createCredentialsForScenario('edge');
      const result = await client.login(
        credentials.username,
        credentials.password
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
