/**
 * Users API Client
 * Handles all user-related API endpoints
 */

import type { UserRepository } from '@/application/repositories';
import type { AuthToken, Credentials, User } from '@/domain';
import { BaseApiClient, type EntityApiConfig } from '../base-api-client';
import { API_ENDPOINTS, HTTP_STATUS } from '@/adapters/constants';

// API Response types (raw data from API)
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface UserResponse {
  user: {
    userId: number;
    username: string;
    name: string;
    preferences: Record<string, unknown>;
  };
}

/**
 * Users API Client - implements UserRepository interface
 * Handles only HTTP operations, no business logic
 */
export class UsersApiClient extends BaseApiClient implements UserRepository {
  constructor(config: Omit<EntityApiConfig, 'entity'>) {
    super({
      ...config,
      entity: API_ENDPOINTS.ENTITIES.USERS,
      version: config.version || 'v3',
    });
  }

  /**
   * Authenticate user with credentials
   * Returns raw API response data
   */
  async authenticate(
    credentials: Credentials
  ): Promise<{ token: AuthToken; user: User }> {
    this.logger.debug('👤 Users API: Authenticating user', {
      username: credentials.username,
    });

    const endpoint = this.buildEndpoint(API_ENDPOINTS.USERS.TOKEN);
    const loginData = {
      username: credentials.username,
      password: credentials.password,
    };

    this.logRequest('POST', endpoint);

    try {
      const response = await this.httpClient.post<TokenResponse>(
        endpoint,
        loginData
      );
      this.logResponse('POST', endpoint, response.status);

      if (response.status !== HTTP_STATUS.OK) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      // Return raw data - business logic handled in application layer
      return {
        token: response.data as unknown as AuthToken,
        user: response.data as unknown as User,
      };
    } catch (error) {
      this.logError('POST', endpoint, error as Error);
      throw error;
    }
  }

  /**
   * Refresh authentication token
   * Returns raw API response data
   */
  async refreshToken(refreshToken: string): Promise<AuthToken> {
    this.logger.debug('👤 Users API: Refreshing token');

    const endpoint = this.buildEndpoint(API_ENDPOINTS.USERS.TOKEN_REFRESH);
    const refreshData = { refresh_token: refreshToken };

    this.logRequest('POST', endpoint);

    try {
      const response = await this.httpClient.post<TokenResponse>(
        endpoint,
        refreshData
      );
      this.logResponse('POST', endpoint, response.status);

      if (response.status !== HTTP_STATUS.OK) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      // Return raw data - business logic handled in application layer
      return response.data as unknown as AuthToken;
    } catch (error) {
      this.logError('POST', endpoint, error as Error);
      throw error;
    }
  }

  /**
   * Get user information using authentication token
   * Returns raw API response data
   */
  async getUserInfo(token: AuthToken): Promise<User> {
    this.logger.debug('👤 Users API: Getting user information');

    const endpoint = this.buildEndpoint(API_ENDPOINTS.USERS.USER);
    const headers = this.getAuthHeaders(token);

    this.logRequest('GET', endpoint);

    try {
      const response = await this.httpClient.get<UserResponse>(
        endpoint,
        headers
      );
      this.logResponse('GET', endpoint, response.status);

      if (response.status !== HTTP_STATUS.OK) {
        throw new Error(`Failed to get user info: ${response.statusText}`);
      }

      this.logger.debug(
        '👤 Users API: User information retrieved successfully'
      );

      // Return raw data - business logic handled in application layer
      return response.data as unknown as User;
    } catch (error) {
      this.logError('GET', endpoint, error as Error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * Returns raw API response data
   */
  async getUserById(userId: string, token: AuthToken): Promise<UserResponse> {
    this.logger.debug('👤 Users API: Getting user by ID', { userId });

    const endpoint = this.buildEndpointWithId(API_ENDPOINTS.USERS.USER, userId);
    const headers = this.getAuthHeaders(token);

    this.logRequest('GET', endpoint);

    try {
      const response = await this.httpClient.get<UserResponse>(
        endpoint,
        headers
      );
      this.logResponse('GET', endpoint, response.status);

      if (response.status !== 200) {
        throw new Error(`Failed to get user by ID: ${response.statusText}`);
      }

      this.logger.debug('👤 Users API: User retrieved successfully', {
        userId,
      });
      return response.data;
    } catch (error) {
      this.logError('GET', endpoint, error as Error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    token: AuthToken,
    preferences: Record<string, unknown>
  ): Promise<void> {
    this.logger.debug('👤 Users API: Updating user preferences');

    const endpoint = this.buildEndpoint(API_ENDPOINTS.USERS.PREFERENCES);
    const headers = this.getAuthHeaders(token);

    this.logRequest('PUT', endpoint);

    try {
      const response = await this.httpClient.put(
        endpoint,
        preferences,
        headers
      );
      this.logResponse('PUT', endpoint, response.status);

      if (response.status !== 200) {
        throw new Error(
          `Failed to update user preferences: ${response.statusText}`
        );
      }

      this.logger.debug('👤 Users API: User preferences updated successfully');
    } catch (error) {
      this.logError('PUT', endpoint, error as Error);
      throw error;
    }
  }

  /**
   * Get user settings
   * Returns raw API response data
   */
  async getUserSettings(token: AuthToken): Promise<Record<string, unknown>> {
    this.logger.debug('👤 Users API: Getting user settings');

    const endpoint = this.buildEndpoint(API_ENDPOINTS.USERS.SETTINGS);
    const headers = this.getAuthHeaders(token);

    this.logRequest('GET', endpoint);

    try {
      const response = await this.httpClient.get<Record<string, unknown>>(
        endpoint,
        headers
      );
      this.logResponse('GET', endpoint, response.status);

      if (response.status !== 200) {
        throw new Error(`Failed to get user settings: ${response.statusText}`);
      }

      this.logger.debug('👤 Users API: User settings retrieved successfully');
      return response.data;
    } catch (error) {
      this.logError('GET', endpoint, error as Error);
      throw error;
    }
  }
}
