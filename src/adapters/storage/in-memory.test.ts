/**
 * In-Memory Session Storage Tests
 * Tests for the in-memory session storage implementation
 */

import { beforeEach, describe, expect, it } from 'vitest';

import {
  authTokenBuilder,
  sessionBuilder,
  userBuilder,
} from '@/__fixtures__/auth.fixture';
import type { SessionStorage } from '@/application/ports/session-storage';

import { createInMemorySessionStorage } from './in-memory';

describe('In-Memory Session Storage', () => {
  let storage: SessionStorage;

  beforeEach(() => {
    storage = createInMemorySessionStorage();
  });

  describe('Initial State', () => {
    it('should return null when no session has been set', async () => {
      // Arrange & Act
      const session = await storage.get();

      // Assert
      expect(session).toBeNull();
    });

    it('should create independent storage instances', async () => {
      // Arrange
      const storage1 = createInMemorySessionStorage();
      const storage2 = createInMemorySessionStorage();

      const session = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'test_token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-12-31T23:59:59.000Z'),
        }),
        user: userBuilder.build({
          id: 'user123',
          name: 'Test User',
        }),
      });

      // Act
      await storage1.set(session);

      // Assert
      expect(await storage1.get()).toEqual(session);
      expect(await storage2.get()).toBeNull();
    });
  });

  describe('Set Operation', () => {
    it('should store a session successfully', async () => {
      // Arrange
      const session = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'test_access_token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-12-31T23:59:59.000Z'),
        }),
        user: userBuilder.build({
          id: 'user123',
          name: 'John Doe',
        }),
      });

      // Act
      await storage.set(session);
      const retrievedSession = await storage.get();

      // Assert
      expect(retrievedSession).toEqual(session);
      expect(retrievedSession?.token.accessToken).toBe('test_access_token');
      expect(retrievedSession?.user.id).toBe('user123');
    });

    it('should handle complete session objects', async () => {
      // Arrange
      const session = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'complete_token',
          tokenType: 'JWT',
          expiresIn: 7200,
          expires: new Date('2024-12-31T23:59:59.000Z'),
          refreshToken: 'refresh_token_123',
        }),
        user: userBuilder.build({
          id: 'complete_user',
          name: 'Complete User',
          avatar: 'https://example.com/avatar.jpg',
          preferences: {
            timezone: 'UTC',
            language: 'en',
            theme: 'dark',
          },
        }),
      });

      // Act
      await storage.set(session);
      const retrievedSession = await storage.get();

      // Assert
      expect(retrievedSession).toEqual(session);
      expect(retrievedSession?.token.refreshToken).toBe('refresh_token_123');
      expect(retrievedSession?.user.preferences?.theme).toBe('dark');
    });

    it('should overwrite existing session', async () => {
      // Arrange
      const session1 = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'first_token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-06-01T00:00:00.000Z'),
        }),
        user: userBuilder.build({ id: 'user1', name: 'First User' }),
      });

      const session2 = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'second_token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-06-02T00:00:00.000Z'),
        }),
        user: userBuilder.build({ id: 'user2', name: 'Second User' }),
      });

      // Act
      await storage.set(session1);
      const firstRetrieved = await storage.get();

      await storage.set(session2);
      const secondRetrieved = await storage.get();

      // Assert
      expect(firstRetrieved?.token.accessToken).toBe('first_token');
      expect(secondRetrieved?.token.accessToken).toBe('second_token');
      expect(secondRetrieved?.user.name).toBe('Second User');
    });
  });

  describe('Get Operation', () => {
    it('should return the exact session that was stored', async () => {
      // Arrange
      const originalSession = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'exact_token',
          tokenType: 'Bearer',
          expiresIn: 7200,
          expires: new Date('2024-08-15T14:30:00.000Z'),
          refreshToken: 'exact_refresh',
        }),
        user: userBuilder.build({
          id: 'exact_user',
          name: 'Exact User',
          avatar: 'https://exact.com/avatar.png',
        }),
      });

      // Act
      await storage.set(originalSession);
      const retrievedSession = await storage.get();

      // Assert
      expect(retrievedSession).toEqual(originalSession);
    });

    it('should return consistent data across multiple get calls', async () => {
      // Arrange
      const session = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'consistent_token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-12-31T23:59:59.000Z'),
        }),
        user: userBuilder.build({ id: 'user123', name: 'Consistent User' }),
      });

      // Act
      await storage.set(session);
      const firstGet = await storage.get();
      const secondGet = await storage.get();
      const thirdGet = await storage.get();

      // Assert
      expect(firstGet).toEqual(session);
      expect(secondGet).toEqual(session);
      expect(thirdGet).toEqual(session);
      expect(firstGet).toEqual(secondGet);
      expect(secondGet).toEqual(thirdGet);
    });
  });

  describe('Clear Operation', () => {
    it('should clear stored session', async () => {
      // Arrange
      const session = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'to_be_cleared',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-12-31T23:59:59.000Z'),
        }),
        user: userBuilder.build({ id: 'user123', name: 'To Be Cleared' }),
      });

      await storage.set(session);
      const beforeClear = await storage.get();

      // Act
      await storage.clear();
      const afterClear = await storage.get();

      // Assert
      expect(beforeClear).toEqual(session);
      expect(afterClear).toBeNull();
    });

    it('should handle clearing when no session exists', async () => {
      // Arrange
      const beforeClear = await storage.get();

      // Act
      await storage.clear();
      const afterClear = await storage.get();

      // Assert
      expect(beforeClear).toBeNull();
      expect(afterClear).toBeNull();
    });

    it('should allow setting new session after clear', async () => {
      // Arrange
      const firstSession = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'first_session',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-12-31T23:59:59.000Z'),
        }),
        user: userBuilder.build({ id: 'user1', name: 'First Session' }),
      });

      const secondSession = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'second_session',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-12-31T23:59:59.000Z'),
        }),
        user: userBuilder.build({ id: 'user2', name: 'Second Session' }),
      });

      // Act
      await storage.set(firstSession);
      await storage.clear();
      await storage.set(secondSession);
      const finalSession = await storage.get();

      // Assert
      expect(finalSession).toEqual(secondSession);
      expect(finalSession?.token.accessToken).toBe('second_session');
    });
  });

  describe('Storage Interface Compliance', () => {
    it('should implement all required SessionStorage methods', () => {
      // Assert
      expect(typeof storage.get).toBe('function');
      expect(typeof storage.set).toBe('function');
      expect(typeof storage.clear).toBe('function');
    });

    it('should return promises for all methods', () => {
      // Arrange
      const session = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'test_token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-12-31T23:59:59.000Z'),
        }),
        user: userBuilder.build({ id: 'user123', name: 'Test User' }),
      });

      // Act & Assert
      expect(storage.get()).toBeInstanceOf(Promise);
      expect(storage.set(session)).toBeInstanceOf(Promise);
      expect(storage.clear()).toBeInstanceOf(Promise);
    });

    it('should handle error scenarios gracefully', async () => {
      // Act & Assert - Should not throw errors
      await expect(storage.get()).resolves.toBeNull();
      await expect(storage.clear()).resolves.toBeUndefined();

      const session = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'test_token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-12-31T23:59:59.000Z'),
        }),
        user: userBuilder.build({ id: 'user123', name: 'Test User' }),
      });
      await expect(storage.set(session)).resolves.toBeUndefined();
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should support typical authentication flow', async () => {
      // Arrange - Simulate login
      const loginSession = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'login_access_token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date(Date.now() + 3600000),
          refreshToken: 'login_refresh_token',
        }),
        user: userBuilder.build({
          id: 'authenticated_user',
          name: 'Authenticated User',
          preferences: { timezone: 'America/New_York' },
        }),
      });

      // Act - Login flow
      await storage.set(loginSession);
      const storedSession = await storage.get();

      // Simulate token refresh
      const refreshedSession = {
        ...storedSession!,
        token: {
          ...storedSession!.token,
          accessToken: 'refreshed_access_token',
          expires: new Date(Date.now() + 3600000),
        },
      };

      await storage.set(refreshedSession);
      const refreshedStoredSession = await storage.get();

      // Simulate logout
      await storage.clear();
      const loggedOutSession = await storage.get();

      // Assert
      expect(storedSession?.token.accessToken).toBe('login_access_token');
      expect(refreshedStoredSession?.token.accessToken).toBe(
        'refreshed_access_token'
      );
      expect(refreshedStoredSession?.user.id).toBe('authenticated_user'); // User data preserved
      expect(loggedOutSession).toBeNull();
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      const session = sessionBuilder.build({
        token: authTokenBuilder.build({
          accessToken: 'concurrent_token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expires: new Date('2024-12-31T23:59:59.000Z'),
        }),
        user: userBuilder.build({ id: 'user123', name: 'Concurrent User' }),
      });

      // Act
      const operations = await Promise.allSettled([
        storage.set(session),
        storage.get(),
        storage.clear(),
        storage.get(),
        storage.set(session),
      ]);

      // Assert
      expect(operations.every((op) => op.status === 'fulfilled')).toBe(true);

      // Final state should have the session from the last set
      const finalSession = await storage.get();
      expect(finalSession).toEqual(session);
    });
  });
});
