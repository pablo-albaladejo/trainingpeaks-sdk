/**
 * Login Use Case
 * Handles user authentication workflow
 */

import { AuthToken, Credentials, User } from '@/domain';

import { AuthenticateUser } from '../services';

export type ExecuteLoginUserUseCase = (
  authenticateUser: AuthenticateUser
) => ExecuteLoginUserUseCaseResult;

export type ExecuteLoginUserUseCaseResult = (
  credentials: Credentials
) => Promise<{ token: AuthToken; user: User }>;

/**
 * Login use case implementation
 * Pure orchestration using contracts only
 */
export const executeLoginUserUseCase: ExecuteLoginUserUseCase =
  (authenticateUser: AuthenticateUser) =>
  async (
    credentials: Credentials
  ): Promise<{ token: AuthToken; user: User }> => {
    return await authenticateUser(credentials);
  };
