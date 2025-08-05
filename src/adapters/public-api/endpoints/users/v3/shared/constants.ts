/**
 * Shared constants for TrainingPeaks Users API v3
 */

import { API_BASE_URLS, API_ORIGINS } from '../../../../constants/api-urls';

// Shared API base URL for all users/v3 endpoints
export const USERS_V3_API_BASE_URL = API_BASE_URLS.USERS;

// Shared headers for TrainingPeaks API calls
export const TRAININGPEAKS_API_HEADERS = {
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'accept-language': 'en-US,en;q=0.9',
  origin: API_ORIGINS.APP,
  priority: 'u=1, i',
  referer: API_ORIGINS.APP_WITH_SLASH,
} as const;
