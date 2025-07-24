/**
 * Public API Adapter
 * Handles TrainingPeaks public API-specific logic and endpoints
 */

import type { HttpClient, HttpClientConfig } from '@/adapters/http';
import { createHttpClient } from '@/adapters/http';
import { createLogger } from '@/adapters/logging/logger';
import { getSDKConfig } from '@/config';
import type { AuthToken, Credentials, User } from '@/domain';
import { createUser } from '@/domain/entities/user';
import { createAuthToken } from '@/domain/value-objects/auth-token';

export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface TokenResponse {
  token: {
    access_token: string;
    refresh_token?: string;
  };
}

export interface UserResponse {
  user: {
    userId: string | number;
    username: string;
    name: string;
    preferences?: Record<string, unknown>;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * TrainingPeaks API Client
 */
export class TrainingPeaksApiClient {
  private readonly httpClient: HttpClient;
  private readonly logger: ReturnType<typeof createLogger>;

  constructor(config: ApiConfig) {
    const sdkConfig = getSDKConfig();

    this.logger = createLogger({
      level: sdkConfig.debug.enabled ? 'debug' : 'info',
      enabled: sdkConfig.debug.enabled && sdkConfig.debug.logNetwork,
    });

    const httpConfig: HttpClientConfig = {
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: config.headers,
    };

    this.httpClient = createHttpClient(httpConfig, this.logger);
  }

  /**
   * Authenticate user with credentials
   */
  async authenticateUser(
    credentials: Credentials
  ): Promise<{ token: AuthToken; user: User }> {
    this.logger.info('🔐 API Adapter: Starting user authentication', {
      username: credentials.username,
    });

    const loginData: LoginRequest = {
      username: credentials.username,
      password: credentials.password,
    };

    const response = await this.httpClient.post<TokenResponse>(
      '/users/v3/token',
      loginData
    );

    if (response.status !== 200) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const { token } = response.data;
    const sdkConfig = getSDKConfig();

    // Create AuthToken entity
    const authToken = createAuthToken(
      token.access_token,
      'Bearer',
      new Date(Date.now() + sdkConfig.tokens.defaultExpiration),
      token.refresh_token
    );

    // Get user information
    const userResponse = await this.getUserInfo(authToken);
    const user = createUser(
      String(userResponse.user.userId),
      userResponse.user.username,
      userResponse.user.name,
      userResponse.user.preferences
    );

    this.logger.info('🔐 API Adapter: Authentication completed successfully', {
      userId: user.id,
      tokenType: authToken.tokenType,
      tokenExpiresAt: authToken.expiresAt,
    });

    return { token: authToken, user };
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<AuthToken> {
    this.logger.info('🔄 API Adapter: Starting token refresh');

    const refreshData: RefreshTokenRequest = {
      refreshToken,
    };

    const response = await this.httpClient.post<TokenResponse>(
      '/users/v3/token/refresh',
      refreshData
    );

    if (response.status !== 200) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const { token } = response.data;
    const sdkConfig = getSDKConfig();

    const newToken = createAuthToken(
      token.access_token,
      'Bearer',
      new Date(Date.now() + sdkConfig.tokens.defaultExpiration),
      token.refresh_token
    );

    this.logger.info('🔄 API Adapter: Token refresh completed successfully', {
      tokenType: newToken.tokenType,
      tokenExpiresAt: newToken.expiresAt,
    });

    return newToken;
  }

  /**
   * Get user information
   */
  async getUserInfo(token: AuthToken): Promise<UserResponse> {
    this.logger.debug('👤 API Adapter: Getting user information');

    const headers = {
      Authorization: `${token.tokenType} ${token.accessToken}`,
    };

    const response = await this.httpClient.get<UserResponse>(
      '/users/v3/user',
      headers
    );

    if (response.status !== 200) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    this.logger.debug(
      '👤 API Adapter: User information retrieved successfully'
    );

    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string, token: AuthToken): Promise<UserResponse> {
    this.logger.debug('👤 API Adapter: Getting user by ID', { userId });

    const headers = {
      Authorization: `${token.tokenType} ${token.accessToken}`,
    };

    const response = await this.httpClient.get<UserResponse>(
      `/users/v3/user/${userId}`,
      headers
    );

    if (response.status !== 200) {
      throw new Error(`Failed to get user by ID: ${response.statusText}`);
    }

    this.logger.debug('👤 API Adapter: User retrieved successfully', {
      userId,
    });

    return response.data;
  }
}
