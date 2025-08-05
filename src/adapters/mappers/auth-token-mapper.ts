/**
 * AuthToken API Mappers
 * Maps between TrainingPeaks API token responses and domain AuthToken entities
 */

import type { TokenEndpointResponse } from '@/adapters/public-api/endpoints/users/v3/token';
import { type AuthToken, createAuthToken } from '@/domain';

/**
 * Maps TrainingPeaks API token response to domain AuthToken entity
 */
export const mapTPTokenToAuthToken = (
  tpToken: TokenEndpointResponse['token']
): AuthToken => {
  return createAuthToken(
    tpToken.access_token,
    tpToken.token_type,
    tpToken.expires_in,
    new Date(tpToken.expires),
    tpToken.refresh_token || undefined
  );
};

/**
 * Safe mapper that handles potentially undefined TrainingPeaks token
 */
export const mapTPTokenToAuthTokenSafe = (
  tpToken: TokenEndpointResponse['token'] | undefined | null
): AuthToken | null => {
  if (!tpToken) {
    return null;
  }
  return mapTPTokenToAuthToken(tpToken);
};
