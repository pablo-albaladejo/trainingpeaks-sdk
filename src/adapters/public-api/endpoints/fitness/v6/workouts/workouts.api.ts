/**
 * Workouts API Implementation
 * HTTP API calls for fitness/v6/workouts endpoints
 */

import { createHttpError } from '@/adapters/errors/http-errors';
import { generateWorkoutListUrl } from '@/adapters/public-api/constants/api-urls';
import type { HttpClient } from '@/application';

import { GetWorkoutsListApiResponseSchema } from './workouts.schemas';
import type {
  GetWorkoutsListApiResponse,
  GetWorkoutsListParams,
} from './workouts.types';

/**
 * Get workouts list for athlete between dates
 */
export const getWorkoutsList = async (
  httpClient: HttpClient,
  params: GetWorkoutsListParams
): Promise<GetWorkoutsListApiResponse> => {
  const { athleteId, startDate, endDate } = params;

  // Generate the complete URL using the configured URL builder
  const url = generateWorkoutListUrl(athleteId, startDate, endDate);

  const response = await httpClient.get(url);

  // Check if the request was successful
  if (!response.success || response.data == null) {
    const errorResponse = {
      status: response.error?.status || 500,
      statusText: response.error?.statusText || 'Internal Server Error',
      data: {
        message:
          'Failed to fetch workouts list: response data is null or undefined',
      },
    };
    throw createHttpError(errorResponse, { url, method: 'GET' });
  }

  // Validate the response using Zod schema
  return GetWorkoutsListApiResponseSchema.parse(response.data);
};
