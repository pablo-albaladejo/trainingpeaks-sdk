import { describe, expect, it } from 'vitest';

import { API_ENDPOINTS, type ApiEndpointPath } from './api-endpoints';

describe('API_ENDPOINTS', () => {
  it('should have correct ENTITIES structure', () => {
    expect(API_ENDPOINTS.ENTITIES).toEqual({
      USERS: 'users',
      WORKOUTS: 'workouts',
    });
  });

  it('should have correct USERS structure', () => {
    expect(API_ENDPOINTS.USERS).toEqual({
      TOKEN: 'token',
      TOKEN_REFRESH: 'token/refresh',
      USER: 'user',
      PREFERENCES: 'preferences',
      SETTINGS: 'settings',
    });
  });

  it('should have correct WORKOUTS structure', () => {
    expect(API_ENDPOINTS.WORKOUTS).toEqual({
      WORKOUTS: 'workouts',
    });
  });

  it('should be readonly (as const)', () => {
    expect(Object.isFrozen(API_ENDPOINTS)).toBe(false);
    const entityUsers: 'users' = API_ENDPOINTS.ENTITIES.USERS;
    expect(entityUsers).toBe('users');
  });

  it('should export ApiEndpointPath type correctly', () => {
    const endpoint: ApiEndpointPath = 'token';
    expect(typeof endpoint).toBe('string');
  });
});
