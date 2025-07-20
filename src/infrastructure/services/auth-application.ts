/**
 * Authentication Application Service Implementation
 * Individual function implementations that receive dependencies as parameters
 */

import type { AuthRepository } from '@/application/ports/auth';
import type {
  GetCurrentToken,
  GetCurrentUser,
  GetUserId,
  IsAuthenticated,
  Login,
  LoginRequest,
  LoginResponse,
  Logout,
} from '@/application/services/auth-application';
import type { AuthToken } from '@/domain/entities/auth-token';
import type { User } from '@/domain/entities/user';

export const login =
  (authRepository: AuthRepository): Login =>
  async (request: LoginRequest): Promise<LoginResponse> => {
    const token = await authRepository.authenticate(request.credentials);
    const user = await authRepository.getCurrentUser();

    if (user) {
      return {
        token,
        user,
      };
    }

    throw new Error('Failed to get user after authentication');
  };

export const logout =
  (authRepository: AuthRepository): Logout =>
  async (): Promise<void> => {
    await authRepository.clearAuth();
  };

export const getCurrentUser =
  (authRepository: AuthRepository): GetCurrentUser =>
  async (): Promise<User | null> => {
    return await authRepository.getCurrentUser();
  };

export const isAuthenticated =
  (authRepository: AuthRepository): IsAuthenticated =>
  (): boolean => {
    return authRepository.isAuthenticated();
  };

export const getCurrentToken =
  (authRepository: AuthRepository): GetCurrentToken =>
  (): AuthToken | null => {
    return authRepository.getCurrentToken();
  };

export const getUserId =
  (authRepository: AuthRepository): GetUserId =>
  (): string | null => {
    return authRepository.getUserId();
  };
