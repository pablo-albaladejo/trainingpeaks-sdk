/**
 * Login Use Case
 * Handles user authentication workflow
 */

import { Credentials } from '@/domain';
import type { Session } from '@/application/ports/session-storage';

import { AuthenticateUser } from '../services';

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
  async (
    credentials: Credentials
  ): Promise<Session> => {
    return await authenticateUser(credentials);
  };
