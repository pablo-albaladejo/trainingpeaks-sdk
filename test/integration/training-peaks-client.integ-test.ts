/**
 * TrainingPeaks Client Integration Tests
 * Tests the new functional client with real dependencies
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { createTrainingPeaksClient } from '../../src/adapters/client/training-peaks-client';

describe('TrainingPeaks Client Integration', () => {
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

  it('should create a client with all required methods', () => {
    expect(client).toBeDefined();
    expect(typeof client.login).toBe('function');
    expect(typeof client.getUser).toBe('function');
    expect(typeof client.isAuthenticated).toBe('function');
    expect(typeof client.getUserId).toBe('function');
  });

  it('should handle login with invalid credentials gracefully', async () => {
    const result = await client.login('invalid-user', 'invalid-password');

    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');

    // Should not be authenticated with invalid credentials
    expect(client.isAuthenticated()).toBe(false);
    expect(client.getUserId()).toBe(null);
  });

  it('should handle getUser when not authenticated', async () => {
    const result = await client.getUser();

    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');

    // Should not be authenticated
    expect(client.isAuthenticated()).toBe(false);
  });

  it('should maintain consistent state between calls', () => {
    // Initial state
    expect(client.isAuthenticated()).toBe(false);
    expect(client.getUserId()).toBe(null);

    // State should remain consistent
    expect(client.isAuthenticated()).toBe(false);
    expect(client.getUserId()).toBe(null);
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
  });
});
