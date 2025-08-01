/**
 * Get User ID Use Case
 * Handles retrieving current user ID
 */

import { GetUserId } from '../services/get-user-id';
import { UseCaseResult } from './base-result';

export type ExecuteGetUserIdUseCaseResult = UseCaseResult<string | null>;

export type ExecuteGetUserIdUseCase = (
  getUserId: GetUserId
) => () => Promise<ExecuteGetUserIdUseCaseResult>;

/**
 * Get user ID use case implementation
 * Pure orchestration using contracts only
 */
export const executeGetUserIdUseCase: ExecuteGetUserIdUseCase =
  (getUserId: GetUserId) =>
  async (): Promise<ExecuteGetUserIdUseCaseResult> => {
    try {
      const userId = await getUserId();

      return {
        success: true,
        data: userId,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to retrieve user ID',
      };
    }
  };
