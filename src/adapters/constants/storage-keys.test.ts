import { describe, expect,it } from 'vitest';

import { STORAGE_KEYS, type StorageKey } from './storage-keys';

describe('STORAGE_KEYS', () => {
  it('should have correct auth token key', () => {
    expect(STORAGE_KEYS.AUTH_TOKEN).toBe('auth_token');
  });

  it('should have correct user key', () => {
    expect(STORAGE_KEYS.USER).toBe('user');
  });

  it('should export all expected storage keys', () => {
    expect(STORAGE_KEYS).toEqual({
      AUTH_TOKEN: 'auth_token',
      USER: 'user',
    });
  });

  it('should export StorageKey type correctly', () => {
    const authKey: StorageKey = 'auth_token';
    const userKey: StorageKey = 'user';
    expect(typeof authKey).toBe('string');
    expect(typeof userKey).toBe('string');
  });
});