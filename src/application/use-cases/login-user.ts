/**
 * Login Use Case
 * Handles user authentication workflow
 */

import type { AuthenticateUser } from '@/application/services';
import type { Credentials, Session } from '@/domain';

export type ExecuteLoginUserUseCase = (
  authenticateUser: AuthenticateUser
) => ExecuteLoginUserUseCaseResult;

export type ExecuteLoginUserUseCaseResult = (
  credentials: Credentials
) => Promise<Session>;

/**
 * Login use case implementation
 * Pure orchestration using contracts only
 */
export const executeLoginUserUseCase: ExecuteLoginUserUseCase =
  (authenticateUser: AuthenticateUser) =>
  async (credentials: Credentials): Promise<Session> => {
    return await authenticateUser(credentials);
  };
