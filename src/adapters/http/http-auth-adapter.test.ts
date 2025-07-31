/**
 * HTTP Auth Adapter Tests
 * Tests for configurable URLs and authentication flow
 */

import { describe, expect, it, vi } from 'vitest';
import type { LoggerType } from '../logging/logger';
import { createHttpAuthAdapter } from './http-auth-adapter';
import type { WebHttpClient } from './web-http-client';

describe('HTTP Auth Adapter', () => {
  const mockWebHttpClient: WebHttpClient = {
    get: vi.fn(),
    post: vi.fn(),
    setCookie: vi.fn(),
  };

  const mockLogger: LoggerType = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };

  const defaultConfig = {
    loginUrl: 'https://test.trainingpeaks.com/login',
    tokenUrl: 'https://test.trainingpeaks.com/api/token',
    userInfoUrl: 'https://test.trainingpeaks.com/api/user',
    authCookieName: 'TestAuth',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Configurable URLs', () => {
    it('should use configured login URL', async () => {
      const adapter = createHttpAuthAdapter(
        defaultConfig,
        mockWebHttpClient,
        mockLogger
      );

      // Mock the login page response
      (mockWebHttpClient.get as any).mockResolvedValueOnce({
        data: '<input name="__RequestVerificationToken" value="test-token" />',
      });

      // Mock the login response
      (mockWebHttpClient.post as any).mockResolvedValueOnce({
        status: 200,
        cookies: ['TestAuth=session-token'],
      });

      // Mock the token response
      (mockWebHttpClient.get as any).mockResolvedValueOnce({
        data: {
          token: {
            access_token: 'access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            expires: '2024-12-31T23:59:59Z',
          },
        },
      });

      await adapter.authenticate({
        username: 'testuser',
        password: 'testpass',
      });

      expect(mockWebHttpClient.get).toHaveBeenCalledWith(
        'https://test.trainingpeaks.com/login'
      );
    });

    it('should use configured token URL', async () => {
      const adapter = createHttpAuthAdapter(
        defaultConfig,
        mockWebHttpClient,
        mockLogger
      );

      // Mock the login page response
      (mockWebHttpClient.get as any).mockResolvedValueOnce({
        data: '<input name="__RequestVerificationToken" value="test-token" />',
      });

      // Mock the login response
      (mockWebHttpClient.post as any).mockResolvedValueOnce({
        status: 200,
        cookies: ['TestAuth=session-token'],
      });

      // Mock the token response
      (mockWebHttpClient.get as any).mockResolvedValueOnce({
        data: {
          token: {
            access_token: 'access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            expires: '2024-12-31T23:59:59Z',
          },
        },
      });

      await adapter.authenticate({
        username: 'testuser',
        password: 'testpass',
      });

      expect(mockWebHttpClient.get).toHaveBeenCalledWith(
        'https://test.trainingpeaks.com/api/token'
      );
    });

    it('should use configured user info URL', async () => {
      const adapter = createHttpAuthAdapter(
        defaultConfig,
        mockWebHttpClient,
        mockLogger
      );

      // Mock the user info response
      (mockWebHttpClient.get as any).mockResolvedValue({
        status: 200,
        data: {
          user: {
            userId: '123',
            username: 'testuser',
            name: 'Test User',
          },
        },
      });

      await adapter.getUserInfo({
        accessToken: 'test-token',
        tokenType: 'Bearer',
        expiresAt: new Date('2024-12-31T23:59:59Z'),
      });

      expect(mockWebHttpClient.get).toHaveBeenCalledWith(
        'https://test.trainingpeaks.com/api/user',
        expect.any(Object)
      );
    });

    it('should use different URLs for different environments', async () => {
      const stagingConfig = {
        loginUrl: 'https://staging.trainingpeaks.com/login',
        tokenUrl: 'https://staging-api.trainingpeaks.com/token',
        userInfoUrl: 'https://staging-api.trainingpeaks.com/user',
        authCookieName: 'StagingAuth',
      };

      const adapter = createHttpAuthAdapter(
        stagingConfig,
        mockWebHttpClient,
        mockLogger
      );

      // Mock the login page response
      (mockWebHttpClient.get as any).mockResolvedValueOnce({
        data: '<input name="__RequestVerificationToken" value="test-token" />',
      });

      // Mock the login response
      (mockWebHttpClient.post as any).mockResolvedValueOnce({
        status: 200,
        cookies: ['StagingAuth=session-token'],
      });

      // Mock the token response
      (mockWebHttpClient.get as any).mockResolvedValueOnce({
        data: {
          token: {
            access_token: 'access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            expires: '2024-12-31T23:59:59Z',
          },
        },
      });

      await adapter.authenticate({
        username: 'testuser',
        password: 'testpass',
      });

      expect(mockWebHttpClient.get).toHaveBeenCalledWith(
        'https://staging.trainingpeaks.com/login'
      );
      expect(mockWebHttpClient.get).toHaveBeenCalledWith(
        'https://staging-api.trainingpeaks.com/token'
      );
    });
  });

  describe('Default cookie name', () => {
    it('should use default cookie name when not provided', async () => {
      const configWithoutCookieName = {
        loginUrl: 'https://test.trainingpeaks.com/login',
        tokenUrl: 'https://test.trainingpeaks.com/api/token',
        userInfoUrl: 'https://test.trainingpeaks.com/api/user',
      };

      const adapter = createHttpAuthAdapter(
        configWithoutCookieName,
        mockWebHttpClient,
        mockLogger
      );

      // Mock the login page response
      (mockWebHttpClient.get as any).mockResolvedValueOnce({
        data: '<input name="__RequestVerificationToken" value="test-token" />',
      });

      // Mock the login response with default cookie name
      (mockWebHttpClient.post as any).mockResolvedValueOnce({
        status: 200,
        cookies: ['Production_tpAuth=session-token'],
      });

      // Mock the token response
      (mockWebHttpClient.get as any).mockResolvedValueOnce({
        data: {
          token: {
            access_token: 'access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            expires: '2024-12-31T23:59:59Z',
          },
        },
      });

      await adapter.authenticate({
        username: 'testuser',
        password: 'testpass',
      });

      // Should work with default cookie name
      expect(mockWebHttpClient.get).toHaveBeenCalledWith(
        'https://test.trainingpeaks.com/api/token'
      );
    });
  });
});
