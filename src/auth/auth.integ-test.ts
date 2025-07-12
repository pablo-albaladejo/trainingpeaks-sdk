import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TrainingPeaksAuth } from '.';
import {
  skipIfNotConfigured,
  testEnvironment,
} from '../__fixtures__/testEnvironment.js';
import { TrainingPeaksClient } from '../client';

describe('Web Authentication Integration Tests', () => {
  let client: TrainingPeaksClient;
  let auth: TrainingPeaksAuth;

  beforeEach(() => {
    // Arrange: Initialize client with web authentication
    client = new TrainingPeaksClient(testEnvironment.trainingPeaksConfig);
    auth = new TrainingPeaksAuth(testEnvironment.trainingPeaksConfig);
  });

  afterEach(async () => {
    // Cleanup: Logout if authenticated
    try {
      if (auth.isAuthenticated()) {
        await auth.logout();
      }
    } catch (error) {
      // Ignore logout errors during cleanup
    }
  });

  describe('Basic Web Authentication Flow', () => {
    it(
      'should successfully login with real credentials and get user info',
      async () => {
        // Arrange: Skip test if environment is not configured
        skipIfNotConfigured();

        const credentials = {
          username: testEnvironment.testUsername,
          password: testEnvironment.testPassword,
        };
        console.log('🔑 Credentials:', credentials);

        // Act: Login with real credentials
        const token = await auth.login(credentials);

        // Assert: Verify authentication was successful
        expect(auth.isAuthenticated()).toBe(true);
        expect(token).toBeDefined();
        expect(token.accessToken).toBeDefined();
        expect(token.tokenType).toBe('Bearer');
        expect(token.expiresAt).toBeGreaterThan(Date.now());

        // Get user ID (only available with web auth)
        const userId = auth.getUserId();
        expect(userId).toBeDefined();
        expect(typeof userId).toBe('string');

        console.log('✅ Login successful!');
        console.log(`🔑 Token: ${token.accessToken.substring(0, 20)}...`);
        console.log(`👤 User ID: ${userId}`);
        console.log(
          `⏰ Expires: ${new Date(token.expiresAt).toLocaleString()}`
        );
      },
      testEnvironment.testTimeout
    );

    it(
      'should successfully logout and clear authentication',
      async () => {
        // Arrange: Login first
        skipIfNotConfigured();

        const credentials = {
          username: testEnvironment.testUsername,
          password: testEnvironment.testPassword,
        };

        await auth.login(credentials);
        expect(auth.isAuthenticated()).toBe(true);

        // Act: Logout
        await auth.logout();

        // Assert: Verify logout was successful
        expect(auth.isAuthenticated()).toBe(false);
        expect(auth.getToken()).toBeNull();
        expect(auth.getUserId()).toBeNull();

        console.log('✅ Logout successful!');
      },
      testEnvironment.testTimeout
    );

    it(
      'should get authentication token after login',
      async () => {
        // Arrange: Skip test if environment is not configured
        skipIfNotConfigured();

        const credentials = {
          username: testEnvironment.testUsername,
          password: testEnvironment.testPassword,
        };

        // Act: Login and get token
        await auth.login(credentials);
        const token = auth.getToken();

        // Assert: Verify token details
        expect(token).toBeDefined();
        expect(token!.accessToken).toBeDefined();
        expect(token!.accessToken.length).toBeGreaterThan(10);
        expect(token!.tokenType).toBe('Bearer');
        expect(token!.expiresAt).toBeGreaterThan(Date.now());

        // Token should be valid for at least 1 hour
        const oneHourFromNow = Date.now() + 60 * 60 * 1000;
        expect(token!.expiresAt).toBeGreaterThan(oneHourFromNow);

        console.log(`✅ Token retrieved successfully!`);
        console.log(`📝 Token length: ${token!.accessToken.length} characters`);
        console.log(
          `🕒 Valid for: ${Math.round((token!.expiresAt - Date.now()) / (60 * 60 * 1000))} hours`
        );
      },
      testEnvironment.testTimeout
    );
  });

  describe('TrainingPeaksClient Web Authentication', () => {
    it(
      'should successfully authenticate using client.login()',
      async () => {
        // Arrange: Skip test if environment is not configured
        skipIfNotConfigured();

        const credentials = {
          username: testEnvironment.testUsername,
          password: testEnvironment.testPassword,
        };

        // Act: Login using client
        await client.login(credentials);

        // Assert: Verify client is ready
        expect(client.isReady()).toBe(true);

        const token = client.getAuthToken();
        expect(token).toBeDefined();
        expect(token!.accessToken).toBeDefined();

        const userId = client.getUserId();
        expect(userId).toBeDefined();
        expect(typeof userId).toBe('string');

        console.log('✅ Client authentication successful!');
        console.log(`👤 User ID from client: ${userId}`);
      },
      testEnvironment.testTimeout
    );

    it(
      'should handle client logout correctly',
      async () => {
        // Arrange: Login first
        skipIfNotConfigured();

        const credentials = {
          username: testEnvironment.testUsername,
          password: testEnvironment.testPassword,
        };

        await client.login(credentials);
        expect(client.isReady()).toBe(true);

        // Act: Logout using client
        await client.logout();

        // Assert: Verify client is no longer ready
        expect(client.isReady()).toBe(false);
        expect(client.getAuthToken()).toBeNull();
        expect(client.getUserId()).toBeNull();

        console.log('✅ Client logout successful!');
      },
      testEnvironment.testTimeout
    );
  });
});
