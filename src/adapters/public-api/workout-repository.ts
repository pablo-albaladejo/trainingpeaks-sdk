/**
 * Workout Repository Implementation
 * Concrete implementation of workout data access operations
 */

import { Logger } from '@/adapters';
import {
  type ErrorRequestContext,
  handleRepositoryError,
} from '@/adapters/errors/http-errors';
import { type HttpClient } from '@/adapters/http';
import {
  type GetWorkoutsListParams,
  type WorkoutListItem,
  WorkoutRepository,
  WorkoutRepositoryGetWorkoutsList,
} from '@/domain';

import { generateWorkoutListUrl } from './constants/api-urls';
import { getWorkoutsList } from './endpoints';


type WorkoutRepositoryDependencies = {
  httpClient: HttpClient;
  logger: Logger;
};

const createGetWorkoutsList = (
  deps: WorkoutRepositoryDependencies
): WorkoutRepositoryGetWorkoutsList => {
  return async (
    params: GetWorkoutsListParams
  ): Promise<readonly WorkoutListItem[]> => {
    try {
      deps.logger.info('Getting workouts list', { params });


      // Call the API endpoint
      const apiResponse = await getWorkoutsList(deps.httpClient, {
        athleteId: params.athleteId,
        startDate: params.startDate,
        endDate: params.endDate,
      });

      deps.logger.info('Workouts list retrieved successfully', {
        count: apiResponse.length,
      });

      return apiResponse;
    } catch (error) {
      const errorContext: ErrorRequestContext = {
        url: generateWorkoutListUrl(
          params.athleteId,
          params.startDate,
          params.endDate
        ),
        method: 'GET',
      };

      handleRepositoryError(error, 'get workouts list', errorContext, deps.logger, params);
    }
  };
};

export const createWorkoutRepository = (
  deps: WorkoutRepositoryDependencies
): WorkoutRepository => {
  return {
    getWorkoutsList: createGetWorkoutsList(deps),
  };
};
