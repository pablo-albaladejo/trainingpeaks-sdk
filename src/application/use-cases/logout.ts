/**
 * Logout Use Case
 * Handles user logout process
 */

import type { AuthRepository } from '@/application/ports/auth';

export type ExecuteLogoutUseCase = () => Promise<void>;

/**
 * Logout Use Case Implementation
 * Individual function that receives dependencies as parameters
 */
export const executeLogoutUseCase =
  (authRepository: AuthRepository): ExecuteLogoutUseCase =>
  async (): Promise<void> => {
    // Clear all authentication data
    await authRepository.clearAuth();
  };

// Keep the existing grouped function for backward compatibility
export const createLogoutUseCase = (authRepository: AuthRepository) => {
  return {
    execute: executeLogoutUseCase(authRepository),
  };
};

// Export the type for dependency injection
export type LogoutUseCase = ReturnType<typeof createLogoutUseCase>;
