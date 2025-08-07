/**
 * Logout Entrypoint Implementation
 * Handles user logout and token cleanup
 */

import { Logger } from '@/adapters';
import { TrainingPeaksRepository } from '@/application';

/**
 * Logout command containing user session information
 */
export type LogoutCommand = {
  userId?: string;
  sessionId?: string;
  force?: boolean;
};

/**
 * Logout result - returns void on success or throws error
 */
export type LogoutResult = void;

/**
 * Dependencies required for logout entrypoint
 */
export type LogoutEntrypointDependencies = {
  tpRepository: TrainingPeaksRepository;
  logger: Logger;
};

/**
 * Logout entrypoint function that handles user logout
 */
const entrypoint = (dependencies: LogoutEntrypointDependencies) => {
  const { tpRepository, logger } = dependencies;

  return async (command: LogoutCommand = {}): Promise<LogoutResult> => {
    try {
      logger.info('Starting logout process', {
        userId: command.userId,
        force: command.force,
      });

      // Attempt to logout using the repository
      await tpRepository.logout();

      logger.info('Logout completed successfully', { userId: command.userId });

      // Return void on success
      return;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown logout error';
      logger.error('Logout failed', {
        error: errorMessage,
        userId: command.userId,
      });

      // If force logout is requested, we still consider it successful even if repository logout fails
      if (command.force) {
        logger.warn(
          'Force logout requested, proceeding despite repository error'
        );
        return; // Return void on force success
      }

      // Throw error instead of returning error object
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  };
};

/**
 * Export the logout entrypoint function
 */
export const logoutEntrypoint = (
  dependencies: LogoutEntrypointDependencies
) => {
  return entrypoint(dependencies);
};
