/**
 * HTTP Authentication Adapter
 * Implements authentication using HTTP API calls
 */

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
    // Make authentication request
    const response = await httpClient.post('/auth/login', {
      username: credentials.username,
      password: credentials.password,
    });

    const { accessToken, refreshToken, user: userData } = response.data;

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

    return { token, user };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`API authentication failed: ${message}`);
    }
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
    const response = await httpClient.post('/auth/refresh', {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    return createAuthToken(
      accessToken,
      'Bearer',
      new Date(Date.now() + sdkConfig.tokens.defaultExpiration),
      newRefreshToken
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`Token refresh failed: ${message}`);
    }
    throw new Error('Token refresh failed: Unknown error');
  }
};
