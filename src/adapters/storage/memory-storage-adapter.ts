/**
 * In-Memory Storage Adapter
 * Implements storage operations using in-memory storage
 */

import { StorageRepository } from '../../domain/repositories/storage-repository';

export const createMemoryStorageAdapter = (): StorageRepository => {
  const storage = new Map<string, string>();

  return {
    set: async <T = unknown>(key: string, value: T) => {
      storage.set(key, value as string);
    },
    get: async <T = unknown>(key: string) => {
      return storage.get(key) as T | null;
    },
    remove: async (key: string) => {
      storage.delete(key);
    },
    clear: async () => {
      storage.clear();
    },
  };
};
