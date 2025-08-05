import { Logger } from '@/adapters';
import { TrainingPeaksRepository } from '@/application';

/**
 * Logout Entrypoint Dependencies
 */
export type LogoutEntrypointDependencies = {
  tpRepository: TrainingPeaksRepository;
  logger: Logger;
};

/**
 * Logout Entrypoint Response
 */
export type LogoutEntrypointResponse = {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
};
