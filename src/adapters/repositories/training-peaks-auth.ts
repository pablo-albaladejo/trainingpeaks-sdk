/**
 * TrainingPeaks Authentication Repository Implementation
 * Connects domain layer with infrastructure adapters
 */

import {
  AuthenticationConfig,
  AuthenticationPort,
  StoragePort,
} from '../../application';
import { AuthToken, Credentials, User } from '../../domain';
import { AuthRepository } from '../../domain/repositories/auth';

export class TrainingPeaksAuthRepository implements AuthRepository {
  private authAdapters: AuthenticationPort[] = [];
  private cachedToken: AuthToken | null = null;
  private cachedUser: User | null = null;

  constructor(
    private readonly storageAdapter: StoragePort,
    private readonly config: AuthenticationConfig
  ) {
    // Initialize cache from storage
    this.initializeCache();
  }

  /**
   * Register an authentication adapter
   */
  public registerAuthAdapter(adapter: AuthenticationPort): void {
    this.authAdapters.push(adapter);
  }

  /**
   * Authenticate user with credentials
   */
  public async authenticate(credentials: Credentials): Promise<AuthToken> {
    const adapter = this.getCompatibleAdapter();

    const { token, user } = await adapter.authenticate(
      credentials,
      this.config
    );

    // Store the authentication data
    await this.storageAdapter.storeToken(token);
    await this.storageAdapter.storeUser(user);

    // Update cache
    this.cachedToken = token;
    this.cachedUser = user;

    return token;
  }

  /**
   * Get current authenticated user
   */
  public async getCurrentUser(): Promise<User | null> {
    return await this.storageAdapter.getUser();
  }

  /**
   * Refresh authentication token
   */
  public async refreshToken(refreshToken: string): Promise<AuthToken> {
    const adapter = this.getCompatibleAdapter();

    const newToken = await adapter.refreshToken(refreshToken, this.config);

    // Store the new token
    await this.storageAdapter.storeToken(newToken);

    // Update cache
    this.cachedToken = newToken;

    return newToken;
  }

  /**
   * Check if currently authenticated
   */
  public isAuthenticated(): boolean {
    return this.cachedToken !== null && !this.cachedToken.isExpired();
  }

  /**
   * Get current authentication token
   */
  public getCurrentToken(): AuthToken | null {
    if (this.cachedToken && this.cachedToken.isExpired()) {
      this.cachedToken = null;
      this.storageAdapter.clear(); // Clear expired token from storage
    }
    return this.cachedToken;
  }

  /**
   * Store authentication token
   */
  public async storeToken(token: AuthToken): Promise<void> {
    await this.storageAdapter.storeToken(token);
    this.cachedToken = token;
  }

  /**
   * Store user information
   */
  public async storeUser(user: User): Promise<void> {
    await this.storageAdapter.storeUser(user);
    this.cachedUser = user;
  }

  /**
   * Clear authentication data
   */
  public async clearAuth(): Promise<void> {
    await this.storageAdapter.clear();
    this.cachedToken = null;
    this.cachedUser = null;
  }

  /**
   * Get user ID from stored authentication
   */
  public getUserId(): string | null {
    return this.cachedUser?.id || null;
  }

  /**
   * Initialize cache from storage
   */
  private async initializeCache(): Promise<void> {
    try {
      this.cachedToken = await this.storageAdapter.getToken();
      this.cachedUser = await this.storageAdapter.getUser();
    } catch {
      // Ignore errors during initialization
      this.cachedToken = null;
      this.cachedUser = null;
    }
  }

  /**
   * Get a compatible authentication adapter for the current configuration
   */
  private getCompatibleAdapter(): AuthenticationPort {
    const compatibleAdapter = this.authAdapters.find(adapter =>
      adapter.canHandle(this.config)
    );

    if (!compatibleAdapter) {
      throw new Error(
        'No compatible authentication adapter found for the current configuration'
      );
    }

    return compatibleAdapter;
  }
}
