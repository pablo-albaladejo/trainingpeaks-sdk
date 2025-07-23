/**
 * Get User Use Case
 * Handles retrieving current user information
 */

import type { GetCurrentUserService } from '@/application/services/auth-service';
import type { User } from '@/domain';

export type GetUserResponse = {
  success: boolean;
  user?: User;
  error?: string;
};

export type ExecuteGetUserUseCase = (
  getCurrentUserService: GetCurrentUserService
) => () => Promise<GetUserResponse>;

/**
 * Get user use case implementation
 * Pure orchestration using contracts only
 */
export const executeGetUserUseCase: ExecuteGetUserUseCase =
  (getCurrentUserService: GetCurrentUserService) =>
  async (): Promise<GetUserResponse> => {
    try {
      const user = await getCurrentUserService();

      if (!user) {
        return {
          success: false,
          error: 'No authenticated user found',
        };
      }

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to retrieve user',
      };
    }
  };
