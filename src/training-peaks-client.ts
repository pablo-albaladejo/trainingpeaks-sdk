/**
 * TrainingPeaks SDK Client
 *
 * - Domain: Business entities and rules
 * - Application: Use cases and ports
 * - Infrastructure: External adapters
 * - Adapters: Repository implementations
 */

import { AuthenticationConfig } from '@/application';
import type { AuthApplicationServiceFactory } from '@/application/services/auth-application';
import { getSDKConfig, TrainingPeaksSDKConfig } from '@/config';
import { AuthToken, User } from '@/domain';
import {
  ApiAuthAdapter,
  InMemoryStorageAdapter,
  WebBrowserAuthAdapter,
} from '@/infrastructure';
import { createTrainingPeaksAuthRepository } from '@/infrastructure/repositories/training-peaks-auth';
import { createAuthApplicationService } from '@/infrastructure/services/auth-application';
import { TrainingPeaksClientConfig } from '@/types';

export interface AuthEventCallbacks {
  onLogin?: (user: User) => void;
  onLogout?: () => void;
  onTokenRefresh?: (token: AuthToken) => void;
  onError?: (error: Error) => void;
}

/**
 * TrainingPeaks Client Factory
 * Creates a TrainingPeaks client with dependency injection following function-first architecture
 */
export const createTrainingPeaksClient = (
  config: TrainingPeaksClientConfig = {}
) => {
  // Configuration setup
  let sdkConfig: TrainingPeaksSDKConfig;
  if (config.sdkConfig) {
    sdkConfig = getSDKConfig(config.sdkConfig);
  } else {
    // For backward compatibility, use default config
    sdkConfig = getSDKConfig({});
  }

  // Create authentication config for the infrastructure adapters
  const authConfig: AuthenticationConfig = {
    baseUrl: config.baseUrl || sdkConfig.urls.baseUrl,
    timeout: config.timeout || sdkConfig.timeouts.default,
    debug: config.debug ?? sdkConfig.debug.enabled,
    headers: config.headers || sdkConfig.requests.defaultHeaders,
    webAuth: {
      headless: config.webAuth?.headless ?? sdkConfig.browser.headless,
      timeout: config.webAuth?.timeout || sdkConfig.timeouts.webAuth,
      executablePath:
        config.webAuth?.executablePath || sdkConfig.browser.executablePath,
    },
  };

  // Setup dependency injection following hexagonal architecture
  const setupDependencies = () => {
    // Infrastructure Layer - Storage adapter
    const storageAdapter = new InMemoryStorageAdapter();

    // Adapters Layer - Repository implementation
    const authRepositoryFactory = createTrainingPeaksAuthRepository(
      storageAdapter,
      authConfig
    );

    // Infrastructure Layer - Authentication adapters
    const webAuthAdapter = new WebBrowserAuthAdapter();
    const apiAuthAdapter = new ApiAuthAdapter();

    // Register adapters with the repository
    authRepositoryFactory.registerAuthAdapter(webAuthAdapter);
    authRepositoryFactory.registerAuthAdapter(apiAuthAdapter);

    // Application Layer - Services
    const authService = createAuthApplicationService(
      authRepositoryFactory.repository
    );

    return {
      authRepository: authRepositoryFactory.repository,
      authService,
    };
  };

  // Initialize dependencies
  const { authRepository, authService } = setupDependencies();

  /**
   * Login with credentials
   */
  const login = async (username: string, password: string): Promise<User> => {
    const result = await authService.login({ username, password });
    return result.user;
  };

  /**
   * Logout and clear authentication
   */
  const logout = async (): Promise<void> => {
    await authService.logout();
  };

  /**
   * Get current authenticated user
   */
  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch {
      return null;
    }
  };

  /**
   * Check if currently authenticated
   */
  const isAuthenticated = (): boolean => {
    return authService.isAuthenticated();
  };

  /**
   * Get current authentication token
   */
  const getCurrentToken = (): AuthToken | null => {
    return authService.getCurrentToken();
  };

  /**
   * Get user ID from current session
   */
  const getUserId = (): string | null => {
    return authService.getUserId();
  };

  /**
   * Setup event callbacks for authentication events
   */
  const setupCallbacks = (callbacks: AuthEventCallbacks): void => {
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
  };

  /**
   * Get current configuration
   */
  const getConfig = (): TrainingPeaksClientConfig => {
    return {
      baseUrl: sdkConfig.urls.baseUrl,
      authMethod: 'web', // Default from original interface
      webAuth: {
        headless: sdkConfig.browser.headless,
        timeout: sdkConfig.timeouts.webAuth,
        executablePath: sdkConfig.browser.executablePath,
      },
      debug: sdkConfig.debug.enabled,
      timeout: sdkConfig.timeouts.default,
      headers: sdkConfig.requests.defaultHeaders,
      sdkConfig: sdkConfig,
    };
  };

  /**
   * Get full SDK configuration
   */
  const getSDKConfiguration = (): TrainingPeaksSDKConfig => {
    return { ...sdkConfig };
  };

  /**
   * Update configuration and reinitialize dependencies
   */
  const updateConfig = (
    newConfig: Partial<TrainingPeaksClientConfig>
  ): void => {
    // Create new client with updated config
    const currentConfig = getConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };

    // Reinitialize with new configuration
    const newClient = createTrainingPeaksClient(updatedConfig);

    // Copy the new client's configuration
    sdkConfig = newClient.getSDKConfig();

    // Note: In a real implementation, we'd need to properly update the existing client
    // For now, this is a simplified version
  };

  /**
   * Get authentication service for advanced operations
   */
  const getAuthService = (): ReturnType<AuthApplicationServiceFactory> => {
    return authService;
  };

  /**
   * Get auth repository for low-level operations (advanced usage)
   */
  const getAuthRepository = () => {
    return authRepository;
  };

  // Return the client interface
  return {
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
    getCurrentToken,
    getUserId,
    setupCallbacks,
    getConfig,
    getSDKConfig: getSDKConfiguration,
    updateConfig,
    getAuthService,
    getAuthRepository,
  };
};

// Export the type for dependency injection
export type TrainingPeaksClient = ReturnType<typeof createTrainingPeaksClient>;

// For backward compatibility, create a default export function
export default createTrainingPeaksClient;
