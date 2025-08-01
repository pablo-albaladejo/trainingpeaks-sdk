import { AUTH_CONSTANTS, HTTP_STATUS } from '@/adapters/constants';
import { serializeApiResponseToUser } from '@/adapters/serialization';
import type { UserRepository } from '@/application/repositories';
import { getSDKConfig } from '@/config';
import type { AuthToken, Credentials, User } from '@/domain';
import { createAuthToken } from '@/domain/value-objects/auth-token';
import type { LoggerType } from '../logging/logger';
import type { WebHttpClient } from './web-http-client';

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
    logger.info('👤 Getting user information via HTTP auth');

    const headers = {
      Authorization: `${token.tokenType} ${token.accessToken}`,
    };

    const response = await webHttpClient.get<{
      user: {
        userId: string | number;
        username: string;
        name: string;
        preferences?: Record<string, unknown>;
      };
    }>(httpAuthConfig.userInfoUrl, { headers });

    if (response.status !== HTTP_STATUS.OK) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    const user = serializeApiResponseToUser(response.data);

    logger.info('👤 User information retrieved successfully', {
      userId: user.id,
      name: user.name,
    });

    return user;
  };

  return {
    authenticate: async (
      credentials: Credentials
    ): Promise<{ token: AuthToken; user: User }> => {
      logger.info('🔐 Starting HTTP authentication', {
        username: credentials.username,
      });

      // Step 1: Fetch login page to extract CSRF token
      const loginPage = await webHttpClient.get<string>(
        httpAuthConfig.loginUrl
      );
      const csrfToken = extractCsrfToken(loginPage.data);
      if (!csrfToken) throw new Error('No CSRF token found in login page');

      // Step 2: Send login form
      webHttpClient.setCookie('__RequestVerificationToken', csrfToken);
      const loginForm: LoginFormData = {
        username: credentials.username,
        password: credentials.password,
        __RequestVerificationToken: csrfToken,
      };

      const loginResponse = await webHttpClient.post<string>(
        httpAuthConfig.loginUrl,
        new URLSearchParams(loginForm),
        {
          followRedirects: false,
          headers: {
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            Connection: 'keep-alive',
          },
        }
      );

      if (loginResponse.status >= 400) {
        const error = extractErrorMessage(loginResponse.data);
        throw new Error(
          `Login failed: ${error || 'Status ' + loginResponse.status}`
        );
      }

      // Step 3: Extract session cookie
      const cookieName =
        httpAuthConfig.authCookieName || AUTH_CONSTANTS.DEFAULT_AUTH_COOKIE;
      const authCookie = loginResponse.cookies.find((c) =>
        c.startsWith(`${cookieName}=`)
      );
      if (!authCookie)
        throw new Error(`Session cookie '${cookieName}' not found`);

      const sessionToken = authCookie.split('=')[1];
      if (!sessionToken) throw new Error('Session cookie value empty');

      // Step 4: Exchange session cookie for auth token
      const tokenResponse = await webHttpClient.get<TokenResponse>(
        httpAuthConfig.tokenUrl
      );

      if (!tokenResponse.data?.token) {
        throw new Error('No token received from API');
      }

      const tokenData = tokenResponse.data.token;

      // Validate required token fields
      if (!tokenData.access_token) {
        throw new Error('No access token received');
      }

      if (!tokenData.token_type) {
        throw new Error('No token type received');
      }

      if (
        (tokenData.expires_in === undefined || tokenData.expires_in === null) &&
        !tokenData.expires
      ) {
        throw new Error('No expiration information received');
      }

      // Use the actual expiration time from the API response
      const expiresAt = parseTokenExpiration(
        tokenData.expires,
        tokenData.expires_in
      );

      logger.info('🔐 Token received successfully', {
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        expiresAt: expiresAt.toISOString(),
        hasRefreshToken: !!tokenData.refresh_token,
        scope: tokenData.scope,
      });

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
      preferences: Record<string, unknown>
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
    getUserSettings: async (
      token: AuthToken
    ): Promise<Record<string, unknown>> => {
      logger.info('⚙️ Getting user settings via HTTP auth');

      // This would need to be implemented based on the actual API
      // For now, we'll return an empty object
      return {};
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
