/**
 * Authentication Application Service
 * Orchestrates authentication use cases and provides a unified interface
 */

import { AuthRepository } from '@/application/ports/auth';
import { createGetCurrentUserUseCase } from '@/application/use-cases/get-current-user';
import {
  createLoginUseCase,
  LoginRequest,
  LoginResponse,
} from '@/application/use-cases/login';
import { createLogoutUseCase } from '@/application/use-cases/logout';
import { AuthToken, User } from '@/domain';

/**
 * Authentication Application Service Factory
 * Creates an authentication application service with dependency injection
 */
export const createAuthApplicationService = (
  authRepository: AuthRepository
) => {
  // Create use cases with dependency injection
  const loginUseCase = createLoginUseCase(authRepository);
  const logoutUseCase = createLogoutUseCase(authRepository);
  const getCurrentUserUseCase = createGetCurrentUserUseCase(authRepository);

  /**
   * Authenticate user with credentials
   */
  const login = async (request: LoginRequest): Promise<LoginResponse> => {
    return await loginUseCase.execute(request);
  };

  /**
   * Logout current user
   */
  const logout = async (): Promise<void> => {
    await logoutUseCase.execute();
  };

  /**
   * Get current authenticated user
   */
  const getCurrentUser = async (): Promise<User> => {
    return await getCurrentUserUseCase.execute();
  };

  /**
   * Check if user is currently authenticated
   */
  const isAuthenticated = (): boolean => {
    return authRepository.isAuthenticated();
  };

  /**
   * Get current authentication token
   */
  const getCurrentToken = (): AuthToken | null => {
    return authRepository.getCurrentToken();
  };

  /**
   * Get current user ID
   */
  const getUserId = (): string | null => {
    return authRepository.getUserId();
  };

  // Return the service interface
  return {
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
    getCurrentToken,
    getUserId,
  };
};

// Export the type for dependency injection
export type AuthApplicationService = ReturnType<
  typeof createAuthApplicationService
>;
