/**
 * Login Use Case
 * Handles user authentication workflow
 */

import { AuthToken, Credentials } from '@/domain';
import { AuthenticateUser } from '../services/authenticate-user';
import { UseCaseResult } from './base-result';

export type ExecuteLoginUserUseCaseResult = UseCaseResult<AuthToken>;

export type ExecuteLoginUserUseCase = (
  authenticateUser: AuthenticateUser
) => (credentials: Credentials) => Promise<ExecuteLoginUserUseCaseResult>;

/**
 * Login use case implementation
 * Pure orchestration using contracts only
 */
export const executeLoginUserUseCase: ExecuteLoginUserUseCase =
  (authenticateUser: AuthenticateUser) =>
  async (credentials: Credentials): Promise<ExecuteLoginUserUseCaseResult> => {
    try {
      // Authenticate user using authenticate service
      const authResult = await authenticateUser(credentials);

      return {
        success: true,
        data: authResult.token,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  };
