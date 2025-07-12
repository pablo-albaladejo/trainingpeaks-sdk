/**
 * Simplified Authentication Manager for TrainingPeaks SDK
 * Provides both simple and advanced authentication patterns without DOM dependencies
 */

import { TrainingPeaksAuth } from '.';
import { AuthToken, LoginCredentials, UserProfile } from '../types';
import { AuthManager, AuthManagerOptions } from './auth-manager';

export interface SimpleAuthManagerOptions extends AuthManagerOptions {}

export class SimpleAuthManager {
  private authManager: AuthManager;

  constructor(auth: TrainingPeaksAuth, options: SimpleAuthManagerOptions = {}) {
    this.authManager = new AuthManager(auth, options);
  }

  /**
   * Simple login - manages everything automatically
   */
  async login(credentials: LoginCredentials): Promise<void> {
    await this.authManager.login(credentials);
  }

  /**
   * Advanced login - returns token for manual management
   */
  async loginAdvanced(credentials: LoginCredentials): Promise<AuthToken> {
    return await this.authManager.login(credentials);
  }

  /**
   * Set authentication token (for advanced usage)
   */
  setToken(token: AuthToken): void {
    this.authManager.setToken(token);
  }

  /**
   * Get current authentication token
   */
  getToken(): AuthToken | null {
    return this.authManager.getToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authManager.isAuthenticated();
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    return await this.authManager.getUserProfile();
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    await this.authManager.logout();
  }

  /**
   * Manually refresh token
   */
  async refreshToken(): Promise<AuthToken> {
    return await this.authManager.refreshToken();
  }

  /**
   * Event listeners
   */
  setOnLogin(callback: (token: AuthToken) => void): void {
    this.authManager.setOnLogin(callback);
  }

  setOnLogout(callback: () => void): void {
    this.authManager.setOnLogout(callback);
  }

  setOnTokenRefresh(callback: (token: AuthToken) => void): void {
    this.authManager.setOnTokenRefresh(callback);
  }

  setOnTokenExpired(callback: (token: AuthToken) => void): void {
    this.authManager.setOnTokenExpired(callback);
  }

  setOnError(callback: (error: Error) => void): void {
    this.authManager.setOnError(callback);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.authManager.destroy();
  }
}
