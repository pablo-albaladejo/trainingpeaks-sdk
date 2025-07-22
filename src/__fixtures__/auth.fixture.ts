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

import type { AuthToken, Credentials, User } from '@/domain';
import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';

/**
 * UserPreferences Builder
 * Creates user preference objects with realistic defaults
 */
export const userPreferencesBuilder = new Factory()
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
      expiresAt: token.expiresAt.getTime(),
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
export const validAuthTokenBuilder = new Factory()
  .extend(authTokenBuilder)
  .option('expiresInMinutes', 60)
  .option('includeRefreshToken', true)
  .option('tokenType', 'Bearer');

/**
 * Expired AuthToken Builder
 * Creates expired auth tokens for testing expiration scenarios
 */
export const expiredAuthTokenBuilder = new Factory()
  .extend(authTokenBuilder)
  .option('expiresInMinutes', -60) // Expired 1 hour ago
  .option('includeRefreshToken', true)
  .option('tokenType', 'Bearer');

/**
 * Admin User Builder
 * Creates admin users with specific preferences
 */
export const adminUserBuilder = new Factory()
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
export const guestUserBuilder = new Factory()
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
export const validCredentialsBuilder = new Factory()
  .extend(credentialsBuilder)
  .option('username', 'validuser')
  .option('password', 'validpass123')
  .option('passwordLength', 12);

/**
 * Invalid Credentials Builder
 * Creates invalid credentials for testing error scenarios
 */
export const invalidCredentialsBuilder = new Factory()
  .extend(credentialsBuilder)
  .option('username', '')
  .option('password', '')
  .option('passwordLength', 0);
