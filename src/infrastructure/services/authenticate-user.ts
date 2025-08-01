import type { UserRepository } from '@/application/repositories';
import type { AuthenticateUser } from '@/application/services';
import { getSDKConfig } from '@/config';
import { createUser } from '@/domain/entities/user';
import type { AuthToken, Credentials, User } from '@/domain/schemas';
import { createAuthToken } from '@/domain/entities/auth-token';

/**
 * Authenticate user with credentials and return token and user data
 */
export const authenticateUser =
  (userRepository: UserRepository): AuthenticateUser =>
  async (
    credentials: Credentials
  ): Promise<{ token: AuthToken; user: User }> => {
    const sdkConfig = getSDKConfig();

    // Get raw data from repository
    const rawData = await userRepository.authenticate(credentials);

    // Create domain objects with business logic
    const authToken = createAuthToken(
      rawData.token.accessToken,
      rawData.token.tokenType,
      new Date(Date.now() + sdkConfig.tokens.defaultExpiration),
      rawData.token.refreshToken
    );

    const user = createUser(
      String(rawData.user.id),
      rawData.user.name,
      rawData.user.avatar,
      rawData.user.preferences
    );

    return { token: authToken, user };
  };
