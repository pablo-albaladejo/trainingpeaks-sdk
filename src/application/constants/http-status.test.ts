import { describe, expect,it } from 'vitest';

import { HTTP_STATUS, type HttpStatus } from './http-status';

describe('HTTP_STATUS', () => {
  it('should have correct success status codes', () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.CREATED).toBe(201);
    expect(HTTP_STATUS.NO_CONTENT).toBe(204);
  });

  it('should have correct client error status codes', () => {
    expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    expect(HTTP_STATUS.FORBIDDEN).toBe(403);
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
  });

  it('should have correct server error status codes', () => {
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
  });

  it('should export all expected HTTP status codes', () => {
    expect(HTTP_STATUS).toEqual({
      OK: 200,
      CREATED: 201,
      NO_CONTENT: 204,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      INTERNAL_SERVER_ERROR: 500,
    });
  });

  it('should export HttpStatus type correctly', () => {
    const okStatus: HttpStatus = 200;
    const notFoundStatus: HttpStatus = 404;
    expect(typeof okStatus).toBe('number');
    expect(typeof notFoundStatus).toBe('number');
  });
});