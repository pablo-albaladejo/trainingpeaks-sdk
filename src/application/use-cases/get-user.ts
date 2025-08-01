/**
 * Get User Use Case
 * Handles retrieving current user information
 */

import { User } from '@/domain';
import { UseCaseResult } from './base-result';

type GetCurrentUser = () => Promise<User | null>;

export type ExecuteGetUserUseCaseResult = UseCaseResult<User>;

export type ExecuteGetUserUseCase = (
  getCurrentUser: GetCurrentUser
) => () => Promise<ExecuteGetUserUseCaseResult>;

/**
 * Get user use case implementation
 * Pure orchestration using contracts only
 */
export const executeGetUserUseCase: ExecuteGetUserUseCase =
  (getCurrentUser: GetCurrentUser) =>
  async (): Promise<ExecuteGetUserUseCaseResult> => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        return {
          success: false,
          error: 'No authenticated user found',
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to retrieve user',
      };
    }
  };
