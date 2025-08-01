/**
 * Auth Test Fixtures
 * Factory pattern fixtures for creating authentication-related test data using rosie and faker
 *
 * This fixture demonstrates:
 * - Dependencies between related attributes (expiresAt and refreshToken)
 * - Reusable builders for common authentication patterns
 * - Proper handling of optional fields and metadata
 * - Consistent token and user structure patterns
 */

import type {
  AuthToken,
  Credentials,
  LoginPageResponse,
  LoginResponse,
  TokenResponse,
  TokenResponseWithoutExpiration,
  TokenResponseWithZeroExpiration,
  User,
  UserApiResponse,
  UserInfoResponse,
  UserPreferences,
  UserStorageData,
} from '@/domain/schemas';
import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';

/**
 * UserPreferences Builder
 * Creates user preference objects with realistic defaults
 */
export const userPreferencesBuilder = new Factory<UserPreferences>()
  .attr('timezone', () => faker.location.timeZone())
  .attr('units', () => faker.helpers.arrayElement(['metric', 'imperial']))
  .attr('language', () => faker.helpers.arrayElement(['en', 'es', 'fr', 'de']))
  .attr('theme', () => faker.helpers.arrayElement(['light', 'dark', 'auto']))
  .attr('notifications', () => faker.datatype.boolean())
  .option('timezone', 'UTC')
  .option('units', 'metric')
  .option('language', 'en')
  .option('theme', 'light')
  .option('notifications', true)
  .after((preferences, options) => {
    return {
      timezone: options.timezone || preferences.timezone,
      units: options.units || preferences.units,
      language: options.language || preferences.language,
      theme: options.theme || preferences.theme,
      notifications:
        options.notifications !== undefined
          ? options.notifications
          : preferences.notifications,
    };
  });

/**
 * AuthToken Builder
 * Creates AuthToken entities with proper expiration dependencies
 */
export const authTokenBuilder = new Factory<AuthToken>()
  .attr('accessToken', () => faker.string.alphanumeric(32))
  .attr('tokenType', () =>
    faker.helpers.arrayElement(['Bearer', 'JWT', 'OAuth'])
  )
  .attr('expiresAt', () => new Date(Date.now() + 60 * 60 * 1000)) // Default: 1 hour from now
  .attr('refreshToken', () => faker.string.alphanumeric(32))
  .after((token) => {
    return {
      accessToken: token.accessToken,
      tokenType: token.tokenType,
      expiresAt: token.expiresAt,
      refreshToken: token.refreshToken,
    };
  });

/**
 * Helper function to create tokens with specific expiration
 */
export const createAuthToken = (
  options: { expiresInMinutes?: number } = {}
) => {
  const expiresAt = new Date(
    Date.now() + (options.expiresInMinutes || 60) * 60 * 1000
  );
  return authTokenBuilder.build({
    expiresAt,
  });
};

/**
 * User Builder
 * Creates User entities with preference dependencies
 */
export const userBuilder = new Factory<User>()
  .attr('id', () => faker.string.uuid())
  .attr('name', () => faker.person.fullName())
  .attr('avatar', () => faker.image.avatar())
  .attr('preferences', () => userPreferencesBuilder.build())
  .after((user, options) => {
    const preferences = userPreferencesBuilder.build({
      timezone: options.timezone || 'UTC',
      units: options.units || 'metric',
      language: options.language || 'en',
      theme: options.theme || 'light',
      notifications:
        options.notifications !== undefined ? options.notifications : true,
    });

    return {
      id: options.id || user.id,
      name: options.name || user.name,
      avatar: options.avatar || user.avatar,
      preferences,
    };
  });

/**
 * Credentials Builder
 * Creates Credentials value objects with validation patterns
 */
export const credentialsBuilder = new Factory<Credentials>()
  .attr('username', () => faker.internet.userName())
  .attr('password', () => faker.internet.password())
  .option('username', 'testuser')
  .option('password', 'testpass123')
  .option('passwordLength', 12)
  .after((credentials, options) => {
    return {
      username: options.username || credentials.username,
      password:
        options.password ||
        faker.internet.password({ length: options.passwordLength }),
    };
  });

/**
 * Predefined Builders for Common Authentication Scenarios
 * These demonstrate reusable builders for common patterns
 */

/**
 * Valid AuthToken Builder
 * Creates valid, non-expired auth tokens
 */
export const validAuthTokenBuilder = new Factory<AuthToken>()
  .extend(authTokenBuilder)
  .option('expiresInMinutes', 60)
  .option('includeRefreshToken', true)
  .option('tokenType', 'Bearer');

/**
 * Expired AuthToken Builder
 * Creates expired auth tokens for testing expiration scenarios
 */
export const expiredAuthTokenBuilder = new Factory<AuthToken>()
  .extend(authTokenBuilder)
  .option('expiresInMinutes', -60) // Expired 1 hour ago
  .option('includeRefreshToken', true)
  .option('tokenType', 'Bearer');

/**
 * Admin User Builder
 * Creates admin users with specific preferences
 */
export const adminUserBuilder = new Factory<User>()
  .extend(userBuilder)
  .option('name', 'Admin User')
  .option('timezone', 'UTC')
  .option('units', 'metric')
  .option('language', 'en')
  .option('theme', 'dark')
  .option('notifications', true);

/**
 * Guest User Builder
 * Creates guest users with minimal preferences
 */
export const guestUserBuilder = new Factory<User>()
  .extend(userBuilder)
  .option('name', 'Guest User')
  .option('timezone', 'America/New_York')
  .option('units', 'imperial')
  .option('language', 'en')
  .option('theme', 'light')
  .option('notifications', false);

/**
 * Valid Credentials Builder
 * Creates valid credentials for testing
 */
export const validCredentialsBuilder = new Factory<Credentials>()
  .extend(credentialsBuilder)
  .option('username', 'validuser')
  .option('password', 'validpass123')
  .option('passwordLength', 12);

/**
 * Invalid Credentials Builder
 * Creates invalid credentials for testing error scenarios
 */
export const invalidCredentialsBuilder = new Factory<Credentials>()
  .extend(credentialsBuilder)
  .option('username', '')
  .option('password', '')
  .option('passwordLength', 0);

/**
 * HTTP Auth Response Fixtures
 * Fixtures for HTTP authentication responses
 */

/**
 * TokenResponse Builder
 * Creates token response objects for HTTP auth testing
 */
export const tokenResponseBuilder = new Factory<TokenResponse>()
  .attr('status', 200)
  .attr('statusText', 'OK')
  .attr('data', () => ({
    token: {
      access_token: faker.string.alphanumeric(32),
      token_type: faker.helpers.arrayElement(['Bearer', 'JWT', 'OAuth']),
      expires_in: faker.number.int({ min: 3600, max: 86400 }),
      refresh_token: faker.string.alphanumeric(32),
      scope: 'read write',
      expires: faker.date.future().toISOString(),
    },
  }))
  .attr('headers', () => ({}))
  .attr('cookies', () => [])
  .option('tokenType', 'Bearer')
  .option('expiresIn', 3600)
  .option('includeRefreshToken', true)
  .option('includeExpires', true)
  .after((response, options) => {
    const expiresAt = new Date(Date.now() + (options.expiresIn || 3600) * 1000);

    return {
      status: response.status,
      statusText: response.statusText,
      data: {
        token: {
          access_token: response.data.token.access_token,
          token_type: options.tokenType || response.data.token.token_type,
          expires_in:
            options.expiresIn !== undefined
              ? options.expiresIn
              : response.data.token.expires_in,
          refresh_token: options.includeRefreshToken
            ? response.data.token.refresh_token
            : undefined,
          scope: response.data.token.scope,
          expires: options.includeExpires ? expiresAt.toISOString() : undefined,
        },
      },
      headers: response.headers,
      cookies: response.cookies,
    };
  });

/**
 * TokenResponseWithoutExpiration Builder
 * Creates token response objects without expiration for testing edge cases
 */
export const tokenResponseWithoutExpirationBuilder =
  new Factory<TokenResponseWithoutExpiration>()
    .attr('status', 200)
    .attr('statusText', 'OK')
    .attr('data', () => ({
      token: {
        access_token: faker.string.alphanumeric(32),
        token_type: faker.helpers.arrayElement(['Bearer', 'JWT', 'OAuth']),
        refresh_token: faker.string.alphanumeric(32),
        scope: 'read write',
      },
    }))
    .attr('headers', () => ({}))
    .attr('cookies', () => [])
    .option('tokenType', 'Bearer')
    .option('includeRefreshToken', true)
    .after((response, options) => {
      return {
        status: response.status,
        statusText: response.statusText,
        data: {
          token: {
            access_token: response.data.token.access_token,
            token_type: options.tokenType || response.data.token.token_type,
            refresh_token: options.includeRefreshToken
              ? response.data.token.refresh_token
              : undefined,
            scope: response.data.token.scope,
          },
        },
        headers: response.headers,
        cookies: response.cookies,
      };
    });

/**
 * TokenResponseWithZeroExpiration Builder
 * Creates token response objects with expires_in: 0 for testing "never expires" scenario
 */
export const tokenResponseWithZeroExpirationBuilder =
  new Factory<TokenResponseWithZeroExpiration>()
    .attr('status', 200)
    .attr('statusText', 'OK')
    .attr('data', () => ({
      token: {
        access_token: faker.string.alphanumeric(32),
        token_type: faker.helpers.arrayElement(['Bearer', 'JWT', 'OAuth']),
        expires_in: 0,
        refresh_token: faker.string.alphanumeric(32),
        scope: 'read write',
      },
    }))
    .attr('headers', () => ({}))
    .attr('cookies', () => [])
    .option('tokenType', 'Bearer')
    .option('includeRefreshToken', true)
    .after((response, options) => {
      return {
        status: response.status,
        statusText: response.statusText,
        data: {
          token: {
            access_token: response.data.token.access_token,
            token_type: options.tokenType || response.data.token.token_type,
            expires_in: 0,
            refresh_token: options.includeRefreshToken
              ? response.data.token.refresh_token
              : undefined,
            scope: response.data.token.scope,
          },
        },
        headers: response.headers,
        cookies: response.cookies,
      };
    });

/**
 * UserInfoResponse Builder
 * Creates user info response objects for HTTP auth testing
 */
export const userInfoResponseBuilder = new Factory<UserInfoResponse>()
  .attr('status', 200)
  .attr('statusText', 'OK')
  .attr('data', () => ({
    user: {
      userId: faker.string.uuid(),
      username: faker.internet.userName(),
      name: faker.person.fullName(),
      preferences: userPreferencesBuilder.build(),
    },
  }))
  .attr('headers', () => ({}))
  .attr('cookies', () => [])
  .option('userId', undefined)
  .option('username', undefined)
  .option('name', undefined)
  .after((response, options) => {
    return {
      status: response.status,
      statusText: response.statusText,
      data: {
        user: {
          userId: options.userId || response.data.user.userId,
          username: options.username || response.data.user.username,
          name: options.name || response.data.user.name,
          preferences: response.data.user.preferences,
        },
      },
      headers: response.headers,
      cookies: response.cookies,
    };
  });

/**
 * LoginPageResponse Builder
 * Creates login page HTML responses for HTTP auth testing
 */
export const loginPageResponseBuilder = new Factory<LoginPageResponse>()
  .attr('status', 200)
  .attr('statusText', 'OK')
  .attr('data', () => {
    const csrfToken = faker.string.alphanumeric(32);
    return `<html>
      <body>
        <form>
          <input name="__RequestVerificationToken" value="${csrfToken}" />
          <input name="username" />
          <input name="password" type="password" />
        </form>
      </body>
    </html>`;
  })
  .attr('headers', () => ({}))
  .attr('cookies', () => [])
  .option('csrfToken', undefined)
  .after((response, options) => {
    const csrfToken = options.csrfToken || faker.string.alphanumeric(32);
    return {
      status: response.status,
      statusText: response.statusText,
      data: `<html>
        <body>
          <form>
            <input name="__RequestVerificationToken" value="${csrfToken}" />
            <input name="username" />
            <input name="password" type="password" />
          </form>
        </body>
      </html>`,
      headers: response.headers,
      cookies: response.cookies,
    };
  });

/**
 * LoginResponse Builder
 * Creates login response objects for HTTP auth testing
 */
export const loginResponseBuilder = new Factory<LoginResponse>()
  .attr('status', 200)
  .attr('statusText', 'OK')
  .attr('data', () => '')
  .attr('headers', () => ({}))
  .attr('cookies', () => [])
  .option('status', 200)
  .option('cookieName', 'TestAuth')
  .option('sessionToken', undefined)
  .after((response, options) => {
    const sessionToken = options.sessionToken || faker.string.alphanumeric(32);
    const cookieName = options.cookieName || 'TestAuth';
    return {
      status: options.status || response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
      cookies: [`${cookieName}=${sessionToken}`],
    };
  });

/**
 * UserApiResponse Builder
 * Creates UserApiResponse objects for serialization testing
 */
export const userApiResponseBuilder = new Factory<UserApiResponse>()
  .attr('user', () => ({
    userId: faker.string.uuid(),
    username: faker.internet.userName(),
    name: faker.person.fullName(),
    preferences: userPreferencesBuilder.build(),
  }))
  .option('userId', undefined)
  .option('username', undefined)
  .option('name', undefined)
  .option('preferences', undefined)
  .after((response, options) => {
    return {
      user: {
        userId:
          options.userId !== undefined ? options.userId : response.user.userId,
        username:
          options.username !== undefined
            ? options.username
            : response.user.username,
        name: options.name !== undefined ? options.name : response.user.name,
        preferences:
          options.preferences !== undefined
            ? options.preferences
            : response.user.preferences,
      },
    };
  });

/**
 * UserStorageData Builder
 * Creates UserStorageData objects for serialization testing
 */
export const userStorageDataBuilder = new Factory<UserStorageData>()
  .attr('id', () => faker.string.uuid())
  .attr('name', () => faker.person.fullName())
  .attr('avatar', () => faker.image.avatar())
  .attr('preferences', () => userPreferencesBuilder.build())
  .option('id', undefined)
  .option('name', undefined)
  .option('avatar', undefined)
  .option('preferences', undefined)
  .after((data, options) => {
    return {
      id: options.id || data.id,
      name: options.name || data.name,
      avatar: options.avatar || data.avatar,
      preferences: options.preferences || data.preferences,
    };
  });
