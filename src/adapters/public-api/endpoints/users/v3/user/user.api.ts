/**
 * User Endpoint API
 * HTTP client functions for user-related operations
 */

import type { HttpClient } from '@/adapters/http';
import type { HttpResponse } from '@/application';
import type { AuthToken } from '@/domain';

import { API_ENDPOINTS } from '../../../../constants/api-urls';
import { TRAININGPEAKS_API_HEADERS } from '../shared/constants';
import type { TrainingPeaksUserResponse } from './user.types';

/**
 * GET /users/v3/user - Get user profile
 */
export const getUser = async (
  httpClient: HttpClient,
  authToken: AuthToken
): Promise<HttpResponse<TrainingPeaksUserResponse>> => {
  return await httpClient.get<TrainingPeaksUserResponse>(
    API_ENDPOINTS.USER_PROFILE,
    {
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        authorization: `Bearer ${authToken.accessToken}`,
        'content-type': 'application/json',
        ...TRAININGPEAKS_API_HEADERS,
        'accept-language': 'en-GB,en;q=0.9,es-ES;q=0.8,es;q=0.7,en-US;q=0.6', // Override the default
      },
    }
  );
};
