import { faker } from '@faker-js/faker';

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
 * Generate a random email
 * @returns Random email
 */
export function randomEmail(): string {
  return faker.internet.email();
}

/**
 * Generate a random URL
 * @returns Random URL
 */
export function randomUrl(): string {
  return faker.internet.url();
}
