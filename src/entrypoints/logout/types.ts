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
 * Returns void on success or throws an error
 */
export type LogoutEntrypointResponse = void;
