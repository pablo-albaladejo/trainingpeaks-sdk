/**
 * Authentication Application Service Implementation
 * Implements the AuthApplicationService contract by orchestrating authentication use cases
 */

import type { AuthRepository } from '@/application/ports/auth';
import type {
  getCurrentToken,
  getCurrentUser,
  getUserId,
  isAuthenticated,
  login,
  logout,
} from '@/application/services/auth-application';
import { createGetCurrentUserUseCase } from '@/application/use-cases/get-current-user';
import {
  createLoginUseCase,
  LoginRequest,
  LoginResponse,
} from '@/application/use-cases/login';
import { createLogoutUseCase } from '@/application/use-cases/logout';
import { AuthToken, User } from '@/domain';

/**
 * IMPLEMENTATION of AuthApplicationService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createAuthApplicationService = (
  authRepository: AuthRepository
): {
  login: login;
  logout: logout;
  getCurrentUser: getCurrentUser;
  isAuthenticated: isAuthenticated;
  getCurrentToken: getCurrentToken;
  getUserId: getUserId;
} => {
  // Create use cases with dependency injection
  const loginUseCase = createLoginUseCase(authRepository);
  const logoutUseCase = createLogoutUseCase(authRepository);
  const getCurrentUserUseCase = createGetCurrentUserUseCase(authRepository);

  return {
    login: async (request: LoginRequest): Promise<LoginResponse> => {
      return await loginUseCase.execute(request);
    },

    logout: async (): Promise<void> => {
      await logoutUseCase.execute();
    },

    getCurrentUser: async (): Promise<User> => {
      return await getCurrentUserUseCase.execute();
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
