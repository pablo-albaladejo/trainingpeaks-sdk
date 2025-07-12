/**
 * TrainingPeaks Authentication Module
 */

import axios, { AxiosInstance } from 'axios';
import { AuthenticationError, NetworkError } from '../errors';
import {
  AuthToken,
  LoginCredentials,
  TrainingPeaksConfig,
  UserProfile,
} from '../types';
import { WebAuthService } from './web-auth';

export class TrainingPeaksAuth {
  private httpClient: AxiosInstance;
  private authToken: AuthToken | null = null;
  private config: TrainingPeaksConfig;
  private webAuthService: WebAuthService | null = null;

  constructor(config: TrainingPeaksConfig = {}) {
    this.config = {
      baseUrl:
        process.env.TRAININGPEAKS_BASE_URL || 'https://www.trainingpeaks.com',
      timeout: 10000,
      debug: false,
      authMethod: 'web', // Default to web authentication
      ...config,
    };

    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TrainingPeaks-SDK/1.0.0',
        ...this.config.headers,
      },
    });

    // Initialize web auth service if using web authentication
    if (this.config.authMethod === 'web') {
      this.webAuthService = new WebAuthService({
        headless: this.config.webAuth?.headless ?? true,
        timeout: this.config.webAuth?.timeout ?? 30000,
        debug: this.config.debug ?? false,
        executablePath: this.config.webAuth?.executablePath ?? '',
        loginUrl: process.env.TRAININGPEAKS_LOGIN_URL,
        appUrl: process.env.TRAININGPEAKS_APP_URL,
      });
    }
  }

  /**
   * Authenticate with TrainingPeaks using the configured method
   * @param credentials - Login credentials
   * @returns Authentication token
   */
  public async login(credentials: LoginCredentials): Promise<AuthToken> {
    try {
      if (this.config.authMethod === 'web' && this.webAuthService) {
        return await this.loginWithWeb(credentials);
      } else {
        return await this.loginWithAPI(credentials);
      }
    } catch (error: unknown) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new AuthenticationError('Invalid credentials');
        }
        throw new NetworkError(`Authentication failed: ${error.message}`);
      }

      throw error;
    }
  }

  /**
   * Authenticate using web browser simulation
   */
  private async loginWithWeb(
    credentials: LoginCredentials
  ): Promise<AuthToken> {
    if (!this.webAuthService) {
      throw new AuthenticationError(
        'Web authentication service not initialized'
      );
    }

    const token = await this.webAuthService.login(credentials);
    this.authToken = token;
    return token;
  }

  /**
   * Authenticate using direct API calls (legacy/fallback method)
   */
  private async loginWithAPI(
    credentials: LoginCredentials
  ): Promise<AuthToken> {
    // Note: This is the original implementation for fallback/testing
    const response = await this.httpClient.post('/api/auth/login', {
      username: credentials.username,
      password: credentials.password,
    });

    if (response.data && response.data.token) {
      this.authToken = {
        accessToken: response.data.token,
        tokenType: 'Bearer',
        expiresAt: Date.now() + (response.data.expiresIn || 3600) * 1000,
        refreshToken: response.data.refreshToken,
      };
      return this.authToken;
    }

    throw new AuthenticationError(
      'Invalid response from authentication server'
    );
  }

  /**
   * Get current authentication token
   * @returns Current auth token or null if not authenticated
   */
  public getToken(): AuthToken | null {
    // If using web auth, get token from web service
    if (this.config.authMethod === 'web' && this.webAuthService) {
      try {
        return this.webAuthService.getAuthToken();
      } catch {
        return null;
      }
    }

    return this.authToken;
  }

  /**
   * Check if user is currently authenticated
   * @returns True if authenticated and token is valid
   */
  public isAuthenticated(): boolean {
    if (this.config.authMethod === 'web' && this.webAuthService) {
      return this.webAuthService.isAuthenticated();
    }

    return this.authToken !== null && this.authToken.expiresAt > Date.now();
  }

  /**
   * Get user profile information
   * @returns User profile data
   */
  public async getUserProfile(): Promise<UserProfile> {
    if (!this.isAuthenticated()) {
      throw new AuthenticationError('Not authenticated');
    }

    try {
      const token = this.getToken();
      if (!token) {
        throw new AuthenticationError('No authentication token available');
      }

      const response = await this.httpClient.get('/api/user/profile', {
        headers: {
          Authorization: `${token.tokenType} ${token.accessToken}`,
        },
      });

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          this.authToken = null;
          throw new AuthenticationError('Authentication token expired');
        }
        throw new NetworkError(
          `Failed to fetch user profile: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Refresh authentication token
   * @returns New authentication token
   */
  public async refreshToken(): Promise<AuthToken> {
    if (this.config.authMethod === 'web' && this.webAuthService) {
      // For web auth, we need to re-authenticate since tokens are short-lived
      throw new AuthenticationError(
        'Token refresh not supported with web authentication. Please re-authenticate.'
      );
    }

    if (!this.authToken?.refreshToken) {
      throw new AuthenticationError('No refresh token available');
    }

    try {
      const response = await this.httpClient.post('/api/auth/refresh', {
        refreshToken: this.authToken.refreshToken,
      });

      this.authToken = {
        accessToken: response.data.token,
        tokenType: 'Bearer',
        expiresAt: Date.now() + (response.data.expiresIn || 3600) * 1000,
        refreshToken: response.data.refreshToken || this.authToken.refreshToken,
      };

      return this.authToken;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          this.authToken = null;
          throw new AuthenticationError('Refresh token expired');
        }
        throw new NetworkError(`Token refresh failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Logout and clear authentication token
   */
  public async logout(): Promise<void> {
    if (this.config.authMethod === 'web' && this.webAuthService) {
      this.webAuthService.logout();
      return;
    }

    if (this.authToken) {
      try {
        await this.httpClient.post(
          '/api/auth/logout',
          {},
          {
            headers: {
              Authorization: `${this.authToken.tokenType} ${this.authToken.accessToken}`,
            },
          }
        );
      } catch (error: unknown) {
        // Ignore logout errors, just clear the token
        // Could implement logging here if needed
      }
    }
    this.authToken = null;
  }

  /**
   * Set authentication token manually
   * @param token - Authentication token
   */
  public setToken(token: AuthToken): void {
    this.authToken = token;
  }

  /**
   * Get user ID (only available with web authentication)
   * @returns User ID or null
   */
  public getUserId(): string | null {
    if (this.config.authMethod === 'web' && this.webAuthService) {
      return this.webAuthService.getUserId();
    }
    return null;
  }
}
