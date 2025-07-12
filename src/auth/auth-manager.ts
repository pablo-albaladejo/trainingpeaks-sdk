/**
 * Advanced Authentication Manager for TrainingPeaks SDK
 * Provides comprehensive authentication management with event system
 */

import { TrainingPeaksAuth } from '.';
import { AuthToken, LoginCredentials, UserProfile } from '../types';

export interface StorageAdapter {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
}

export interface AuthManagerOptions {
  /** Enable automatic token refresh */
  autoRefresh?: boolean;
  /** Enable persistent session storage */
  persistSession?: boolean;
  /** Custom storage adapter */
  storage?: StorageAdapter;
  /** Storage key for persisted session */
  storageKey?: string;
  /** Refresh threshold in seconds before expiry */
  refreshThreshold?: number;
}

export class AuthManager {
  private auth: TrainingPeaksAuth;
  private currentToken: AuthToken | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private options: AuthManagerOptions;

  // Event callbacks
  private onLogin?: (token: AuthToken) => void;
  private onLogout?: () => void;
  private onTokenRefresh?: (token: AuthToken) => void;
  private onTokenExpired?: (token: AuthToken) => void;
  private onError?: (error: Error) => void;

  constructor(auth: TrainingPeaksAuth, options: AuthManagerOptions = {}) {
    this.auth = auth;
    this.options = {
      autoRefresh: true,
      persistSession: false,
      storageKey: 'trainingpeaks_auth_token',
      refreshThreshold: 300, // 5 minutes before expiry
      ...options,
    };

    // Load persisted session if enabled
    if (this.options.persistSession) {
      this.loadPersistedSession();
    }
  }

  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    try {
      const token = await this.auth.login(credentials);
      this.setToken(token);
      this.onLogin?.(token);
      return token;
    } catch (error) {
      this.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: AuthToken): void {
    this.currentToken = token;
    this.auth.setToken(token);

    // Persist session if enabled
    if (this.options.persistSession) {
      this.persistSession(token);
    }

    // Schedule automatic refresh if enabled
    if (this.options.autoRefresh) {
      this.scheduleRefresh(token);
    }
  }

  /**
   * Get current authentication token
   */
  getToken(): AuthToken | null {
    return this.currentToken;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    return await this.auth.getUserProfile();
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    try {
      await this.auth.logout();
      this.clearSession();
      this.onLogout?.();
    } catch (error) {
      this.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Manually refresh token
   */
  async refreshToken(): Promise<AuthToken> {
    try {
      const newToken = await this.auth.refreshToken();
      this.setToken(newToken);
      this.onTokenRefresh?.(newToken);
      return newToken;
    } catch (error) {
      this.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Event listeners
   */
  setOnLogin(callback: (token: AuthToken) => void): void {
    this.onLogin = callback;
  }

  setOnLogout(callback: () => void): void {
    this.onLogout = callback;
  }

  setOnTokenRefresh(callback: (token: AuthToken) => void): void {
    this.onTokenRefresh = callback;
  }

  setOnTokenExpired(callback: (token: AuthToken) => void): void {
    this.onTokenExpired = callback;
  }

  setOnError(callback: (error: Error) => void): void {
    this.onError = callback;
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleRefresh(token: AuthToken): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const now = Date.now();
    const expiry = token.expiresAt;
    const refreshTime = expiry - (this.options.refreshThreshold || 300) * 1000;
    const delay = refreshTime - now;

    if (delay > 0) {
      this.refreshTimer = setTimeout(async () => {
        try {
          await this.refreshToken();
        } catch (error) {
          this.onTokenExpired?.(token);
          this.clearSession();
        }
      }, delay);
    }
  }

  /**
   * Clear session data
   */
  private clearSession(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.currentToken = null;

    // Clear persisted session if enabled
    if (this.options.persistSession && this.options.storage) {
      this.options.storage.removeItem(
        this.options.storageKey || 'trainingpeaks_auth_token'
      );
    }
  }

  /**
   * Persist session to storage
   */
  private persistSession(token: AuthToken): void {
    if (!this.options.storage) {
      return;
    }

    try {
      const sessionData = JSON.stringify(token);
      this.options.storage.setItem(
        this.options.storageKey || 'trainingpeaks_auth_token',
        sessionData
      );
    } catch (error) {
      // Storage might be full or unavailable
      console.warn('Failed to persist session:', error);
    }
  }

  /**
   * Load persisted session from storage
   */
  private loadPersistedSession(): void {
    if (!this.options.storage) {
      return;
    }

    try {
      const sessionData = this.options.storage.getItem(
        this.options.storageKey || 'trainingpeaks_auth_token'
      );
      if (sessionData) {
        const token: AuthToken = JSON.parse(sessionData);

        // Check if token is still valid
        if (token.expiresAt > Date.now()) {
          this.setToken(token);
        } else {
          // Clean up expired token
          this.options.storage.removeItem(
            this.options.storageKey || 'trainingpeaks_auth_token'
          );
        }
      }
    } catch (error) {
      // Invalid session data
      console.warn('Failed to load persisted session:', error);
      if (this.options.storage) {
        this.options.storage.removeItem(
          this.options.storageKey || 'trainingpeaks_auth_token'
        );
      }
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearSession();
    this.onLogin = undefined;
    this.onLogout = undefined;
    this.onTokenRefresh = undefined;
    this.onTokenExpired = undefined;
    this.onError = undefined;
  }
}
