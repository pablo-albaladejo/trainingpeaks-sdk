/**
 * Login Handler Mappers
 */

import type { AuthToken } from '@/domain/entities/auth-token';

import type { LoginEntrypointResponse } from './types';

export const createLoginErrorResponse = (
  error: string,
  code?: string
): LoginEntrypointResponse => ({
  success: false,
  error: {
    code: code || 'AUTH_LOGIN_FAILED',
    message: error,
  },
});

export const mapLoginResultToPublicDto = (result: {
  success: boolean;
  token: AuthToken;
  user: {
    userId: string | number;
    name: string;
    username: string;
    avatar?: string;
  };
}): LoginEntrypointResponse => ({
  success: true,
  data: {
    token: {
      accessToken: result.token.accessToken,
      tokenType: result.token.tokenType,
      expiresAt: result.token.expires.toISOString(),
      refreshToken: result.token.refreshToken,
    },
    user: {
      id: result.user.userId.toString(),
      name: result.user.name,
      username: result.user.username,
      avatar: result.user.avatar,
    },
  },
});
