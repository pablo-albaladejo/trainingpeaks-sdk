/**
 * TrainingPeaksConfig Fixtures
 * Factory pattern fixtures for creating TrainingPeaksConfig using rosie and faker
 */

import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';

import {
  AuthMethod,
  TrainingPeaksClientConfig,
  TrainingPeaksConfig,
} from '@/types';

/**
 * TrainingPeaksConfig Factory
 * Creates TrainingPeaksConfig using rosie Factory and faker
 */
export const trainingPeaksConfigBuilder = new Factory<TrainingPeaksConfig>()
  .attr('baseUrl', () => faker.internet.url())
  .attr('timeout', () => faker.number.int({ min: 5000, max: 30000 }))
  .attr('debug', () => faker.datatype.boolean())
  .attr('headers', () => ({
    'User-Agent': faker.internet.userAgent(),
    Accept: 'application/json',
  }))
  .attr('authMethod', () =>
    faker.helpers.arrayElement([AuthMethod.WEB, AuthMethod.API])
  )
  .attr('webAuth', () => ({
    headless: faker.datatype.boolean(),
    timeout: faker.number.int({ min: 10000, max: 60000 }),
    executablePath: faker.system.filePath(),
  }));

/**
 * TrainingPeaksClientConfig Factory
 * Creates TrainingPeaksClientConfig using rosie Factory and faker
 */
export const trainingPeaksClientConfigBuilder =
  new Factory<TrainingPeaksClientConfig>()
    .attr('baseUrl', () => faker.internet.url())
    .attr('authMethod', () =>
      faker.helpers.arrayElement([AuthMethod.WEB, AuthMethod.API])
    )
    .attr('webAuth', () => ({
      headless: faker.datatype.boolean(),
      timeout: faker.number.int({ min: 10000, max: 60000 }),
      executablePath: faker.system.filePath(),
    }))
    .attr('debug', () => faker.datatype.boolean())
    .attr('timeout', () => faker.number.int({ min: 5000, max: 30000 }))
    .attr('headers', () => ({
      'User-Agent': faker.internet.userAgent(),
      Accept: 'application/json',
    }))
    .attr('sdkConfig', () => trainingPeaksConfigBuilder.build());
