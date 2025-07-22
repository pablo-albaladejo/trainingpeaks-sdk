/**
 * TrainingPeaksConfig Fixtures
 * Factory pattern fixtures for creating TrainingPeaksConfig using rosie and faker
 */

import { TrainingPeaksConfig } from '@/types';
import { Factory } from 'rosie';

/**
 * TrainingPeaksConfig Factory
 * Creates TrainingPeaksConfig using rosie Factory and faker
 */
export const trainingPeaksConfigBuilder = new Factory<TrainingPeaksConfig>()
  .attr('baseUrl', () => 'https://www.trainingpeaks.com')
  .attr('timeout', () => 10000)
  .attr('debug', () => false)
  .attr('headers', () => undefined);
