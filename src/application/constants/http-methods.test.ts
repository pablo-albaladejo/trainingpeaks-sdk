import { describe, expect, it } from 'vitest';

import { HTTP_METHODS, type HttpMethod } from './http-methods';

describe('HTTP_METHODS', () => {
  it('should have correct GET method', () => {
    expect(HTTP_METHODS.GET).toBe('GET');
  });

  it('should have correct POST method', () => {
    expect(HTTP_METHODS.POST).toBe('POST');
  });

  it('should have correct PUT method', () => {
    expect(HTTP_METHODS.PUT).toBe('PUT');
  });

  it('should have correct DELETE method', () => {
    expect(HTTP_METHODS.DELETE).toBe('DELETE');
  });

  it('should have correct PATCH method', () => {
    expect(HTTP_METHODS.PATCH).toBe('PATCH');
  });

  it('should export all expected HTTP methods', () => {
    expect(HTTP_METHODS).toEqual({
      GET: 'GET',
      POST: 'POST',
      PUT: 'PUT',
      DELETE: 'DELETE',
      PATCH: 'PATCH',
    });
  });

  it('should export HttpMethod type correctly', () => {
    const getMethod: HttpMethod = 'GET';
    const postMethod: HttpMethod = 'POST';
    expect(typeof getMethod).toBe('string');
    expect(typeof postMethod).toBe('string');
  });
});
