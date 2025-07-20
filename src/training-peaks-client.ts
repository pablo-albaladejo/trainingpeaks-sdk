/**
 * TrainingPeaks Client
 * Main client for interacting with TrainingPeaks services
 */

import { createWorkoutManager } from './workout-manager';

/**
 * Configuration for the TrainingPeaks client
 */
export type TrainingPeaksClientConfig = {
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
};

/**
 * Main TrainingPeaks client
 */
export class TrainingPeaksClient {
  private config: TrainingPeaksClientConfig;
  private workoutManager: unknown;
  private authenticated: boolean = false;

  constructor(config: TrainingPeaksClientConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'https://api.trainingpeaks.com',
      timeout: config.timeout || 10000,
      debug: config.debug || false,
    };
    this.workoutManager = createWorkoutManager();
  }

  /**
   * Login with username and password
   */
  async login(username: string, password: string) {
    // Simulate authentication logic
    if (username === 'invalid_user' && password === 'invalid_password') {
      this.authenticated = false;
      throw new Error('Invalid credentials');
    }

    this.authenticated = true;
    return {
      success: true,
      user: { id: '1', username, email: `${username}@example.com` },
      token: { accessToken: 'mock-token', expiresAt: new Date() },
    };
  }

  /**
   * Logout
   */
  async logout() {
    this.authenticated = false;
    return { success: true };
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    // Simple implementation for now
    return { id: '1', username: 'user', email: 'user@example.com' };
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.authenticated;
  }

  /**
   * Get workout manager
   */
  getWorkoutManager() {
    return this.workoutManager;
  }

  /**
   * Get configuration
   */
  getConfig(): TrainingPeaksClientConfig {
    return this.config;
  }
}
