/**
 * HTTP Auth Adapter Tests
 * Tests for configurable URLs and authentication flow
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  authTokenBuilder,
  credentialsBuilder,
  loginPageResponseBuilder,
  loginResponseBuilder,
  tokenResponseBuilder,
  tokenResponseWithoutExpirationBuilder,
  tokenResponseWithZeroExpirationBuilder,
  userBuilder,
  userInfoResponseBuilder,
} from '../../__fixtures__/auth.fixture';
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
      (
        mockWebHttpClient.get as jest.MockedFunction<
          typeof mockWebHttpClient.get
        >
      ).mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: '<input name="__RequestVerificationToken" value="test-token" />',
        headers: {},
        cookies: [],
      });

      // Mock the login response
      (mockWebHttpClient.post as any).mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: '',
        headers: {},
        cookies: ['TestAuth=session-token'],
      });

      // Mock the token response
      (mockWebHttpClient.get as any).mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: {
          token: {
            access_token: 'access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            expires: '2024-12-31T23:59:59Z',
          },
        },
        headers: {},
        cookies: [],
      });

      const user = userBuilder.build();

      const userInfoResponse = userInfoResponseBuilder.build({
        userId: user.id,
        username: user.username,
        name: user.name,
      });

      (mockWebHttpClient.get as any).mockResolvedValueOnce(userInfoResponse);

      const credentials = credentialsBuilder.build({
        username: user.username,
        password: user.password,
      });

      await adapter.authenticate(credentials);

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

      const credentials = credentialsBuilder.build();
      const loginPageResponse = loginPageResponseBuilder.build();
      const loginResponse = loginResponseBuilder.build();
      const tokenResponse = tokenResponseBuilder.build();
      const userInfoResponse = userInfoResponseBuilder.build();

      // Mock the login page response
      (mockWebHttpClient.get as any).mockResolvedValueOnce(loginPageResponse);

      // Mock the login response
      (mockWebHttpClient.post as any).mockResolvedValueOnce(loginResponse);

      // Mock the token response
      (mockWebHttpClient.get as any).mockResolvedValueOnce(tokenResponse);

      // Mock the user info response (needed since authenticate now calls getUserInfo)
      (mockWebHttpClient.get as any).mockResolvedValueOnce(userInfoResponse);

      await adapter.authenticate(credentials);

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

      const authToken = authTokenBuilder.build();
      const userInfoResponse = userInfoResponseBuilder.build();

      // Mock the user info response
      (mockWebHttpClient.get as any).mockResolvedValue(userInfoResponse);

      await adapter.getUserInfo(authToken);

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

      const credentials = credentialsBuilder.build();
      const loginPageResponse = loginPageResponseBuilder.build();
      const loginResponse = {
        status: 200,
        statusText: 'OK',
        data: '',
        headers: {},
        cookies: ['StagingAuth=staging-session-token'],
      };
      const tokenResponse = tokenResponseBuilder.build();
      const userInfoResponse = userInfoResponseBuilder.build();

      // Mock the login page response
      (mockWebHttpClient.get as any).mockResolvedValueOnce(loginPageResponse);

      // Mock the login response
      (mockWebHttpClient.post as any).mockResolvedValueOnce(loginResponse);

      // Mock the token response
      (mockWebHttpClient.get as any).mockResolvedValueOnce(tokenResponse);

      // Mock the user info response (needed since authenticate now calls getUserInfo)
      (mockWebHttpClient.get as any).mockResolvedValueOnce(userInfoResponse);

      await adapter.authenticate(credentials);

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

      const credentials = credentialsBuilder.build();
      const loginPageResponse = loginPageResponseBuilder.build();
      const loginResponse = {
        status: 200,
        statusText: 'OK',
        data: '',
        headers: {},
        cookies: ['Production_tpAuth=production-session-token'],
      };
      const tokenResponse = tokenResponseBuilder.build();
      const userInfoResponse = userInfoResponseBuilder.build();

      // Mock the login page response
      (mockWebHttpClient.get as any).mockResolvedValueOnce(loginPageResponse);

      // Mock the login response with default cookie name
      (mockWebHttpClient.post as any).mockResolvedValueOnce(loginResponse);

      // Mock the token response
      (mockWebHttpClient.get as any).mockResolvedValueOnce(tokenResponse);

      // Mock the user info response (needed since authenticate now calls getUserInfo)
      (mockWebHttpClient.get as any).mockResolvedValueOnce(userInfoResponse);

      await adapter.authenticate(credentials);

      // Should work with default cookie name
      expect(mockWebHttpClient.get).toHaveBeenCalledWith(
        'https://test.trainingpeaks.com/api/token'
      );
    });
  });

  describe('Token expiration validation', () => {
    it('should accept expires_in value of 0 (never expires)', async () => {
      const adapter = createHttpAuthAdapter(
        defaultConfig,
        mockWebHttpClient,
        mockLogger
      );

      const credentials = credentialsBuilder.build();
      const loginPageResponse = loginPageResponseBuilder.build();
      const loginResponse = loginResponseBuilder.build({
        cookieName: 'TestAuth',
      });

      // Use fixture with expires_in: 0 (never expires)
      const tokenResponse = tokenResponseBuilder.build({
        expiresIn: 0,
      });

      const userInfoResponse = userInfoResponseBuilder.build();

      // Mock the login page response
      (mockWebHttpClient.get as any).mockResolvedValueOnce(loginPageResponse);

      // Mock the login response
      (mockWebHttpClient.post as any).mockResolvedValueOnce(loginResponse);

      // Mock the token response
      (mockWebHttpClient.get as any).mockResolvedValueOnce(tokenResponse);

      // Mock the user info response
      (mockWebHttpClient.get as any).mockResolvedValueOnce(userInfoResponse);

      // This should not throw an error
      const result = await adapter.authenticate(credentials);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
    });

    it('should throw error when both expires_in and expires are missing', async () => {
      const adapter = createHttpAuthAdapter(
        defaultConfig,
        mockWebHttpClient,
        mockLogger
      );

      const credentials = credentialsBuilder.build();
      const loginPageResponse = loginPageResponseBuilder.build();
      const loginResponse = loginResponseBuilder.build({
        cookieName: 'TestAuth',
      });

      // Token response with missing expiration info
      const tokenResponse = tokenResponseWithoutExpirationBuilder.build();

      // Mock the login page response
      (mockWebHttpClient.get as any).mockResolvedValueOnce(loginPageResponse);

      // Mock the login response
      (mockWebHttpClient.post as any).mockResolvedValueOnce(loginResponse);

      // Mock the token response
      (mockWebHttpClient.get as any).mockResolvedValueOnce(tokenResponse);

      // This should throw an error
      await expect(adapter.authenticate(credentials)).rejects.toThrow(
        'No expiration information received'
      );
    });

    it('should set far future expiration when expires_in is 0', async () => {
      const adapter = createHttpAuthAdapter(
        defaultConfig,
        mockWebHttpClient,
        mockLogger
      );

      const credentials = credentialsBuilder.build();
      const loginPageResponse = loginPageResponseBuilder.build();
      const loginResponse = loginResponseBuilder.build({
        cookieName: 'TestAuth',
      });

      // Use fixture with expires_in: 0 (never expires) and no expires field
      const tokenResponse = tokenResponseWithZeroExpirationBuilder.build();

      const userInfoResponse = userInfoResponseBuilder.build();

      // Mock the login page response
      (mockWebHttpClient.get as any).mockResolvedValueOnce(loginPageResponse);

      // Mock the login response
      (mockWebHttpClient.post as any).mockResolvedValueOnce(loginResponse);

      // Mock the token response
      (mockWebHttpClient.get as any).mockResolvedValueOnce(tokenResponse);

      // Mock the user info response
      (mockWebHttpClient.get as any).mockResolvedValueOnce(userInfoResponse);

      const result = await adapter.authenticate(credentials);

      // The token should have a far future expiration date
      expect(result.token.expiresAt.getFullYear()).toBeGreaterThan(2090);
      expect(result.token.expiresAt.getTime()).toBeGreaterThan(
        new Date('2099-01-01').getTime()
      );
    });
  });
});
