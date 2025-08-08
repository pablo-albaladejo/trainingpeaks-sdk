/* eslint-disable @typescript-eslint/unbound-method */

/**
 * Token API Tests
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { HttpClient } from '@/adapters/http';

import { getAuthToken, refreshAuthToken } from './token.api';
import type { RefreshTokenRequest } from './token.types';

const mockHttpClient: HttpClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

describe('Token API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getAuthToken', () => {
    it('should call GET with correct headers and cookies', async () => {
      const mockResponse = {
        data: { token: { access_token: 'test' } },
        success: true,
        cookies: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await getAuthToken(mockHttpClient, ['test-cookie']);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/users\/v3\/token$/),
        expect.objectContaining({
          headers: expect.objectContaining({
            accept: '*/*',
          }),
          cookies: ['test-cookie'],
        })
      );
    });
  });

  describe('refreshAuthToken', () => {
    it('should call POST with correct Content-Type header', async () => {
      const mockResponse = {
        data: { token: { access_token: 'refreshed-token' } },
        success: true,
        cookies: [],
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const refreshRequest: RefreshTokenRequest = {
        refreshToken: 'test-refresh-token',
      };

      await refreshAuthToken(mockHttpClient, refreshRequest);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/users\/v3\/token\/refresh$/),
        refreshRequest,
        expect.objectContaining({
          headers: expect.objectContaining({
            accept: '*/*',
          }),
        })
      );

      // Verify Content-Type header case-insensitively
      const [, , options] = mockHttpClient.post.mock.calls[0];
      const headers = options?.headers || {};
      const contentTypeKey = Object.keys(headers).find(key => 
        key.toLowerCase() === 'content-type'
      );
      expect(contentTypeKey).toBeDefined();
      expect(headers[contentTypeKey!]).toBe('application/json');
    });

    it('should send refresh token in request body', async () => {
      const mockResponse = {
        data: { token: { access_token: 'refreshed-token' } },
        success: true,
        cookies: [],
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const refreshRequest: RefreshTokenRequest = {
        refreshToken: 'test-refresh-token',
      };

      await refreshAuthToken(mockHttpClient, refreshRequest);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/users\/v3\/token\/refresh$/),
        refreshRequest,
        expect.any(Object)
      );
    });
  });
});
