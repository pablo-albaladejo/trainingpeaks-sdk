import { describe, expect, it } from 'vitest';

import * as adapters from './index';

describe('Adapters Index', () => {
  it('should export logging adapters', () => {
    expect(adapters).toHaveProperty('createLogger');
  });

  it('should export storage adapters', () => {
    expect(adapters).toHaveProperty('createInMemorySessionStorage');
  });

  it('should export adapter errors', () => {
    expect(adapters).toHaveProperty('HttpError');
    expect(adapters).toHaveProperty('createHttpError');
  });

  it('should export constants', () => {
    expect(adapters).toHaveProperty('API_ENDPOINTS');
    expect(adapters).toHaveProperty('STORAGE_KEYS');
  });

  it('should have expected export structure', () => {
    const exportKeys = Object.keys(adapters);
    expect(exportKeys.length).toBeGreaterThan(0);
  });
});
