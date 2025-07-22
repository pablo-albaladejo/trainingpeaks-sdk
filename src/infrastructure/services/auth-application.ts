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
import type { AuthToken, User } from '@/domain';
import { SDKError } from '@/domain/errors';

export const login =
  (authRepository: AuthRepository): Login =>
  async (request: LoginRequest): Promise<LoginResponse> => {
    try {
      const token = await authRepository.authenticate(request.credentials);
      const user = await authRepository.getCurrentUser();

      if (user) {
        return {
          token,
          user,
        };
      }

      throw SDKError.userNotFound({
        operation: 'login',
        resource: 'user',
        userId: request.credentials.username,
      });
    } catch (error) {
      if (error instanceof SDKError) {
        throw error;
      }

      throw SDKError.authFailed(
        'Failed to get user after authentication',
        {
          operation: 'login',
          resource: 'user',
          userId: request.credentials.username,
        },
        error instanceof Error ? error : undefined
      );
    }
  };

export const logout =
  (authRepository: AuthRepository): Logout =>
  async (): Promise<void> => {
    try {
      await authRepository.clearAuth();
    } catch (error) {
      throw SDKError.fromError(
        error instanceof Error ? error : new Error('Logout failed'),
        'AUTH_1001',
        { operation: 'logout' }
      );
    }
  };

export const getCurrentUser =
  (authRepository: AuthRepository): GetCurrentUser =>
  async (): Promise<User | null> => {
    try {
      return await authRepository.getCurrentUser();
    } catch (error) {
      throw SDKError.fromError(
        error instanceof Error
          ? error
          : new Error('Failed to get current user'),
        'AUTH_1006',
        { operation: 'getCurrentUser' }
      );
    }
  };

export const isAuthenticated =
  (authRepository: AuthRepository): IsAuthenticated =>
  (): boolean => {
    try {
      return authRepository.isAuthenticated();
    } catch (error) {
      // For boolean operations, we log the error but return false instead of throwing
      console.error('Error checking authentication status:', error);
      return false;
    }
  };

export const getCurrentToken =
  (authRepository: AuthRepository): GetCurrentToken =>
  (): AuthToken | null => {
    try {
      return authRepository.getCurrentToken();
    } catch (error) {
      throw SDKError.fromError(
        error instanceof Error
          ? error
          : new Error('Failed to get current token'),
        'AUTH_1003',
        { operation: 'getCurrentToken' }
      );
    }
  };

export const getUserId =
  (authRepository: AuthRepository): GetUserId =>
  (): string | null => {
    try {
      return authRepository.getUserId();
    } catch (error) {
      throw SDKError.fromError(
        error instanceof Error ? error : new Error('Failed to get user ID'),
        'AUTH_1006',
        { operation: 'getUserId' }
      );
    }
  };
