/**
 * Tests for session utilities
 */

import { describe, expect, it, vi } from 'vitest';

import { createHttpError } from '@/adapters/errors/http-errors';
import { ERROR_CODES, ERROR_MESSAGES } from '@/domain/errors/error-codes';

import { getAthleteIdFromSession } from './session-utils';

vi.mock('@/adapters/errors/http-errors');

describe('getAthleteIdFromSession', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  };

  const mockSession = {
    user: {
      id: '12345',
      email: 'test@example.com',
    },
    token: {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    },
  };

  it('should return athlete ID from session when session exists', async () => {
    const mockSessionStorage = {
      get: vi.fn().mockResolvedValue(mockSession),
      set: vi.fn(),
      clear: vi.fn(),
    };

    const deps = {
      sessionStorage: mockSessionStorage,
      logger: mockLogger,
    };

    const result = await getAthleteIdFromSession(deps);

    expect(result).toBe(mockSession.user.id);
    expect(mockLogger.info).toHaveBeenCalledWith(
      'No athleteId provided, getting from current user session'
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Using current user ID as athleteId',
      { athleteId: mockSession.user.id }
    );
  });

  it('should throw HttpError when no session exists', async () => {
    const mockSessionStorage = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn(),
      clear: vi.fn(),
    };

    const mockCreateHttpError = vi.mocked(createHttpError);
    const mockHttpError = new Error('Unauthorized');
    mockCreateHttpError.mockReturnValue(mockHttpError);

    const deps = {
      sessionStorage: mockSessionStorage,
      logger: mockLogger,
    };

    await expect(getAthleteIdFromSession(deps)).rejects.toThrow(mockHttpError);

    expect(mockCreateHttpError).toHaveBeenCalledWith(
      {
        status: 401,
        statusText: 'Unauthorized',
        data: { message: ERROR_MESSAGES[ERROR_CODES.AUTH_NO_ACTIVE_SESSION] },
      },
      {
        url: 'session',
        method: 'GET',
      }
    );
  });
});
