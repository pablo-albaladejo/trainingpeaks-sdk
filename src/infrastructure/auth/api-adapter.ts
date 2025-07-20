/**
 * API Authentication Adapter
 * Implements TrainingPeaks API authentication using OAuth2 flow
 */

import {
  AuthenticationConfig,
  AuthenticationPort,
} from '@/application/ports/authentication';
import { getSDKConfig } from '@/config';
import { AuthToken } from '@/domain/entities/auth-token';
import { User } from '@/domain/entities/user';
import { AuthenticationError, NetworkError } from '@/domain/errors';
import { Credentials } from '@/domain/value-objects/credentials';
import axios, { AxiosInstance } from 'axios';

export class ApiAuthAdapter implements AuthenticationPort {
  private readonly sdkConfig = getSDKConfig();
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: this.sdkConfig.urls.apiBaseUrl,
      timeout: this.sdkConfig.timeouts.apiAuth,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...this.sdkConfig.requests.defaultHeaders,
      },
    });
  }

  public canHandle(config: AuthenticationConfig): boolean {
    // This adapter handles API-based authentication
    return !config.webAuth || config.webAuth === undefined;
  }

  public async authenticate(
    credentials: Credentials,
    config: Required<AuthenticationConfig>
  ): Promise<{ token: AuthToken; user: User }> {
    try {
      // Step 1: Authenticate and get token
      const tokenResponse = await this.httpClient.post('/oauth/token', {
        grant_type: 'password',
        username: credentials.username,
        password: credentials.password,
        client_id: process.env.TRAININGPEAKS_CLIENT_ID,
        client_secret: process.env.TRAININGPEAKS_CLIENT_SECRET,
      });

      if (!tokenResponse.data.access_token) {
        throw new AuthenticationError('No access token received from API');
      }

      // Create AuthToken entity
      const authToken = AuthToken.create(
        tokenResponse.data.access_token,
        tokenResponse.data.token_type || 'Bearer',
        new Date(Date.now() + tokenResponse.data.expires_in * 1000),
        tokenResponse.data.refresh_token
      );

      // Step 2: Get user information
      const userResponse = await this.httpClient.get('/users/v3/user', {
        headers: {
          Authorization: `Bearer ${authToken.accessToken}`,
        },
      });

      if (!userResponse.data.user) {
        throw new AuthenticationError('No user information received from API');
      }

      // Create User entity
      const user = User.create(
        String(userResponse.data.user.userId),
        userResponse.data.user.username || credentials.username,
        userResponse.data.user.firstName || credentials.username,
        userResponse.data.user.preferences || undefined
      );

      return {
        token: authToken,
        user,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new AuthenticationError(`API authentication failed: ${message}`);
      }
      throw new NetworkError(
        `API authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async refreshToken(
    refreshToken: string,
    config: AuthenticationConfig
  ): Promise<AuthToken> {
    try {
      const response = await this.httpClient.post('/oauth/token', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.TRAININGPEAKS_CLIENT_ID,
        client_secret: process.env.TRAININGPEAKS_CLIENT_SECRET,
      });

      if (!response.data.access_token) {
        throw new AuthenticationError('No access token received from refresh');
      }

      return AuthToken.create(
        response.data.access_token,
        response.data.token_type || 'Bearer',
        new Date(Date.now() + response.data.expires_in * 1000),
        response.data.refresh_token || refreshToken
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new AuthenticationError(`Token refresh failed: ${message}`);
      }
      throw new NetworkError(
        `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
