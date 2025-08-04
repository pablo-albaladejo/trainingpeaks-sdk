/**
 * Login Entrypoint Implementation
 * Handles user authentication using use cases internally
 */

import { authenticateUserService } from '@/adapters/services/authenticate-user';
import { executeLoginUserUseCase } from '@/application/use-cases';

import { LoginEntrypointCommand, LoginEntrypointDependencies } from './types';

const entrypoint = async (
  command: LoginEntrypointCommand,
  deps: LoginEntrypointDependencies
) => {
  deps.logger.info('Login entrypoint called');
  const authenticateUser = authenticateUserService(deps.tpRepository);

  const executeLoginUserUseCaseResult =
    executeLoginUserUseCase(authenticateUser);

  return await executeLoginUserUseCaseResult(command);
};

export const loginEntrypoint =
  (dependencies: LoginEntrypointDependencies) =>
  (command: LoginEntrypointCommand) =>
    entrypoint(command, dependencies);
