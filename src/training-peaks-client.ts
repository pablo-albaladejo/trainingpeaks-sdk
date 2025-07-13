/**
 * TrainingPeaks SDK Client
 *
 * - Domain: Business entities and rules
 * - Application: Use cases and ports
 * - Infrastructure: External adapters
 * - Adapters: Repository implementations
 */

import { TrainingPeaksAuthRepository } from './adapters';
import {
  AuthApplicationService,
  AuthenticationConfig,
  GetCurrentUserUseCase,
  LoginUseCase,
  LogoutUseCase,
} from './application';
import { getSDKConfig, TrainingPeaksSDKConfig } from './config';
import { AuthToken, User } from './domain';
import {
  ApiAuthAdapter,
  InMemoryStorageAdapter,
  WebBrowserAuthAdapter,
} from './infrastructure';
import { TrainingPeaksClientConfig } from './types';

export interface AuthEventCallbacks {
  onLogin?: (user: User) => void;
  onLogout?: () => void;
  onTokenRefresh?: (token: AuthToken) => void;
  onError?: (error: Error) => void;
}

export class TrainingPeaksClient {
  private sdkConfig: TrainingPeaksSDKConfig;
  private authConfig: AuthenticationConfig;
  private authRepository!: TrainingPeaksAuthRepository;
  private authService!: AuthApplicationService;
  private loginUseCase!: LoginUseCase;
  private logoutUseCase!: LogoutUseCase;
  private getCurrentUserUseCase!: GetCurrentUserUseCase;

  constructor(config: TrainingPeaksClientConfig = {}) {
    // If sdkConfig is provided, use it directly; otherwise, use defaults
    if (config.sdkConfig) {
      this.sdkConfig = getSDKConfig(config.sdkConfig);
    } else {
      // For backward compatibility, we'll use the default config
      // and override specific values in the authConfig below
      this.sdkConfig = getSDKConfig({});
    }

    // Create authentication config for the infrastructure adapters
    // Use individual config values if provided, otherwise use SDK config defaults
    this.authConfig = {
      baseUrl: config.baseUrl || this.sdkConfig.urls.baseUrl,
      timeout: config.timeout || this.sdkConfig.timeouts.default,
      debug: config.debug ?? this.sdkConfig.debug.enabled,
      headers: config.headers || this.sdkConfig.requests.defaultHeaders,
      webAuth: {
        headless: config.webAuth?.headless ?? this.sdkConfig.browser.headless,
        timeout: config.webAuth?.timeout || this.sdkConfig.timeouts.webAuth,
        executablePath:
          config.webAuth?.executablePath ||
          this.sdkConfig.browser.executablePath,
      },
    };

    // Setup dependency injection following hexagonal architecture
    this.setupDependencies();
  }

  /**
   * Setup dependency injection for hexagonal architecture
   */
  private setupDependencies(): void {
    // Infrastructure Layer - Storage adapter
    const storageAdapter = new InMemoryStorageAdapter();

    // Adapters Layer - Repository implementation
    this.authRepository = new TrainingPeaksAuthRepository(
      storageAdapter,
      this.authConfig
    );

    // Infrastructure Layer - Authentication adapters
    const webAuthAdapter = new WebBrowserAuthAdapter();
    const apiAuthAdapter = new ApiAuthAdapter();

    // Register adapters with the repository
    this.authRepository.registerAuthAdapter(webAuthAdapter);
    this.authRepository.registerAuthAdapter(apiAuthAdapter);

    // Application Layer - Services and Use Cases
    this.authService = new AuthApplicationService(this.authRepository);
    this.loginUseCase = new LoginUseCase(this.authRepository);
    this.logoutUseCase = new LogoutUseCase(this.authRepository);
    this.getCurrentUserUseCase = new GetCurrentUserUseCase(this.authRepository);
  }

  /**
   * Login with credentials
   */
  public async login(username: string, password: string): Promise<User> {
    const result = await this.loginUseCase.execute({ username, password });
    return result.user;
  }

  /**
   * Logout and clear authentication
   */
  public async logout(): Promise<void> {
    await this.logoutUseCase.execute();
  }

  /**
   * Get current authenticated user
   */
  public async getCurrentUser(): Promise<User | null> {
    try {
      const user = await this.getCurrentUserUseCase.execute();
      return user;
    } catch {
      return null;
    }
  }

  /**
   * Check if currently authenticated
   */
  public isAuthenticated(): boolean {
    return this.authRepository.isAuthenticated();
  }

  /**
   * Get current authentication token
   */
  public getCurrentToken(): AuthToken | null {
    return this.authRepository.getCurrentToken();
  }

  /**
   * Get user ID from current session
   */
  public getUserId(): string | null {
    return this.authRepository.getUserId();
  }

  /**
   * Setup event callbacks for authentication events
   */
  public setupCallbacks(callbacks: AuthEventCallbacks): void {
    // Note: Event system would be implemented in the application service
    // For now, we'll store the callbacks for future implementation
    if (callbacks.onLogin) {
      // Implementation would involve the AuthApplicationService
    }
    if (callbacks.onLogout) {
      // Implementation would involve the AuthApplicationService
    }
    if (callbacks.onTokenRefresh) {
      // Implementation would involve the AuthApplicationService
    }
    if (callbacks.onError) {
      // Implementation would involve the AuthApplicationService
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): TrainingPeaksClientConfig {
    return {
      baseUrl: this.sdkConfig.urls.baseUrl,
      authMethod: 'web', // Default from original interface
      webAuth: {
        headless: this.sdkConfig.browser.headless,
        timeout: this.sdkConfig.timeouts.webAuth,
        executablePath: this.sdkConfig.browser.executablePath,
      },
      debug: this.sdkConfig.debug.enabled,
      timeout: this.sdkConfig.timeouts.default,
      headers: this.sdkConfig.requests.defaultHeaders,
      sdkConfig: this.sdkConfig,
    };
  }

  /**
   * Get full SDK configuration
   */
  public getSDKConfig(): TrainingPeaksSDKConfig {
    return { ...this.sdkConfig };
  }

  /**
   * Update configuration and reinitialize dependencies
   */
  public updateConfig(newConfig: Partial<TrainingPeaksClientConfig>): void {
    // Create new client with updated config
    const currentConfig = this.getConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };

    // Reinitialize with new configuration
    const newClient = new TrainingPeaksClient(updatedConfig);

    // Copy the new client's configuration and dependencies
    this.sdkConfig = newClient.sdkConfig;
    this.authConfig = newClient.authConfig;
    this.setupDependencies();
  }

  /**
   * Get authentication service for advanced operations
   */
  public getAuthService(): AuthApplicationService {
    return this.authService;
  }

  /**
   * Get auth repository for low-level operations (advanced usage)
   */
  public getAuthRepository(): TrainingPeaksAuthRepository {
    return this.authRepository;
  }
}
