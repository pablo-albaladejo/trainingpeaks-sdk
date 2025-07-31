/**
 * Memory Storage Adapter Tests
 * Tests for automatic serialization/deserialization handling
 */

import { createUser } from '@/domain/entities/user';
import { createAuthToken } from '@/domain/value-objects/auth-token';
import { describe, expect, it } from 'vitest';
import { createMemoryStorageAdapter } from './memory-storage-adapter';

describe('Memory Storage Adapter', () => {
  it('should store and retrieve primitive values', async () => {
    const storage = createMemoryStorageAdapter();

    await storage.set('string-key', 'test-value');
    await storage.set('number-key', 42);
    await storage.set('boolean-key', true);

    expect(await storage.get<string>('string-key')).toBe('test-value');
    expect(await storage.get<number>('number-key')).toBe(42);
    expect(await storage.get<boolean>('boolean-key')).toBe(true);
  });

  it('should automatically serialize and deserialize complex objects', async () => {
    const storage = createMemoryStorageAdapter();

    const authToken = createAuthToken(
      'access-token-123',
      'Bearer',
      new Date('2024-12-31T23:59:59Z'),
      'refresh-token-456'
    );

    const user = createUser('user-123', 'John Doe', 'avatar.jpg', {
      theme: 'dark',
    });

    // Store complex objects directly
    await storage.set('auth-token', authToken);
    await storage.set('user', user);

    // Retrieve and verify they are properly deserialized
    const retrievedToken = await storage.get<typeof authToken>('auth-token');
    const retrievedUser = await storage.get<typeof user>('user');

    expect(retrievedToken).toEqual(authToken);
    expect(retrievedUser).toEqual(user);
  });

  it('should handle nested objects correctly', async () => {
    const storage = createMemoryStorageAdapter();

    const complexObject = {
      id: 'test-123',
      data: {
        nested: {
          value: 42,
          array: [1, 2, 3],
          boolean: true,
        },
      },
      timestamp: new Date('2024-01-01T00:00:00Z'),
    };

    await storage.set('complex', complexObject);
    const retrieved = await storage.get<typeof complexObject>('complex');

    expect(retrieved).toEqual(complexObject);
  });

  it('should return null for non-existent keys', async () => {
    const storage = createMemoryStorageAdapter();

    expect(await storage.get('non-existent')).toBeNull();
  });

  it('should handle remove and clear operations', async () => {
    const storage = createMemoryStorageAdapter();

    await storage.set('key1', 'value1');
    await storage.set('key2', 'value2');

    expect(await storage.get('key1')).toBe('value1');
    expect(await storage.get('key2')).toBe('value2');

    // Remove specific key
    await storage.remove('key1');
    expect(await storage.get('key1')).toBeNull();
    expect(await storage.get('key2')).toBe('value2');

    // Clear all
    await storage.clear();
    expect(await storage.get('key2')).toBeNull();
  });

  it('should handle Date objects correctly', async () => {
    const storage = createMemoryStorageAdapter();

    const originalDate = new Date('2024-12-31T23:59:59Z');
    await storage.set('date', originalDate);

    const retrievedDate = await storage.get<Date>('date');
    expect(retrievedDate).toEqual(originalDate);
    expect(retrievedDate instanceof Date).toBe(true);
  });

  it('should handle arrays correctly', async () => {
    const storage = createMemoryStorageAdapter();

    const array = [1, 'test', { nested: true }, [1, 2, 3]];
    await storage.set('array', array);

    const retrievedArray = await storage.get<typeof array>('array');
    expect(retrievedArray).toEqual(array);
  });
});
