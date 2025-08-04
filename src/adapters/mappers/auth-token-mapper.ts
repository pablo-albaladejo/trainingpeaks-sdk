/**
 * AuthToken Mappers
 * Maps between TrainingPeaks API token responses and domain AuthToken entities
 */

import type { AuthToken } from '@/domain';
import type { TrainingPeaksTokenResponse } from '@/adapters/schemas/http-responses.schema';

/**
 * Maps TrainingPeaks API token response to domain AuthToken entity
 */
export const mapTPTokenToAuthToken = (
  tpToken: TrainingPeaksTokenResponse['token']
): AuthToken => {
  return {
    accessToken: tpToken.access_token,
    tokenType: tpToken.token_type,
    expiresIn: tpToken.expires_in,
    expires: new Date(tpToken.expires),
    refreshToken: tpToken.refresh_token || undefined,
    scope: tpToken.scope || undefined,
  };
};

/**
 * Safe mapper that handles potentially undefined TrainingPeaks token
 */
export const mapTPTokenToAuthTokenSafe = (
  tpToken: TrainingPeaksTokenResponse['token'] | undefined | null
): AuthToken | null => {
  if (!tpToken) {
    return null;
  }
  return mapTPTokenToAuthToken(tpToken);
};