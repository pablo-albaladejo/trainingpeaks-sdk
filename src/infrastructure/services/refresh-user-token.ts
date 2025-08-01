import type { UserRepository } from '@/application/repositories';
import type { RefreshUserToken } from '@/application/services';
import { getSDKConfig } from '@/config';
import type { AuthToken } from '@/domain';
import { createAuthToken } from '@/domain/entities/auth-token';

/**
 * Refresh authentication token
 */
export const refreshUserToken =
  (userRepository: UserRepository): RefreshUserToken =>
  async (refreshToken: string): Promise<AuthToken> => {
    const sdkConfig = getSDKConfig();

    // Get raw data from repository
    const rawToken = await userRepository.refreshToken(refreshToken);

    // Create domain object with business logic
    const authToken = createAuthToken(
      rawToken.accessToken,
      rawToken.tokenType,
      new Date(Date.now() + sdkConfig.tokens.defaultExpiration),
      rawToken.refreshToken
    );

    return authToken;
  };
