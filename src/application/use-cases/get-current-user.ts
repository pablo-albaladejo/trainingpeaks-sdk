/**
 * Get Current User Use Case
 * Retrieves the currently authenticated user
 */

import type { AuthRepository } from '@/application/ports/auth';
import type { User } from '@/domain';

export type ExecuteGetCurrentUserUseCase = () => Promise<User>;

/**
 * Get Current User Use Case Implementation
 * Individual function that receives dependencies as parameters
 */
export const executeGetCurrentUserUseCase =
  (authRepository: AuthRepository): ExecuteGetCurrentUserUseCase =>
  async (): Promise<User> => {
    // Check if user is authenticated using repository method
    if (!authRepository.isAuthenticated()) {
      throw new Error('No valid authentication token available');
    }

    const currentUser = await authRepository.getCurrentUser();
    if (!currentUser) {
      throw new Error('No current user found');
    }

    return currentUser;
  };

// Keep the existing grouped function for backward compatibility
export const createGetCurrentUserUseCase = (authRepository: AuthRepository) => {
  return {
    execute: executeGetCurrentUserUseCase(authRepository),
  };
};

// Export the type for dependency injection
export type GetCurrentUserUseCase = ReturnType<
  typeof createGetCurrentUserUseCase
>;
