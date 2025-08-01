/**
 * Credentials Fixture Builder
 * Provides test data for authentication scenarios
 */

import type { Credentials } from '@/domain/schemas';
import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';

// Simple credentials using Faker
export const createValidCredentials = () => ({
  username: faker.internet.userName(),
  password: faker.internet.password({ length: 12 }),
});

export const createInvalidCredentials = () => ({
  username: `invalid_user_${faker.string.alphanumeric(8)}`,
  password: `wrong_password_${faker.string.alphanumeric(8)}`,
});

export const createEmptyCredentials = () => ({
  username: '',
  password: '',
});

export const createMalformedCredentials = () => ({
  username: faker.internet.userName() + '@#$%^&*()',
  password: faker.internet.password() + '!@#$%^&*()',
});

export const createLongCredentials = () => ({
  username: faker.internet.userName().repeat(100),
  password: faker.internet.password().repeat(100),
});

export const createSpecialCharacterCredentials = () => ({
  username: 'user@#$%^&*()',
  password: 'pass!@#$%^&*()',
});

// Complex credentials using Rosie Factory
export const CredentialsFactory = new Factory<Credentials>()
  .attr('username', () => faker.internet.userName())
  .attr('password', () => faker.internet.password({ length: 12 }));

// Environment-based credentials for real testing
export const getRealCredentials = (): Credentials => {
  const username = process.env.TRAININGPEAKS_TEST_USERNAME;
  const password = process.env.TRAININGPEAKS_TEST_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'TRAININGPEAKS_TEST_USERNAME and TRAININGPEAKS_TEST_PASSWORD environment variables are required for real integration tests. Please add them to the root .env file.'
    );
  }

  return {
    username,
    password,
  };
};

// Test data collections
export const getTestCredentials = () => ({
  valid: createValidCredentials(),
  invalid: createInvalidCredentials(),
  empty: createEmptyCredentials(),
  malformed: createMalformedCredentials(),
  long: createLongCredentials(),
  special: createSpecialCharacterCredentials(),
  real: getRealCredentials(),
});

// Helper functions for specific test scenarios
export const createCredentialsForScenario = (
  scenario: 'success' | 'failure' | 'edge'
) => {
  switch (scenario) {
    case 'success':
      return getRealCredentials();
    case 'failure':
      return createInvalidCredentials();
    case 'edge':
      return createMalformedCredentials();
    default:
      return createValidCredentials();
  }
};
