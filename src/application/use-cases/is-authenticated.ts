/**
 * Is Authenticated Use Case
 * Handles checking if user is currently authenticated
 */

import { HasValidAuth } from '../services/has-valid-auth';
import { UseCaseResult } from './base-result';

export type ExecuteIsAuthenticatedUseCaseResult = UseCaseResult<boolean>;

export type ExecuteIsAuthenticatedUseCase = (
  hasValidAuth: HasValidAuth
) => () => Promise<ExecuteIsAuthenticatedUseCaseResult>;

/**
 * Is authenticated use case implementation
 * Pure orchestration using contracts only
 */
export const executeIsAuthenticatedUseCase: ExecuteIsAuthenticatedUseCase =
  (hasValidAuth: HasValidAuth) => async (): Promise<ExecuteIsAuthenticatedUseCaseResult> => {
    try {
      const isAuthenticated = await hasValidAuth();

      return {
        success: true,
        data: isAuthenticated,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error
          ? error.message
          : 'Failed to check authentication status',
      };
    }
  };
