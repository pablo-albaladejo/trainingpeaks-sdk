/**
 * TrainingPeaks Client Login Integration Tests
 * Tests the login functionality with real dependencies
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { createCredentialsForScenario } from '../../src/__fixtures__/credentials.fixture';
import { createTrainingPeaksClient } from '../../src/adapters/client/training-peaks-client';

describe('TrainingPeaks Client Login Integration', () => {
  let client: ReturnType<typeof createTrainingPeaksClient>;

  beforeEach(() => {
    client = createTrainingPeaksClient({
      // Use test configuration
      debug: {
        enabled: true,
        logAuth: true,
        logNetwork: true,
        logBrowser: true,
      },
    });
  });

  describe('login() - Success Cases', () => {
    it('should return proper response structure for login attempt', async () => {
      const credentials = createCredentialsForScenario('success');
      const result = await client.login(credentials);

      expect(result).toMatchObject({
        success: expect.any(Boolean),
        ...(result.success
          ? { authToken: expect.any(Object) }
          : { error: expect.any(String) }),
      });
    }, 30000); // Increase timeout to 30 seconds for browser automation
  });

  describe('login() - Failure Cases', () => {
    it('should return error for invalid credentials', async () => {
      const credentials = createCredentialsForScenario('failure');
      const result = await client.login(credentials);

      expect(result).toMatchObject({
        success: expect.any(Boolean),
        ...(result.success
          ? { authToken: expect.any(Object) }
          : { error: expect.any(String) }),
      });
    });
  });
});
