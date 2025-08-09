import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';

import { HttpError } from '@/adapters/errors/http-errors';
import { ERROR_CODES } from '@/domain/errors/error-codes';

import { httpErrorBuilder } from './http-errors.fixture';

/**
 * Generate a random number within a range
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random number
 */
export function randomNumber(min: number = 0, max: number = 100): number {
  return faker.number.int({ min, max });
}

/**
 * Generate a random string
 * @param length - Length of the string
 * @returns Random string
 */
export function randomString(length: number = 10): string {
  return faker.string.alpha({ length });
}

/**
 * Generate a random date
 * @returns Random date as ISO string
 */
export function randomDate(): string {
  return faker.date.recent().toISOString().split('T')[0] || '2024-01-01';
}

/**
 * Generate a random URL
 * @returns Random URL
 */
export function randomUrl(): string {
  return faker.internet.url();
}

/**
 * Helper function to create error builders with default options
 */
function makeErrorBuilder(
  options: Readonly<Pick<HttpError, 'status' | 'statusText' | 'code'>>
): Factory<HttpError> {
  return new Factory<HttpError>()
    .extend(httpErrorBuilder)
    .option('status', options.status)
    .option('statusText', options.statusText)
    .option('code', options.code);
}

/**
 * Client Error Builder
 * Creates 4xx client errors for testing non-retry scenarios
 */
export const clientErrorBuilder = makeErrorBuilder({
  status: 400,
  statusText: 'Bad Request',
  code: ERROR_CODES.VALIDATION_FAILED,
});

/**
 * Server Error Builder
 * Creates 5xx server errors for testing retry scenarios
 */
export const serverErrorBuilder = makeErrorBuilder({
  status: 500,
  statusText: 'Internal Server Error',
  code: ERROR_CODES.NETWORK_SERVER_ERROR,
});
