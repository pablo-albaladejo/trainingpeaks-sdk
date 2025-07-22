import type { AuthToken } from '@/domain/entities/auth-token';
import type { User } from '@/domain/entities/user';
import type { Credentials } from '@/domain/value-objects/credentials';
import {
  createAuthToken,
  createCredentials,
  createUser,
} from '@/infrastructure/services/domain-factories';
import { faker } from '@faker-js/faker';
import { randomNumber } from './utils.fixture';

/**
 * AuthToken Test Fixture
 * Builder pattern fixture for creating AuthToken entities in tests
 */
export class AuthTokenFixture {
  private token: Partial<{
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
    tokenType: string;
  }> = {};

  /**
   * Set access token
   */
  withAccessToken(accessToken: string): this {
    this.token.accessToken = accessToken;
    return this;
  }

  /**
   * Set random access token
   */
  withRandomAccessToken(): this {
    this.token.accessToken = faker.string.alphanumeric(32);
    return this;
  }

  /**
   * Set refresh token
   */
  withRefreshToken(refreshToken: string): this {
    this.token.refreshToken = refreshToken;
    return this;
  }

  /**
   * Set random refresh token
   */
  withRandomRefreshToken(): this {
    this.token.refreshToken = faker.string.alphanumeric(32);
    return this;
  }

  /**
   * Set expires at date
   */
  withExpiresAt(expiresAt: Date): this {
    this.token.expiresAt = expiresAt;
    return this;
  }

  /**
   * Set expiration from seconds (converts to Date)
   */
  withExpiresIn(expiresInSeconds: number): this {
    this.token.expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    return this;
  }

  /**
   * Set random expiration (1-120 minutes from now)
   */
  withRandomExpiresIn(): this {
    const expiresInSeconds = randomNumber(60, 7200); // 1 minute to 2 hours
    this.token.expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    return this;
  }

  /**
   * Set token type
   */
  withTokenType(tokenType: string): this {
    this.token.tokenType = tokenType;
    return this;
  }

  /**
   * Build AuthToken
   */
  build(): AuthToken {
    const expiresAt =
      this.token.expiresAt || new Date(Date.now() + 3600 * 1000); // Default 1 hour

    const authToken = createAuthToken(
      this.token.accessToken || faker.string.alphanumeric(32),
      this.token.tokenType || 'Bearer',
      expiresAt,
      this.token.refreshToken || faker.string.alphanumeric(32)
    );
    return authToken;
  }

  /**
   * Build default AuthToken
   */
  static default(): AuthToken {
    return new AuthTokenFixture().build();
  }

  /**
   * Build random AuthToken
   */
  static random(): AuthToken {
    return new AuthTokenFixture()
      .withRandomAccessToken()
      .withRandomRefreshToken()
      .withRandomExpiresIn()
      .build();
  }
}

/**
 * User Test Fixture
 * Builder pattern fixture for creating User entities in tests
 */
export class UserFixture {
  private user: Partial<{
    id: string;
    name: string;
    avatar: string;
    preferences: Record<string, unknown>;
  }> = {};

  /**
   * Set user ID
   */
  withId(id: string): this {
    this.user.id = id;
    return this;
  }

  /**
   * Set random user ID
   */
  withRandomId(): this {
    this.user.id = faker.string.uuid();
    return this;
  }

  /**
   * Set user name
   */
  withName(name: string): this {
    this.user.name = name;
    return this;
  }

  /**
   * Set random user name
   */
  withRandomName(): this {
    this.user.name = faker.person.fullName();
    return this;
  }

  /**
   * Set user avatar
   */
  withAvatar(avatar: string): this {
    this.user.avatar = avatar;
    return this;
  }

  /**
   * Set random user avatar
   */
  withRandomAvatar(): this {
    this.user.avatar = faker.image.avatar();
    return this;
  }

  /**
   * Set user preferences
   */
  withPreferences(preferences: Record<string, unknown>): this {
    this.user.preferences = preferences;
    return this;
  }

  /**
   * Set random user preferences
   */
  withRandomPreferences(): this {
    this.user.preferences = {
      timezone: faker.location.timeZone(),
      units: faker.helpers.arrayElement(['metric', 'imperial']),
      language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de']),
    };
    return this;
  }

  /**
   * Build User
   */
  build(): User {
    return createUser(
      this.user.id || faker.string.uuid(),
      this.user.name || faker.person.fullName(),
      this.user.avatar || faker.image.avatar(),
      this.user.preferences || { theme: 'dark', units: 'metric' }
    );
  }

  /**
   * Build default User
   */
  static default(): User {
    return new UserFixture().build();
  }

  /**
   * Build random User
   */
  static random(): User {
    return new UserFixture()
      .withRandomId()
      .withRandomName()
      .withRandomAvatar()
      .withRandomPreferences()
      .build();
  }
}

/**
 * Credentials Test Fixture
 * Builder pattern fixture for creating Credentials value objects in tests
 */
export class CredentialsFixture {
  private credentials: Partial<{
    username: string;
    password: string;
  }> = {};

  /**
   * Set username
   */
  withUsername(username: string): this {
    this.credentials.username = username;
    return this;
  }

  /**
   * Set random username
   */
  withRandomUsername(): this {
    this.credentials.username = faker.internet.userName();
    return this;
  }

  /**
   * Set password
   */
  withPassword(password: string): this {
    this.credentials.password = password;
    return this;
  }

  /**
   * Set random password
   */
  withRandomPassword(): this {
    this.credentials.password = faker.internet.password();
    return this;
  }

  /**
   * Build Credentials
   */
  build(): Credentials {
    return createCredentials(
      this.credentials.username || faker.internet.userName(),
      this.credentials.password || faker.internet.password()
    );
  }

  /**
   * Build default Credentials
   */
  static default(): Credentials {
    return new CredentialsFixture().build();
  }

  /**
   * Build random Credentials
   */
  static random(): Credentials {
    return new CredentialsFixture()
      .withRandomUsername()
      .withRandomPassword()
      .build();
  }
}

// Export builders
export const authTokenBuilder = new AuthTokenFixture();
export const userBuilder = new UserFixture();
export const credentialsBuilder = new CredentialsFixture();
