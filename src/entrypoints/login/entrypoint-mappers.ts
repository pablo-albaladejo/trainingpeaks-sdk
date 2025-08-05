/**
 * Login Entrypoint Mappers
 * Transform Domain entities to Entrypoint response types
 */

import type { AuthToken, User } from '@/domain';

import type { LoginEntrypointResponse } from './types';

/**
 * Map successful login to entrypoint response
 */
export const mapLoginSuccessToEntrypoint = (
  domainToken: AuthToken,
  domainUser: User
): LoginEntrypointResponse => {
  return {
    success: true,
    data: {
      token: {
        accessToken: domainToken.accessToken,
        tokenType: domainToken.tokenType,
        expiresAt: domainToken.expires.toISOString(),
        refreshToken: domainToken.refreshToken,
      },
      user: {
        id: domainUser.id,
        name: domainUser.name,
        username: domainUser.name, // Use name as username for now
        avatar: domainUser.avatar,
      },
    },
  };
};

/**
 * Map error to entrypoint response
 */
export const mapLoginErrorToEntrypoint = (
  error: Error,
  code = 'AUTH_FAILED'
): LoginEntrypointResponse => {
  return {
    success: false,
    error: {
      code,
      message: error.message,
    },
  };
};
