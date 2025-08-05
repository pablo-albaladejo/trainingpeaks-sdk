import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';

import { HttpError } from '@/adapters/errors/http-errors';

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
 * HttpError Builder
 * Creates HttpError instances for testing
 */
export const httpErrorBuilder = new Factory<HttpError>()
  .attr('message', () => faker.lorem.sentence())
  .attr('code', () =>
    faker.helpers.arrayElement([
      'SERVER_ERROR',
      'CLIENT_ERROR',
      'NETWORK_ERROR',
    ])
  )
  .attr('status', () =>
    faker.helpers.arrayElement([400, 401, 403, 404, 500, 502, 503])
  )
  .attr('statusText', () =>
    faker.helpers.arrayElement([
      'Bad Request',
      'Unauthorized',
      'Forbidden',
      'Not Found',
      'Internal Server Error',
      'Bad Gateway',
      'Service Unavailable',
    ])
  )
  .option('status', 500)
  .option('statusText', 'Internal Server Error')
  .option('code', 'SERVER_ERROR')
  .after((error, options) => {
    return new HttpError(error.message, options.code || error.code, {
      status: options.status || error.status,
      statusText: options.statusText || error.statusText,
    });
  });

/**
 * Server Error Builder
 * Creates 5xx server errors for testing retry scenarios
 */
export const serverErrorBuilder = new Factory<HttpError>()
  .extend(httpErrorBuilder)
  .option('status', 500)
  .option('statusText', 'Internal Server Error')
  .option('code', 'SERVER_ERROR');

/**
 * Client Error Builder
 * Creates 4xx client errors for testing non-retry scenarios
 */
export const clientErrorBuilder = new Factory<HttpError>()
  .extend(httpErrorBuilder)
  .option('status', 400)
  .option('statusText', 'Bad Request')
  .option('code', 'CLIENT_ERROR');
