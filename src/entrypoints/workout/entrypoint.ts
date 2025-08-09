/**
 * Workout Entrypoint Implementation
 * Handles workout-related operations
 */

import { createHttpError, isHttpError } from '@/adapters/errors/http-errors';
import { ERROR_CODES, ERROR_MESSAGES } from '@/domain/errors/error-codes';
import { getAthleteIdFromSession } from '@/shared';

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
    const athleteId =
      command.athleteId ||
      (await getAthleteIdFromSession({
        sessionStorage: deps.sessionStorage,
        logger: deps.logger,
      }));

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
    if (isHttpError(error)) {
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
