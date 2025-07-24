/**
 * Login Use Case
 * Handles user authentication workflow
 */

import { AuthToken, Credentials } from '@/domain';
import { LoginUser } from '../services/login-user';

export type ExecuteLoginUserUseCase = (
  loginUser: LoginUser
) => (credentials: Credentials) => Promise<ExecuteLoginUserUseCaseResult>;

export type ExecuteLoginUserUseCaseResult = {
  success: boolean;
  authToken?: AuthToken;
  error?: string;
};

/**
 * Login use case implementation
 * Pure orchestration using contracts only
 */
export const executeLoginUserUseCase: ExecuteLoginUserUseCase =
  (loginUser: LoginUser) =>
  async (credentials: Credentials): Promise<ExecuteLoginUserUseCaseResult> => {
    try {
      // Authenticate user using login service
      const authResult = await loginUser(credentials);

      if (!authResult) {
        return {
          success: false,
          error: 'Failed to login user',
        };
      }

      return {
        success: true,
        authToken: authResult,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  };
