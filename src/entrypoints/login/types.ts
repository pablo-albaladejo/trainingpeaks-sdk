import { Logger } from '@/adapters';
import { TrainingPeaksRepository } from '@/application';

/**
 * Login Entrypoint Dependencies
 * Dependencies for login entrypoint
 */
export type LoginEntrypointDependencies = {
  tpRepository: TrainingPeaksRepository;
  logger: Logger;
};

/**
 * Login Entrypoint Command
 * Command object for login entrypoint
 */
export type LoginEntrypointCommand = {
  username: string;
  password: string;
};

/**
 * Login Entrypoint Response
 * Returns the session data directly or throws an error
 */
export type LoginEntrypointResponse = {
  token: {
    accessToken: string;
    tokenType: string;
    expiresAt: string;
    refreshToken?: string;
  };
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
};
