/**
 * Authentication Application Service Implementation
 * Implements the AuthApplicationService contract by orchestrating authentication use cases
 */

import type { AuthRepository } from '@/application/ports/auth';
import type {
  LoginRequest,
  LoginResponse,
} from '@/application/services/auth-application';
import type { AuthToken } from '@/domain/entities/auth-token';
import type { User } from '@/domain/entities/user';

/**
 * IMPLEMENTATION of AuthApplicationService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createAuthApplicationService = (
  authRepository: AuthRepository
) => {
  return {
    login: async (request: LoginRequest): Promise<LoginResponse> => {
      const token = await authRepository.authenticate(request.credentials);
      const user = await authRepository.getCurrentUser();

      if (user) {
        return {
          token,
          user,
        };
      }

      throw new Error('Failed to get user after authentication');
    },

    logout: async (): Promise<void> => {
      await authRepository.clearAuth();
    },

    getCurrentUser: async (): Promise<User | null> => {
      return await authRepository.getCurrentUser();
    },

    isAuthenticated: (): boolean => {
      return authRepository.isAuthenticated();
    },

    getCurrentToken: (): AuthToken | null => {
      return authRepository.getCurrentToken();
    },

    getUserId: (): string | null => {
      return authRepository.getUserId();
    },
  };
};
