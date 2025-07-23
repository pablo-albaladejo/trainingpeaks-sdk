/**
 * Client Responses Fixture Builder
 * Provides test data for client response scenarios
 */

import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';

// Simple response data using Faker
export const createSuccessResponse = () => ({
  success: true,
  user: {
    id: faker.string.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  },
});

export const createErrorResponse = () => ({
  success: false,
  error: faker.lorem.sentence(),
});

export const createEmptyResponse = () => ({
  success: false,
  error: '',
});

// Complex response data using Rosie Factory
export const UserResponseFactory = new Factory()
  .attr('success', true)
  .attr('user', () => ({
    id: faker.string.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    preferences: {
      timezone: faker.location.timeZone(),
      language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de']),
      units: faker.helpers.arrayElement(['metric', 'imperial']),
    },
  }));

export const ErrorResponseFactory = new Factory()
  .attr('success', false)
  .attr('error', () => faker.helpers.arrayElement([
    'Invalid credentials',
    'User not found',
    'Authentication failed',
    'Network error',
    'Server error',
    'Rate limit exceeded',
  ]));

// Test data collections
export const getTestResponses = () => ({
  success: createSuccessResponse(),
  error: createErrorResponse(),
  empty: createEmptyResponse(),
  user: UserResponseFactory.build(),
  errorResponse: ErrorResponseFactory.build(),
});

// Helper functions for specific test scenarios
export const createResponseForScenario = (scenario: 'success' | 'failure' | 'network' | 'server') => {
  switch (scenario) {
    case 'success':
      return UserResponseFactory.build();
    case 'failure':
      return ErrorResponseFactory.build();
    case 'network':
      return {
        success: false,
        error: 'Network connection failed',
      };
    case 'server':
      return {
        success: false,
        error: 'Internal server error',
      };
    default:
      return createSuccessResponse();
  }
};

// Mock response generators for testing
export const createMockLoginResponse = (success: boolean) => {
  if (success) {
    return UserResponseFactory.build();
  }
  return ErrorResponseFactory.build();
};

export const createMockGetUserResponse = (success: boolean) => {
  if (success) {
    return UserResponseFactory.build();
  }
  return ErrorResponseFactory.build();
}; 