/**
 * HTTP Authentication Adapter
 * Implements authentication using HTTP API calls
 */

import { createLogger } from '@/adapters/logging/logger';
import type {
  AuthenticateUser,
  AuthenticationConfig,
  CanHandleAuthConfig,
  RefreshAuthToken,
} from '@/application/services/auth-service';
import { getSDKConfig } from '@/config';
import type { AuthToken, Credentials, User } from '@/domain';
import { createUser } from '@/domain/entities/user';
import { createAuthToken } from '@/domain/value-objects/auth-token';
import axios, { type AxiosInstance } from 'axios';

/**
 * Check if this adapter can handle the given configuration
 */
export const canHandleAuthConfig: CanHandleAuthConfig = (
  config: AuthenticationConfig
): boolean => {
  // This adapter handles API-based authentication
  return !config.webAuth;
};

/**
 * Authenticate user using HTTP API
 */
export const authenticateUser: AuthenticateUser = async (
  credentials: Credentials,
  config: AuthenticationConfig
): Promise<{ token: AuthToken; user: User }> => {
  const sdkConfig = getSDKConfig();

  // Create logger for this adapter
  const logger = createLogger({
    level: sdkConfig.debug.enabled ? 'debug' : 'info',
    enabled: sdkConfig.debug.enabled && sdkConfig.debug.logAuth,
  });

  logger.info('🌐 HTTP Auth Adapter: Starting API authentication', {
    username: credentials.username,
    baseUrl: config.baseUrl || sdkConfig.urls.apiBaseUrl,
    timeout: config.timeout || sdkConfig.timeouts.apiAuth,
  });
  const httpClient: AxiosInstance = axios.create({
    baseURL: config.baseUrl || sdkConfig.urls.apiBaseUrl,
    timeout: config.timeout || sdkConfig.timeouts.apiAuth,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.headers,
      ...sdkConfig.requests.defaultHeaders,
    },
  });

  try {
    logger.debug('🌐 HTTP Auth Adapter: Making POST request to /auth/login');

    // Make authentication request
    const response = await httpClient.post('/auth/login', {
      username: credentials.username,
      password: credentials.password,
    });

    logger.info('🌐 HTTP Auth Adapter: Authentication request successful', {
      status: response.status,
      statusText: response.statusText,
    });

    const { accessToken, refreshToken, user: userData } = response.data;

    logger.debug('🌐 HTTP Auth Adapter: Creating AuthToken and User entities');

    // Create AuthToken entity
    const token = createAuthToken(
      accessToken,
      'Bearer',
      new Date(Date.now() + sdkConfig.tokens.defaultExpiration),
      refreshToken
    );

    // Create User entity
    const user = createUser(
      userData.id,
      userData.username,
      userData.name,
      userData.preferences
    );

    logger.info('🌐 HTTP Auth Adapter: Authentication completed successfully', {
      userId: user.id,
      tokenType: token.tokenType,
      tokenExpiresAt: token.expiresAt,
    });

    return { token, user };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      logger.error('🌐 HTTP Auth Adapter: Authentication failed', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: message,
      });
      throw new Error(`API authentication failed: ${message}`);
    }

    logger.error(
      '🌐 HTTP Auth Adapter: Authentication failed with unknown error',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    );
    throw new Error('API authentication failed: Unknown error');
  }
};

/**
 * Refresh authentication token
 */
export const refreshAuthToken: RefreshAuthToken = async (
  refreshToken: string,
  config: AuthenticationConfig
): Promise<AuthToken> => {
  const sdkConfig = getSDKConfig();

  // Create logger for this adapter
  const logger = createLogger({
    level: sdkConfig.debug.enabled ? 'debug' : 'info',
    enabled: sdkConfig.debug.enabled && sdkConfig.debug.logAuth,
  });

  logger.info('🔄 HTTP Auth Adapter: Starting token refresh', {
    baseUrl: config.baseUrl || sdkConfig.urls.apiBaseUrl,
    timeout: config.timeout || sdkConfig.timeouts.apiAuth,
  });
  const httpClient: AxiosInstance = axios.create({
    baseURL: config.baseUrl || sdkConfig.urls.apiBaseUrl,
    timeout: config.timeout || sdkConfig.timeouts.apiAuth,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.headers,
      ...sdkConfig.requests.defaultHeaders,
    },
  });

  try {
    logger.debug('🔄 HTTP Auth Adapter: Making POST request to /auth/refresh');

    const response = await httpClient.post('/auth/refresh', {
      refreshToken,
    });

    logger.info('🔄 HTTP Auth Adapter: Token refresh request successful', {
      status: response.status,
      statusText: response.statusText,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    logger.debug('🔄 HTTP Auth Adapter: Creating new AuthToken');

    const newToken = createAuthToken(
      accessToken,
      'Bearer',
      new Date(Date.now() + sdkConfig.tokens.defaultExpiration),
      newRefreshToken
    );

    logger.info('🔄 HTTP Auth Adapter: Token refresh completed successfully', {
      tokenType: newToken.tokenType,
      tokenExpiresAt: newToken.expiresAt,
    });

    return newToken;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      logger.error('🔄 HTTP Auth Adapter: Token refresh failed', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: message,
      });
      throw new Error(`Token refresh failed: ${message}`);
    }

    logger.error(
      '🔄 HTTP Auth Adapter: Token refresh failed with unknown error',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    );
    throw new Error('Token refresh failed: Unknown error');
  }
};
