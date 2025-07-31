/**
 * In-Memory Storage Adapter
 * Implements storage operations using in-memory storage
 * Automatically handles serialization/deserialization
 */

import type { StorageRepository } from '@/application/repositories';

export const createMemoryStorageAdapter = (): StorageRepository & {
  getSync: <T = unknown>(key: string) => T | null;
  isAuthenticatedSync: () => boolean;
  getUserIdSync: () => string | null;
} => {
  const storage = new Map<string, string>();

  // Helper function to revive Date objects during deserialization
  const reviveDates = (obj: unknown): unknown => {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      // Check if string looks like a date
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      if (dateRegex.test(obj)) {
        return new Date(obj);
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(reviveDates);
    }

    if (typeof obj === 'object') {
      const revived: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        revived[key] = reviveDates(value);
      }
      return revived;
    }

    return obj;
  };

  return {
    set: async <T = unknown>(key: string, value: T) => {
      // Store primitive values as-is, serialize complex objects to JSON
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        storage.set(key, String(value));
      } else {
        storage.set(key, JSON.stringify(value));
      }
    },
    get: async <T = unknown>(key: string) => {
      const value = storage.get(key);
      if (value === undefined) {
        return null;
      }

      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(value);
        return reviveDates(parsed) as T;
      } catch (error) {
        // If parsing fails, it's a primitive value
        // Try to convert to the expected type
        if (typeof value === 'string') {
          // Check if it's a number
          if (!isNaN(Number(value)) && value.trim() !== '') {
            return Number(value) as T;
          }
          // Check if it's a boolean
          if (value === 'true') return true as T;
          if (value === 'false') return false as T;
          // Return as string
          return value as T;
        }
        return value as T;
      }
    },
    remove: async (key: string) => {
      storage.delete(key);
    },
    clear: async () => {
      storage.clear();
    },

    // Synchronous methods for client state checking
    getSync: <T = unknown>(key: string) => {
      const value = storage.get(key);
      if (value === undefined) {
        return null;
      }

      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(value);
        return reviveDates(parsed) as T;
      } catch (error) {
        // If parsing fails, it's a primitive value
        // Try to convert to the expected type
        if (typeof value === 'string') {
          // Check if it's a number
          if (!isNaN(Number(value)) && value.trim() !== '') {
            return Number(value) as T;
          }
          // Check if it's a boolean
          if (value === 'true') return true as T;
          if (value === 'false') return false as T;
          // Return as string
          return value as T;
        }
        return value as T;
      }
    },

    isAuthenticatedSync: () => {
      const token = storage.get('auth_token');
      const user = storage.get('user');
      return !!(token && user);
    },

    getUserIdSync: () => {
      const userValue = storage.get('user');
      if (!userValue) return null;

      try {
        const user = JSON.parse(userValue);
        return user?.id || null;
      } catch (error) {
        return null;
      }
    },
  };
};
