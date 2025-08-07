/**
 * Workouts API Implementation
 * HTTP API calls for fitness/v6/workouts endpoints
 */

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

  const response = await httpClient.get<GetWorkoutsListApiResponse>(url);

  // Check if the request was successful
  if (!response.success || response.data === null) {
    throw new Error('Failed to fetch workouts list: response data is null');
  }

  // Validate the response using Zod schema
  return GetWorkoutsListApiResponseSchema.parse(response.data);
};
