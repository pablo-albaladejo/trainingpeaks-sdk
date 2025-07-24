/**
 * Storage Repository
 * Handles storage operations for the application
 */

export type StorageRepository = {
  set: <T = unknown>(key: string, value: T) => Promise<void>;
  get: <T = unknown>(key: string) => Promise<T | null>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
};
