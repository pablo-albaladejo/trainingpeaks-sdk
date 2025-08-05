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
 * Logout result indicating success or failure
 */
export type LogoutResult = {
  success: boolean;
  message: string;
  userId?: string;
  sessionCleared: boolean;
};

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

      return {
        success: true,
        message: 'Logout completed successfully',
        userId: command.userId,
        sessionCleared: true,
      };
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
        return {
          success: true,
          message: 'Force logout completed (repository error ignored)',
          userId: command.userId,
          sessionCleared: true,
        };
      }

      return {
        success: false,
        message: `Logout failed: ${errorMessage}`,
        userId: command.userId,
        sessionCleared: false,
      };
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
