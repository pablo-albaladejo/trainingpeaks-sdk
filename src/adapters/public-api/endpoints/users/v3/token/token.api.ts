/**
 * Token Endpoint API
 * HTTP client functions for token-related operations
 */

import type { HttpClient } from '@/adapters/http';
import type { HttpResponse } from '@/application';

import { API_ENDPOINTS } from '../../../../constants/api-urls';
import { TRAININGPEAKS_API_HEADERS } from '../shared/constants';
import type { TrainingPeaksTokenResponse } from './token.types';

/**
 * GET /users/v3/token - Get authentication token
 */
export const getAuthToken = async (
  httpClient: HttpClient,
  cookies: string
): Promise<HttpResponse<TrainingPeaksTokenResponse>> => {
  return await httpClient.get<TrainingPeaksTokenResponse>(API_ENDPOINTS.TOKEN, {
    headers: {
      accept: '*/*',
      ...TRAININGPEAKS_API_HEADERS,
      Cookie: cookies,
    },
  });
};
