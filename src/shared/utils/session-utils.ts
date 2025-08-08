/**
 * Session utilities for common session management operations
 */

import type { Logger } from '@/adapters';
import { createHttpError } from '@/adapters/errors/http-errors';
import type { SessionStorage } from '@/application';
import { ERROR_CODES, ERROR_MESSAGES } from '@/domain/errors/error-codes';

export type SessionDependencies = {
  sessionStorage: SessionStorage;
  logger: Logger;
};

/**
 * Retrieves athleteId from the current user session
 * @param deps - SessionDependencies containing sessionStorage and logger
 * @returns Promise<string> - The athleteId from the session
 * @throws HttpError if no active session exists
 */
export const getAthleteIdFromSession = async (
  deps: SessionDependencies
): Promise<string> => {
  deps.logger.info('No athleteId provided, getting from current user session');

  const session = await deps.sessionStorage.get();
  if (!session) {
    const httpErrorResponse = {
      status: 401,
      statusText: 'Unauthorized',
      data: { message: ERROR_MESSAGES[ERROR_CODES.AUTH_NO_ACTIVE_SESSION] },
    };
    throw createHttpError(httpErrorResponse, {
      url: 'session',
      method: 'GET',
    });
  }

  const athleteId = session.user.id;
  deps.logger.info('Using current user ID as athleteId', { athleteId });
  return athleteId;
};
