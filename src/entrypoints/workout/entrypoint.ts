/**
 * Workout Entrypoint Implementation
 * Handles workout-related operations
 */

import { createHttpError } from '@/adapters/errors/http-errors';
import { ERROR_CODES, ERROR_MESSAGES } from '@/domain/errors/error-codes';

import type {
  GetWorkoutsListCommand,
  GetWorkoutsListResponse,
  WorkoutEntrypointDependencies,
} from './types';

const getWorkoutsList = async (
  command: GetWorkoutsListCommand,
  deps: WorkoutEntrypointDependencies
): Promise<GetWorkoutsListResponse> => {
  try {
    // If athleteId is not provided, get it from the current user session
    let athleteId = command.athleteId;

    if (!athleteId) {
      deps.logger.info(
        'No athleteId provided, getting from current user session'
      );

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

      athleteId = session.user.id;
      deps.logger.info('Using current user ID as athleteId', { athleteId });
    }

    deps.logger.info('Get workouts list entrypoint called', {
      athleteId,
      startDate: command.startDate,
      endDate: command.endDate,
    });

    const apiResponse = await deps.tpRepository.getWorkoutsList({
      athleteId,
      startDate: command.startDate,
      endDate: command.endDate,
    });

    return apiResponse;
  } catch (error) {
    deps.logger.error('Failed to get workouts list', { error });

    // If it's already an HttpError, re-throw it
    if (error instanceof Error && error.name === 'HttpError') {
      throw error;
    }

    // Create new HttpError for non-HTTP errors
    const httpErrorResponse = {
      status: 500,
      statusText: 'Internal Server Error',
      data: {
        message:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES[ERROR_CODES.WORKOUT_LIST_ERROR],
      },
    };
    throw createHttpError(httpErrorResponse, {
      url: 'workouts',
      method: 'GET',
    });
  }
};

export const getWorkoutsListEntrypoint =
  (dependencies: WorkoutEntrypointDependencies) =>
  (command: GetWorkoutsListCommand): Promise<GetWorkoutsListResponse> =>
    getWorkoutsList(command, dependencies);
