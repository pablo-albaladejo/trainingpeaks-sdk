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
 * Response object for login entrypoint
 */
export type LoginEntrypointResponse = {
  success: boolean;
  data?: {
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
  error?: {
    code: string;
    message: string;
  };
};
