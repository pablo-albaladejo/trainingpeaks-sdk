/**
 * Token Endpoint API
 * HTTP client functions for token-related operations
 */

import type { HttpClient } from '@/adapters/http';
import type { HttpResponse } from '@/application';

import { API_ENDPOINTS } from '../../../../constants/api-urls';
import { TRAININGPEAKS_API_HEADERS } from '../shared/constants';
import type {
  RefreshTokenRequest,
  TrainingPeaksTokenResponse,
} from './token.types';

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
    },
    cookies: [cookies], // Convert string to array
  });
};

/**
 * POST /users/v3/token/refresh - Refresh authentication token
 */
export const refreshAuthToken = async (
  httpClient: HttpClient,
  refreshTokenRequest: RefreshTokenRequest
): Promise<HttpResponse<TrainingPeaksTokenResponse>> => {
  return await httpClient.post<TrainingPeaksTokenResponse>(
    API_ENDPOINTS.TOKEN_REFRESH,
    refreshTokenRequest,
    {
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
        ...TRAININGPEAKS_API_HEADERS,
      },
    }
  );
};
