/* eslint-disable @typescript-eslint/unbound-method */

import {
  loginFailedErrorBuilder,
  networkErrorBuilder,
  notFoundErrorBuilder,
  tokenRequestFailedErrorBuilder,
} from '@fixtures/http-errors.fixture';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Logger } from '@/adapters';
import { HttpError } from '@/adapters/errors/http-errors';
import { type HttpClient, type HttpResponse } from '@/adapters/http';
import { SessionStorage } from '@/application';
import { createCredentials } from '@/domain';

import { createAuthRepository } from './auth-repository';

describe('AuthRepository', () => {
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
      patch: vi.fn(),
      delete: vi.fn(),
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

  describe('createAuthRepository', () => {
    it('should create repository with login and logout methods', () => {
      const repository = createAuthRepository(dependencies);

      expect(repository).toHaveProperty('login');
      expect(repository).toHaveProperty('logout');
      expect(typeof repository.login).toBe('function');
      expect(typeof repository.logout).toBe('function');
    });

    it('should create different instances for different dependencies', () => {
      const otherDependencies = {
        httpClient: { ...mockHttpClient },
        sessionStorage: { ...mockSessionStorage },
        logger: { ...mockLogger },
      };

      const repository1 = createAuthRepository(dependencies);
      const repository2 = createAuthRepository(otherDependencies);

      expect(repository1).not.toBe(repository2);
      expect(repository1.login).not.toBe(repository2.login);
      expect(repository1.logout).not.toBe(repository2.logout);
    });
  });

  describe('login', () => {
    const validCredentials = createCredentials('testuser', 'password123');

    const mockLoginPageResponse = `
      <html>
        <form>
          <input name="__RequestVerificationToken" value="test-token-123" />
        </form>
      </html>
    `;

    const mockTokenResponse = {
      token: {
        access_token: 'access-token-123',
        token_type: 'Bearer',
        expires_in: 3600,
        expires: new Date(Date.now() + 3600000).toISOString(),
        refresh_token: 'refresh-token-123',
        scope: 'read write',
      },
    };

    const mockUserResponse = {
      user: {
        userId: '123',
        userName: 'testuser',
        fullName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        personPhotoUrl: 'https://example.com/photo.jpg',
        preferences: { theme: 'light' },
      },
    };

    beforeEach(() => {
      // Mock successful login flow by default
      const mockedGet = vi.mocked(mockHttpClient.get);
      mockedGet.mockImplementation((url) => {
        if (url.includes('login')) {
          return Promise.resolve({
            success: true,
            data: mockLoginPageResponse,
          } as HttpResponse<string>);
        }
        if (url.includes('token')) {
          return Promise.resolve({
            success: true,
            data: mockTokenResponse,
          } as HttpResponse<typeof mockTokenResponse>);
        }
        if (url.includes('user')) {
          return Promise.resolve({
            success: true,
            data: mockUserResponse,
          } as HttpResponse<typeof mockUserResponse>);
        }
        return Promise.resolve({
          success: false,
          error: notFoundErrorBuilder.build(),
        } as HttpResponse<unknown>);
      });

      const mockedPost = vi.mocked(mockHttpClient.post);
      mockedPost.mockResolvedValue({
        success: true,
        cookies: ['Production_tpAuth=test-cookie-value; Path=/'],
      } as HttpResponse<unknown>);
    });

    it('should successfully login with valid credentials', async () => {
      const repository = createAuthRepository(dependencies);

      const session = await repository.login(validCredentials);

      expect(session).toBeDefined();
      expect(session.user).toBeDefined();
      expect(session.token).toBeDefined();
      expect(session.user.id).toBe('123');
      expect(session.user.name).toBe('Test User');
      expect(session.token.accessToken).toBe('access-token-123');
    });

    it('should store session after successful login', async () => {
      const repository = createAuthRepository(dependencies);

      await repository.login(validCredentials);

      expect(mockSessionStorage.set).toHaveBeenCalledOnce();
      const setCall = vi.mocked(mockSessionStorage.set).mock.calls[0][0];
      expect(setCall.user.id).toBe('123');
      expect(setCall.token.accessToken).toBe('access-token-123');
    });

    it('should throw validation error for invalid credentials', () => {
      // Empty credentials should throw ValidationError from createCredentials
      expect(() => createCredentials('', '')).toThrow(
        'Username cannot be empty'
      );
    });

    it('should throw error when login page request fails', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue({
        success: false,
        error: networkErrorBuilder.build({
          url: 'https://example.com/login',
          method: 'GET',
        }),
      } as HttpResponse<unknown>);

      const repository = createAuthRepository(dependencies);

      await expect(repository.login(validCredentials)).rejects.toThrow(
        HttpError
      );
    });

    it('should throw error when request verification token is missing', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue({
        success: true,
        data: '<html><form></form></html>', // No token
      } as HttpResponse<string>);

      const repository = createAuthRepository(dependencies);

      await expect(repository.login(validCredentials)).rejects.toThrow(
        HttpError
      );
    });

    it('should throw error when login submission fails', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue({
        success: false,
        error: loginFailedErrorBuilder.build(),
      } as HttpResponse<unknown>);

      const repository = createAuthRepository(dependencies);

      await expect(repository.login(validCredentials)).rejects.toThrow(
        HttpError
      );
    });

    it('should throw error when auth cookie is missing', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue({
        success: true,
        cookies: [], // No auth cookie
      } as HttpResponse<unknown>);

      const repository = createAuthRepository(dependencies);

      await expect(repository.login(validCredentials)).rejects.toThrow(
        HttpError
      );
    });

    it('should throw error when token request fails', async () => {
      vi.mocked(mockHttpClient.get).mockImplementation((url) => {
        if (url.includes('login')) {
          return Promise.resolve({
            success: true,
            data: mockLoginPageResponse,
          } as HttpResponse<string>);
        }
        if (url.includes('token')) {
          return Promise.resolve({
            success: false,
            error: tokenRequestFailedErrorBuilder.build(),
          } as HttpResponse<unknown>);
        }
        return Promise.resolve({
          success: false,
          error: notFoundErrorBuilder.build(),
        } as HttpResponse<unknown>);
      });

      const repository = createAuthRepository(dependencies);

      await expect(repository.login(validCredentials)).rejects.toThrow(
        HttpError
      );
    });

    it('should throw error when user request fails', async () => {
      vi.mocked(mockHttpClient.get).mockImplementation((url) => {
        if (url.includes('login')) {
          return Promise.resolve({
            success: true,
            data: mockLoginPageResponse,
          } as HttpResponse<string>);
        }
        if (url.includes('token')) {
          return Promise.resolve({
            success: true,
            data: mockTokenResponse,
          } as HttpResponse<typeof mockTokenResponse>);
        }
        if (url.includes('user')) {
          return Promise.resolve({
            success: false,
            error: new Error('User request failed'),
          });
        }
        return Promise.resolve({
          success: false,
          error: notFoundErrorBuilder.build(),
        } as HttpResponse<unknown>);
      });

      const repository = createAuthRepository(dependencies);

      await expect(repository.login(validCredentials)).rejects.toThrow(
        HttpError
      );
    });

    it('should throw error when token is expired', async () => {
      const expiredTokenResponse = {
        ...mockTokenResponse,
        token: {
          ...mockTokenResponse.token,
          expires: new Date(Date.now() - 1000).toISOString(), // Expired
        },
      };

      vi.mocked(mockHttpClient.get).mockImplementation((url) => {
        if (url.includes('login')) {
          return Promise.resolve({
            success: true,
            data: mockLoginPageResponse,
          } as HttpResponse<string>);
        }
        if (url.includes('token')) {
          return Promise.resolve({
            success: true,
            data: expiredTokenResponse,
          } as HttpResponse<typeof expiredTokenResponse>);
        }
        return Promise.resolve({
          success: false,
          error: notFoundErrorBuilder.build(),
        } as HttpResponse<unknown>);
      });

      const repository = createAuthRepository(dependencies);

      await expect(repository.login(validCredentials)).rejects.toThrow(
        HttpError
      );
    });

    it('should handle missing response data gracefully', async () => {
      vi.mocked(mockHttpClient.get).mockImplementation((url) => {
        if (url.includes('login')) {
          return Promise.resolve({
            success: true,
            data: undefined, // Missing data
          } as HttpResponse<string>);
        }
        return Promise.resolve({
          success: false,
          error: notFoundErrorBuilder.build(),
        } as HttpResponse<unknown>);
      });

      const repository = createAuthRepository(dependencies);

      await expect(repository.login(validCredentials)).rejects.toThrow(
        HttpError
      );
    });
  });

  describe('logout', () => {
    it('should clear session storage', async () => {
      const repository = createAuthRepository(dependencies);

      await repository.logout();

      expect(mockSessionStorage.clear).toHaveBeenCalledOnce();
    });

    it('should handle session storage errors gracefully', async () => {
      vi.mocked(mockSessionStorage.clear).mockRejectedValue(
        new Error('Storage error')
      );

      const repository = createAuthRepository(dependencies);

      // Should not throw, logout should always succeed
      await expect(repository.logout()).resolves.toBeUndefined();
    });

    it('should be idempotent', async () => {
      const repository = createAuthRepository(dependencies);

      await repository.logout();
      await repository.logout();
      await repository.logout();

      expect(mockSessionStorage.clear).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete login/logout cycle', async () => {
      const repository = createAuthRepository(dependencies);

      // Setup successful login mocks
      vi.mocked(mockHttpClient.get).mockImplementation((url) => {
        if (url.includes('login')) {
          return Promise.resolve({
            success: true,
            data: `<input name="__RequestVerificationToken" value="test-token" />`,
          } as HttpResponse<string>);
        }
        if (url.includes('token')) {
          return Promise.resolve({
            success: true,
            data: {
              token: {
                access_token: 'token',
                token_type: 'Bearer',
                expires_in: 3600,
                expires: new Date(Date.now() + 3600000).toISOString(),
                refresh_token: 'refresh',
                scope: 'read',
              },
            },
          } as HttpResponse<unknown>);
        }
        if (url.includes('user')) {
          return Promise.resolve({
            success: true,
            data: {
              user: {
                userId: '123',
                userName: 'testuser',
                fullName: 'Test User',
                firstName: 'Test',
                lastName: 'User',
              },
            },
          } as HttpResponse<unknown>);
        }
        return Promise.resolve({
          success: false,
          error: notFoundErrorBuilder.build(),
        } as HttpResponse<unknown>);
      });

      vi.mocked(mockHttpClient.post).mockResolvedValue({
        success: true,
        cookies: ['Production_tpAuth=cookie; Path=/'],
      } as HttpResponse<unknown>);

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
