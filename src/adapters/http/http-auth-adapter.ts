/**
 * HTTP Auth Adapter
 * Implements UserRepository interface using HTTP requests
 * This adapter handles web-based authentication for TrainingPeaks
 */

import { AUTH_CONSTANTS } from '@/adapters/constants';
import type { WebHttpClient } from '@/adapters/http/web-http-client';
import type { LoggerType } from '@/adapters/logging/logger';
import type { UserRepository } from '@/application/repositories';
import { getSDKConfig } from '@/config';
import { createUser } from '@/domain/entities/user';
import type {
  AuthToken,
  Credentials,
  User,
  UserPreferences,
} from '@/domain/schemas';
import { createAuthToken } from '@/domain/value-objects/auth-token';

type LoginFormData = {
  username: string;
  password: string;
  __RequestVerificationToken?: string;
};

type TokenResponse = {
  token?: {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
    expires: string;
  };
};

export const createHttpAuthAdapter = (
  httpAuthConfig: {
    loginUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    authCookieName?: string;
  },
  webHttpClient: WebHttpClient,
  logger: LoggerType
): UserRepository => {
  const getUserInfo = async (token: AuthToken): Promise<User> => {
    logger.info('👤 Getting user info via HTTP auth');

    try {
      const response = await webHttpClient.get(httpAuthConfig.userInfoUrl, {
        headers: {
          Authorization: `${token.tokenType} ${token.accessToken}`,
        },
      });

      if (response.status !== 200) {
        throw new Error(`Failed to get user info: ${response.statusText}`);
      }

      // Parse user data from response
      const userData = response.data as Record<string, unknown>;
      const user = createUser(
        String(userData.userId || userData.id || ''),
        String(userData.name || userData.username || ''),
        userData.avatar as string | undefined,
        userData.preferences as Record<string, unknown> | undefined
      );

      logger.info('👤 User info retrieved successfully');
      return user;
    } catch (error) {
      logger.error('❌ Failed to get user info', { error });
      throw error;
    }
  };

  return {
    /**
     * Authenticate user with credentials
     */
    authenticate: async (
      credentials: Credentials
    ): Promise<{ token: AuthToken; user: User }> => {
      logger.info('🔐 Authenticating user via HTTP auth', {
        username: credentials.username,
      });

      try {
        // Step 1: Get login page to extract CSRF token
        const loginPageResponse = await webHttpClient.get(
          httpAuthConfig.loginUrl
        );
        const csrfToken = extractCsrfToken(String(loginPageResponse.data));

        if (!csrfToken) {
          throw new Error('Failed to extract CSRF token from login page');
        }

        // Step 2: Submit login form
        const loginData: LoginFormData = {
          username: credentials.username,
          password: credentials.password,
          __RequestVerificationToken: csrfToken || '',
        };

        const loginResponse = await webHttpClient.post(
          httpAuthConfig.loginUrl,
          loginData,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        // Check for login errors
        if (loginResponse.status !== 200) {
          const errorMessage = extractErrorMessage(String(loginResponse.data));
          throw new Error(
            errorMessage || `Login failed with status: ${loginResponse.status}`
          );
        }

        // Step 3: Get token from token endpoint
        const tokenResponse = await webHttpClient.get<TokenResponse>(
          httpAuthConfig.tokenUrl
        );

        if (tokenResponse.status !== 200) {
          throw new Error(`Failed to get token: ${tokenResponse.statusText}`);
        }

        const tokenData = tokenResponse.data.token;
        if (!tokenData) {
          throw new Error('No token data received from server');
        }

        // Validate required token fields
        if (!tokenData.access_token) {
          throw new Error('No access token received');
        }

        if (!tokenData.token_type) {
          throw new Error('No token type received');
        }

        if (
          (tokenData.expires_in === undefined ||
            tokenData.expires_in === null) &&
          !tokenData.expires
        ) {
          throw new Error('No expiration information received');
        }

        // Parse token expiration
        const expiresAt = parseTokenExpiration(
          tokenData.expires,
          tokenData.expires_in
        );

        // Create auth token
        const token = createAuthToken(
          tokenData.access_token,
          tokenData.token_type || AUTH_CONSTANTS.DEFAULT_TOKEN_TYPE,
          expiresAt,
          tokenData.refresh_token
        );

        // Fetch real user information using the auth token
        const user = await getUserInfo(token);

        return { token, user };
      } catch (error) {
        logger.error('❌ Authentication failed', { error });
        throw error;
      }
    },

    /**
     * Get user information using the provided auth token
     */
    getUserInfo,

    /**
     * Refresh authentication token
     */
    refreshToken: async (refreshToken: string): Promise<AuthToken> => {
      logger.info('🔄 Refreshing token via HTTP auth');

      // This would need to be implemented based on the actual API
      // For now, we'll throw an error indicating it's not implemented
      throw new Error('Token refresh not implemented in HTTP auth adapter');
    },

    /**
     * Update user preferences
     */
    updatePreferences: async (
      token: AuthToken,
      preferences: UserPreferences
    ): Promise<void> => {
      logger.info('⚙️ Updating user preferences via HTTP auth');

      // This would need to be implemented based on the actual API
      // For now, we'll throw an error indicating it's not implemented
      throw new Error(
        'Update preferences not implemented in HTTP auth adapter'
      );
    },

    /**
     * Get user settings
     */
    getUserSettings: async (token: AuthToken): Promise<UserPreferences> => {
      logger.info('⚙️ Getting user settings via HTTP auth');

      // This would need to be implemented based on the actual API
      // For now, we'll return default preferences
      return {
        timezone: 'UTC',
        units: 'metric',
        language: 'en',
        theme: 'light',
        notifications: true,
      };
    },
  };
};

const extractCsrfToken = (html: string): string | null => {
  const match = html.match(
    /name="__RequestVerificationToken"[^>]*value="([^"]*)"/
  );
  return match ? (match[1] ?? '') : '';
};

const extractErrorMessage = (html: string): string | null => {
  const errorPatterns = [
    /<div[^>]*class="[^"]*error[^"]*"[^>]*>([^<]+)<\/div>/i,
    /<span[^>]*class="[^"]*error[^"]*"[^>]*>([^<]+)<\/span>/i,
  ];
  for (const pattern of errorPatterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
};

/**
 * Parse token expiration time from API response
 */
const parseTokenExpiration = (expires?: string, expiresIn?: number): Date => {
  if (expires) {
    const parsedDate = new Date(expires);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  if (expiresIn !== undefined && expiresIn !== null) {
    // If expiresIn is 0, the token never expires - set to a far future date
    if (expiresIn === 0) {
      return new Date('2099-12-31T23:59:59Z');
    }
    return new Date(Date.now() + expiresIn * 1000);
  }

  // Fallback to default expiration
  return new Date(Date.now() + getSDKConfig().tokens.defaultExpiration);
};
