/**
 * API Authentication Adapter
 * Implements authentication using direct API calls (fallback method)
 */

import axios, { AxiosInstance } from 'axios';
import {
  AuthenticationConfig,
  AuthenticationPort,
} from '../../application/ports/AuthenticationPort.js';
import { AuthToken } from '../../domain/entities/AuthToken.js';
import { User } from '../../domain/entities/User.js';
import { Credentials } from '../../domain/value-objects/Credentials.js';

export class ApiAuthAdapter implements AuthenticationPort {
  private httpClient: AxiosInstance;

  private static readonly DEFAULT_CONFIG: Required<AuthenticationConfig> = {
    baseUrl: 'https://api.trainingpeaks.com',
    timeout: 30000,
    debug: false,
    headers: {},
    webAuth: {
      headless: true,
      timeout: 30000,
      executablePath: '',
    },
  };

  constructor() {
    this.httpClient = axios.create();
  }

  public canHandle(config: AuthenticationConfig): boolean {
    // This adapter handles API-based authentication (fallback when webAuth is not available)
    return !config.webAuth;
  }

  public async authenticate(
    credentials: Credentials,
    config: AuthenticationConfig
  ): Promise<{ token: AuthToken; user: User }> {
    const fullConfig = this.mergeConfig(config);

    try {
      // Configure HTTP client
      this.configureHttpClient(fullConfig);

      // Attempt authentication via API
      const authResponse = await this.performApiAuthentication(
        credentials,
        fullConfig
      );

      // Get user information
      const user = await this.getUserInfo(authResponse.token, fullConfig);

      return {
        token: authResponse.token,
        user,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`API authentication failed: ${message}`);
    }
  }

  public async refreshToken(
    refreshToken: string,
    config: AuthenticationConfig
  ): Promise<AuthToken> {
    const fullConfig = this.mergeConfig(config);
    this.configureHttpClient(fullConfig);

    try {
      const response = await this.httpClient.post('/api/auth/refresh', {
        refresh_token: refreshToken,
      });

      return AuthToken.create(
        response.data.access_token,
        'Bearer',
        new Date(Date.now() + response.data.expires_in * 1000),
        response.data.refresh_token
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Token refresh failed: ${message}`);
    }
  }

  private mergeConfig(
    config: AuthenticationConfig
  ): Required<AuthenticationConfig> {
    return {
      ...ApiAuthAdapter.DEFAULT_CONFIG,
      ...config,
      webAuth: {
        ...ApiAuthAdapter.DEFAULT_CONFIG.webAuth,
        ...config.webAuth,
      },
    };
  }

  private configureHttpClient(config: Required<AuthenticationConfig>): void {
    this.httpClient.defaults.baseURL = config.baseUrl;
    this.httpClient.defaults.timeout = config.timeout;
    this.httpClient.defaults.headers.common = {
      'Content-Type': 'application/json',
      'User-Agent': 'TrainingPeaks-SDK/1.0.0',
      ...config.headers,
    };
  }

  private async performApiAuthentication(
    credentials: Credentials,
    config: Required<AuthenticationConfig>
  ): Promise<{ token: AuthToken }> {
    if (config.debug) {
      console.log('Attempting API authentication...');
    }

    // Note: This is a placeholder implementation
    // The actual TrainingPeaks API endpoints for direct authentication would need to be implemented
    const response = await this.httpClient.post('/api/auth/login', {
      username: credentials.username,
      password: credentials.password,
    });

    if (config.debug) {
      console.log('API authentication successful');
    }

    const token = AuthToken.create(
      response.data.access_token,
      'Bearer',
      new Date(Date.now() + response.data.expires_in * 1000),
      response.data.refresh_token
    );

    return { token };
  }

  private async getUserInfo(
    token: AuthToken,
    config: Required<AuthenticationConfig>
  ): Promise<User> {
    if (config.debug) {
      console.log('Fetching user information...');
    }

    const response = await this.httpClient.get('/api/user/profile', {
      headers: {
        Authorization: token.getAuthorizationHeader(),
      },
    });

    return User.create(
      response.data.id.toString(),
      response.data.email,
      response.data.name,
      response.data.avatar,
      response.data.preferences
    );
  }
}
