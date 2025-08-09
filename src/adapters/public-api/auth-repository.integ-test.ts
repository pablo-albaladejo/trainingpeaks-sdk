/* eslint-disable @typescript-eslint/unbound-method */

import { notFoundErrorBuilder } from '@fixtures/http-errors.fixture';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Logger } from '@/adapters';
import { type HttpClient } from '@/adapters/http';
import { type HttpResponse, SessionStorage } from '@/application';
import { createCredentials } from '@/domain';

import { createAuthRepository } from './auth-repository';

describe('AuthRepository - Integration Tests', () => {
  let mockHttpClient: HttpClient;
  let mockSessionStorage: SessionStorage;
  let mockLogger: Logger;
  let dependencies: Parameters<typeof createAuthRepository>[0];

  beforeEach(() => {
    vi.resetAllMocks();

    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
    };

    mockSessionStorage = {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn(),
    };

    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    };

    dependencies = {
      httpClient: mockHttpClient,
      sessionStorage: mockSessionStorage,
      logger: mockLogger,
    };
  });

  describe('Integration Tests', () => {
    it('should handle complete login/logout cycle', async () => {
      const repository = createAuthRepository(dependencies);

      // Setup successful login mocks
      vi.mocked(mockHttpClient.get).mockImplementation(
        (url: string): Promise<HttpResponse<unknown>> => {
          if (url.includes('login')) {
            const loginResponse: HttpResponse<string> = {
              success: true,
              data: `<input name="__RequestVerificationToken" value="test-token" />`,
            };
            return Promise.resolve(loginResponse);
          }
          if (url.includes('token')) {
            const tokenData = {
              token: {
                access_token: 'token',
                token_type: 'Bearer',
                expires_in: 3600,
                expires: new Date(Date.now() + 3_600_000).toISOString(),
                refresh_token: 'refresh',
                scope: 'read',
              },
            };
            const tokenResponse: HttpResponse<typeof tokenData> = {
              success: true,
              data: tokenData,
            };
            return Promise.resolve(tokenResponse);
          }
          if (url.includes('user')) {
            const userData = {
              user: {
                userId: '123',
                userName: 'testuser',
                fullName: 'Test User',
                firstName: 'Test',
                lastName: 'User',
              },
            };
            const userResponse: HttpResponse<typeof userData> = {
              success: true,
              data: userData,
            };
            return Promise.resolve(userResponse);
          }
          const errorResponse: HttpResponse<null> = {
            success: false,
            data: null,
            error: notFoundErrorBuilder.build(),
          };
          return Promise.resolve(errorResponse);
        }
      );

      const postResponse: HttpResponse<null> = {
        success: true,
        data: null,
        cookies: ['Production_tpAuth=cookie; Path=/'],
      };
      vi.mocked(mockHttpClient.post).mockResolvedValue(postResponse);

      // Login
      const credentials = createCredentials('user', 'pass');
      const session = await repository.login(credentials);

      expect(session).toBeDefined();
      expect(mockSessionStorage.set).toHaveBeenCalledWith(session);

      // Logout
      await repository.logout();

      expect(mockSessionStorage.clear).toHaveBeenCalled();
    });
  });
});
