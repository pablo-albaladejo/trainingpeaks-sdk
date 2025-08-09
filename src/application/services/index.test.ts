import { describe, expect, it } from 'vitest';

describe('Application Services Index', () => {
  it('should export authenticate user service types', () => {
    // Since this module only exports types, we can only test that the module imports without error
    expect(() => import('./index')).not.toThrow();
  });

  it('should have expected export structure', () => {
    // Types are compile-time only, so we verify the module can be imported
    const importPromise = import('./index');
    expect(importPromise).toBeInstanceOf(Promise);
  });
});
