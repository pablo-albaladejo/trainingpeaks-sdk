/**
 * Login Entrypoint Implementation
 * Handles user authentication using use cases internally
 */

import { authenticateUserService } from '@/adapters/services/authenticate-user';
import { executeLoginUserUseCase } from '@/application/use-cases';
import { createCredentials } from '@/domain';

import { mapLoginSuccessToEntrypoint } from './entrypoint-mappers';
import { LoginEntrypointCommand, LoginEntrypointDependencies, LoginEntrypointResponse } from './types';

const entrypoint = async (
  command: LoginEntrypointCommand,
  deps: LoginEntrypointDependencies
): Promise<LoginEntrypointResponse> => {
  deps.logger.info('Login entrypoint called');
  
  // Create credentials from command
  const credentials = createCredentials(command.username, command.password);
  
  const authenticateUser = authenticateUserService(deps.tpRepository);
  const executeLoginUserUseCaseResult = executeLoginUserUseCase(authenticateUser);

  // Execute login and get session
  const session = await executeLoginUserUseCaseResult(credentials);
  
  // Map session to entrypoint response format
  return mapLoginSuccessToEntrypoint(session.token, session.user);
};

export const loginEntrypoint =
  (dependencies: LoginEntrypointDependencies) =>
  (command: LoginEntrypointCommand) =>
    entrypoint(command, dependencies);
