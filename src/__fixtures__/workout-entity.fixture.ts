/**
 * Workout Entity Fixtures
 * Factory pattern fixtures for creating Workout entities using rosie and faker
 */

import type { Workout } from '@/domain';
import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';
import { randomNumber } from './utils.fixture';

/**
 * Workout Factory
 * Creates Workout entities using rosie Factory and faker
 */
export const workoutBuilder = new Factory<Workout>()
  .attr('id', () => faker.string.uuid())
  .attr('name', () => faker.lorem.words(3))
  .attr('description', () => faker.lorem.sentence())
  .attr('date', () => faker.date.recent({ days: 30 }))
  .attr('duration', () => randomNumber(1800, 7200)) // 30 minutes to 2 hours
  .attr('distance', () => randomNumber(1000, 50000)) // 1-50km
  .attr('activityType', () =>
    faker.helpers.arrayElement(['run', 'bike', 'swim', 'strength', 'other'])
  )
  .attr('tags', () =>
    Array.from({ length: randomNumber(1, 5) }, () => faker.lorem.word())
  )
  .attr('fileContent', () => undefined)
  .attr('fileName', () => undefined)
  .attr('createdAt', () => faker.date.past())
  .attr('updatedAt', () => faker.date.recent())
  .attr('structure', () => undefined);
