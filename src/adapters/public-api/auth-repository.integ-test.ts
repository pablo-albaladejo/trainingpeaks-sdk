/* eslint-disable @typescript-eslint/unbound-method */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createMockAuthGet,
  createMockAuthPost,
} from '@/__fixtures__/auth-mock-helpers';
import { Logger } from '@/adapters';
import { type HttpClient } from '@/adapters/http';
import { SessionStorage } from '@/application';
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
    } satisfies SessionStorage;

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

      // Setup successful login mocks using shared helper
      vi.mocked(mockHttpClient.get).mockImplementation(createMockAuthGet());

      vi.mocked(mockHttpClient.post).mockImplementation(() =>
        createMockAuthPost()
      );

      // Login
      const credentials = createCredentials('user', 'pass');
      const session = await repository.login(credentials);

      expect(session).toBeDefined();
      expect(session.user).toBeDefined();
      expect(session.user.id).toBe('123');
      expect(session.user.name).toBe('Test User');
      expect(mockSessionStorage.set).toHaveBeenCalledWith(session);

      // Logout
      await repository.logout();

      expect(mockSessionStorage.clear).toHaveBeenCalled();
    });
  });
});
