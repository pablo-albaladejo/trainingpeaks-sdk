/**
 * TrainingPeaks Main Client
 */

import { TrainingPeaksAuth } from '../auth';
import { SimpleAuthManager } from '../auth/simple-auth-manager';
import { AuthToken, LoginCredentials, TrainingPeaksConfig } from '../types';
import { WorkoutUploader } from '../workout';

export class TrainingPeaksClient {
  private config: TrainingPeaksConfig;
  private auth: TrainingPeaksAuth;
  private authManager: SimpleAuthManager;
  private workoutUploader: WorkoutUploader;

  constructor(config: TrainingPeaksConfig = {}) {
    this.config = {
      baseUrl:
        process.env.TRAININGPEAKS_BASE_URL || 'https://www.trainingpeaks.com',
      timeout: 10000,
      debug: false,
      authMethod: 'web', // Default to web authentication
      ...config,
    };

    this.auth = new TrainingPeaksAuth(this.config);
    this.authManager = new SimpleAuthManager(this.auth, {
      autoRefresh: this.config.authMethod !== 'web', // Only auto-refresh for API auth
      refreshThreshold: 300,
    });
    this.workoutUploader = new WorkoutUploader(this.auth, this.config);
  }

  /**
   * Get authentication module
   * @returns Authentication module instance
   */
  public getAuth(): TrainingPeaksAuth {
    return this.auth;
  }

  /**
   * Get workout uploader module
   * @returns Workout uploader module instance
   */
  public getWorkoutUploader(): WorkoutUploader {
    return this.workoutUploader;
  }

  /**
   * Get current configuration
   * @returns Current configuration object
   */
  public getConfig(): TrainingPeaksConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   * @param config - New configuration options
   */
  public updateConfig(config: Partial<TrainingPeaksConfig>): void {
    this.config = { ...this.config, ...config };
    // Recreate modules with new config
    this.auth = new TrainingPeaksAuth(this.config);
    this.authManager = new SimpleAuthManager(this.auth, {
      autoRefresh: this.config.authMethod !== 'web',
      refreshThreshold: 300,
    });
    this.workoutUploader = new WorkoutUploader(this.auth, this.config);
  }

  /**
   * Simple login - handles authentication automatically
   * @param credentials - Login credentials
   */
  public async login(credentials: LoginCredentials): Promise<void> {
    return await this.authManager.login(credentials);
  }

  /**
   * Advanced login - returns token for manual management
   * @param credentials - Login credentials
   * @returns Authentication token
   */
  public async loginAdvanced(
    credentials: LoginCredentials
  ): Promise<AuthToken> {
    return await this.authManager.loginAdvanced(credentials);
  }

  /**
   * Set authentication token manually
   * @param token - Authentication token
   */
  public setAuthToken(token: AuthToken): void {
    this.authManager.setToken(token);
  }

  /**
   * Get current authentication token
   * @returns Current auth token or null
   */
  public getAuthToken(): AuthToken | null {
    return this.authManager.getToken();
  }

  /**
   * Logout and clear authentication
   */
  public async logout(): Promise<void> {
    return await this.authManager.logout();
  }

  /**
   * Set up authentication event listeners
   */
  public onAuthLogin(callback: (token: AuthToken) => void): void {
    this.authManager.setOnLogin(callback);
  }

  public onAuthLogout(callback: () => void): void {
    this.authManager.setOnLogout(callback);
  }

  public onAuthTokenRefresh(callback: (token: AuthToken) => void): void {
    this.authManager.setOnTokenRefresh(callback);
  }

  public onAuthTokenExpired(callback: (token: AuthToken) => void): void {
    this.authManager.setOnTokenExpired(callback);
  }

  public onAuthError(callback: (error: Error) => void): void {
    this.authManager.setOnError(callback);
  }

  /**
   * Check if client is ready for API calls
   * @returns True if authenticated and ready
   */
  public isReady(): boolean {
    return this.authManager.isAuthenticated();
  }

  /**
   * Get user ID (only available with web authentication)
   * @returns User ID or null
   */
  public getUserId(): string | null {
    return this.auth.getUserId();
  }
}
