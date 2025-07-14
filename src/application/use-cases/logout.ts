/**
 * Logout Use Case
 * Handles user logout process
 */

import { AuthRepository } from '@/application/ports/auth';

/**
 * Logout Use Case Factory
 * Creates a logout use case with dependency injection
 */
export const createLogoutUseCase = (authRepository: AuthRepository) => {
  /**
   * Execute logout process
   */
  const execute = async (): Promise<void> => {
    // Clear all authentication data
    await authRepository.clearAuth();
  };

  return { execute };
};

// Export the type for dependency injection
export type LogoutUseCase = ReturnType<typeof createLogoutUseCase>;
