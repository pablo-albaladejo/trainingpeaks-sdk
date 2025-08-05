import { describe, expect, it } from 'vitest';

import { AUTH_CONSTANTS, type AuthConstant } from './auth';

describe('AUTH_CONSTANTS', () => {
  it('should have correct default auth cookie', () => {
    expect(AUTH_CONSTANTS.DEFAULT_AUTH_COOKIE).toBe('Production_tpAuth');
  });

  it('should have correct default token type', () => {
    expect(AUTH_CONSTANTS.DEFAULT_TOKEN_TYPE).toBe('Bearer');
  });

  it('should export all expected constants', () => {
    expect(AUTH_CONSTANTS).toEqual({
      DEFAULT_AUTH_COOKIE: 'Production_tpAuth',
      DEFAULT_TOKEN_TYPE: 'Bearer',
    });
  });

  it('should export AuthConstant type correctly', () => {
    const cookieName: AuthConstant = 'Production_tpAuth';
    const tokenType: AuthConstant = 'Bearer';
    expect(typeof cookieName).toBe('string');
    expect(typeof tokenType).toBe('string');
  });
});
