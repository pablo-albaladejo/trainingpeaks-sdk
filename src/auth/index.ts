/**
 * TrainingPeaks Authentication Module
 */

import axios, { AxiosInstance } from 'axios';
import { AuthenticationError, NetworkError } from '../errors';
import { AuthToken, LoginCredentials, UserProfile } from '../types';

export class TrainingPeaksAuth {
  private httpClient: AxiosInstance;
  private authToken: AuthToken | null = null;

  constructor(baseUrl: string = 'https://www.trainingpeaks.com') {
    this.httpClient = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TrainingPeaks-SDK/1.0.0',
      },
    });
  }

  /**
   * Authenticate with TrainingPeaks using username and password
   * @param credentials - Login credentials
   * @returns Authentication token
   */
  public async login(credentials: LoginCredentials): Promise<AuthToken> {
    try {
      // Note: This is a placeholder implementation
      // We'll need to investigate the actual TrainingPeaks login flow
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
    } catch (error: unknown) {
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
   * Get current authentication token
   * @returns Current auth token or null if not authenticated
   */
  public getToken(): AuthToken | null {
    return this.authToken;
  }

  /**
   * Check if user is currently authenticated
   * @returns True if authenticated and token is valid
   */
  public isAuthenticated(): boolean {
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
      const response = await this.httpClient.get('/api/user/profile', {
        headers: {
          Authorization: `${this.authToken!.tokenType} ${this.authToken!.accessToken}`,
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
}
