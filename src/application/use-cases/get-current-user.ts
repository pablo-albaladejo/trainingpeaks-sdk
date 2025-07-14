/**
 * Get Current User Use Case
 * Retrieves the currently authenticated user
 */

import { AuthRepository } from '@/application/ports/auth';
import { User } from '@/domain/entities/user';
import { createAuthDomainService } from '@/domain/services/auth-domain';

/**
 * Get Current User Use Case Factory
 * Creates a get current user use case with dependency injection
 */
export const createGetCurrentUserUseCase = (authRepository: AuthRepository) => {
  const authDomainService = createAuthDomainService();

  /**
   * Execute get current user process
   */
  const execute = async (): Promise<User> => {
    const currentToken = authRepository.getCurrentToken();

    if (!currentToken || authDomainService.isTokenExpired(currentToken)) {
      throw new Error('No valid authentication token available');
    }

    const currentUser = await authRepository.getCurrentUser();
    if (!currentUser) {
      throw new Error('No current user found');
    }

    return currentUser;
  };

  return { execute };
};

// Export the type for dependency injection
export type GetCurrentUserUseCase = ReturnType<
  typeof createGetCurrentUserUseCase
>;
