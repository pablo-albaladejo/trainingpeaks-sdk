/**
 * TrainingPeaks Client Tests
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { TrainingPeaksClient } from '.';
import { TrainingPeaksConfigFixture } from '../__fixtures__/training-peaks-config.fixture';
import { randomNumber } from '../__fixtures__/utils.fixture';

describe('TrainingPeaksClient', () => {
  let client: TrainingPeaksClient;

  beforeEach(() => {
    client = new TrainingPeaksClient(TrainingPeaksConfigFixture.default());
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  it('should have proper configuration', () => {
    const config = client.getConfig();
    expect(config).toBeDefined();
    expect(config.baseUrl).toBe('https://www.trainingpeaks.com');
    expect(config.timeout).toBe(10000);
    expect(config.debug).toBe(false);
  });

  it('should have auth module', () => {
    const auth = client.getAuth();
    expect(auth).toBeDefined();
    expect(typeof auth.login).toBe('function');
    expect(typeof auth.logout).toBe('function');
    expect(typeof auth.isAuthenticated).toBe('function');
  });

  it('should have workout uploader', () => {
    const uploader = client.getWorkoutUploader();
    expect(uploader).toBeDefined();
    expect(typeof uploader.uploadWorkout).toBe('function');
  });

  it('should generate random numbers', () => {
    const num1 = randomNumber();
    const num2 = randomNumber();
    expect(num1).toBeGreaterThanOrEqual(0);
    expect(num1).toBeLessThan(1000);
    expect(num2).toBeGreaterThanOrEqual(0);
    expect(num2).toBeLessThan(1000);
  });
});
