import { serializeApiResponseToUser } from '@/adapters/serialization';
import { getSDKConfig } from '@/config';
import type { AuthToken, Credentials, User } from '@/domain';
import { AuthRepository } from '@/domain/repositories/auth-repository';
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
    authCookieName?: string;
  },
  webHttpClient: WebHttpClient,
  logger: LoggerType
): AuthRepository => {
  return {
    authenticate: async (credentials: Credentials): Promise<AuthToken> => {
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
      const cookieName = httpAuthConfig.authCookieName || 'Production_tpAuth';
      const authCookie = loginResponse.cookies.find((c) =>
        c.startsWith(`${cookieName}=`)
      );
      if (!authCookie)
        throw new Error(`Session cookie '${cookieName}' not found`);

      const sessionToken = authCookie.split('=')[1];
      if (!sessionToken) throw new Error('Session cookie value empty');

      // Step 4: Exchange session cookie for auth token
      const tokenResponse = await webHttpClient.get<TokenResponse>(
        'https://tpapi.trainingpeaks.com/users/v3/token'
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

      if (!tokenData.expires_in && !tokenData.expires) {
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
      return createAuthToken(
        tokenData.access_token,
        tokenData.token_type || 'Bearer',
        expiresAt,
        tokenData.refresh_token
      );
    },

    /**
     * Get user information using the provided auth token
     */
    getUserInfo: async (token: AuthToken): Promise<User> => {
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
      }>('https://tpapi.trainingpeaks.com/users/v3/user', { headers });

      if (response.status !== 200) {
        throw new Error(`Failed to get user info: ${response.statusText}`);
      }

      const user = serializeApiResponseToUser(response.data);

      logger.info('👤 User information retrieved successfully', {
        userId: user.id,
        name: user.name,
      });

      return user;
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

  if (expiresIn) {
    return new Date(Date.now() + expiresIn * 1000);
  }

  // Fallback to default expiration
  return new Date(Date.now() + getSDKConfig().tokens.defaultExpiration);
};
