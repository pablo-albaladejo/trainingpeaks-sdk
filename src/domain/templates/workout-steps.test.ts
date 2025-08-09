import { randomNumber } from '@fixtures';
import { describe, expect, it } from 'vitest';

import { IntensityClass } from '@/types';

import {
  createCooldownStep,
  createIntervalStep,
  createRecoveryStep,
  createSteadyStep,
  createWarmupStep,
} from './workout-steps';

describe('Domain Templates - Workout Steps', () => {
  describe('createWarmupStep', () => {
    it('should create a warmup step with correct properties', () => {
      const duration = randomNumber(5, 20);
      const step = createWarmupStep(duration);

      expect(step).toBeDefined();
      expect(step.name).toBe('Warmup');
      expect(step.length.value).toBe(duration);
      expect(step.intensityClass).toBe(IntensityClass.WARM_UP);
      expect(step.targets).toBeDefined();
      expect(step.targets.length).toBeGreaterThan(0);
    });

    it('should create warmup with default intensity range 45-55%', () => {
      const step = createWarmupStep(randomNumber(5, 15));

      expect(step.targets[0]).toEqual({
        minValue: 45,
        maxValue: 55,
      });
    });

    it('should handle different duration values', () => {
      const durations = [
        randomNumber(1, 10),
        randomNumber(10, 20),
        randomNumber(20, 30),
      ];

      durations.forEach((duration) => {
        const step = createWarmupStep(duration);
        expect(step.length.value).toBe(duration);
        expect(step.name).toBe('Warmup');
        expect(step.intensityClass).toBe(IntensityClass.WARM_UP);
      });
    });

    it('should handle zero duration', () => {
      const zeroDuration = 0;
      const step = createWarmupStep(zeroDuration);
      expect(step.length.value).toBe(zeroDuration);
    });
  });

  describe('createCooldownStep', () => {
    it('should create a cooldown step with correct properties', () => {
      const duration = randomNumber(5, 20);
      const step = createCooldownStep(duration);

      expect(step).toBeDefined();
      expect(step.name).toBe('Cooldown');
      expect(step.length.value).toBe(duration);
      expect(step.intensityClass).toBe(IntensityClass.COOL_DOWN);
      expect(step.targets).toBeDefined();
      expect(step.targets.length).toBeGreaterThan(0);
    });

    it('should create cooldown with default intensity range 35-45%', () => {
      const step = createCooldownStep(randomNumber(5, 15));

      expect(step.targets[0]).toEqual({
        minValue: 35,
        maxValue: 45,
      });
    });

    it('should handle different duration values', () => {
      const durations = [
        randomNumber(1, 10),
        randomNumber(10, 20),
        randomNumber(20, 30),
      ];

      durations.forEach((duration) => {
        const step = createCooldownStep(duration);
        expect(step.length.value).toBe(duration);
        expect(step.name).toBe('Cooldown');
        expect(step.intensityClass).toBe(IntensityClass.COOL_DOWN);
      });
    });
  });

  describe('createIntervalStep', () => {
    it('should create an interval step with correct properties', () => {
      const duration = randomNumber(2, 10);
      const intensity = randomNumber(100, 150);
      const step = createIntervalStep(duration, intensity);

      expect(step).toBeDefined();
      expect(step.name).toBe('Interval');
      expect(step.length.value).toBe(duration);
      expect(step.intensityClass).toBe(IntensityClass.ACTIVE);
      expect(step.targets).toBeDefined();
      expect(step.targets.length).toBeGreaterThan(0);
    });

    it('should create interval with intensity range ±5% around target', () => {
      const intensity = 120;
      const step = createIntervalStep(randomNumber(3, 8), intensity);

      expect(step.targets[0]).toEqual({
        minValue: 115,
        maxValue: 125,
      });
    });

    it('should handle different intensity values', () => {
      const testCases = [
        { intensity: 100, expectedMin: 95, expectedMax: 105 },
        { intensity: 150, expectedMin: 145, expectedMax: 155 },
        { intensity: 80, expectedMin: 75, expectedMax: 85 },
      ];

      testCases.forEach(({ intensity, expectedMin, expectedMax }) => {
        const step = createIntervalStep(randomNumber(3, 8), intensity);
        expect(step.targets[0]).toEqual({
          minValue: expectedMin,
          maxValue: expectedMax,
        });
      });
    });

    it('should handle edge case intensities', () => {
      const lowIntensity = 10;
      const step = createIntervalStep(randomNumber(3, 8), lowIntensity);
      expect(step.targets[0]).toEqual({
        minValue: 5,
        maxValue: 15,
      });
    });
  });

  describe('createRecoveryStep', () => {
    it('should create a recovery step with correct properties', () => {
      const duration = randomNumber(1, 10);
      const step = createRecoveryStep(duration);

      expect(step).toBeDefined();
      expect(step.name).toBe('Recovery');
      expect(step.length.value).toBe(duration);
      expect(step.intensityClass).toBe(IntensityClass.REST);
      expect(step.targets).toBeDefined();
      expect(step.targets.length).toBeGreaterThan(0);
    });

    it('should create recovery with default intensity range 55-65%', () => {
      const step = createRecoveryStep(randomNumber(2, 5));

      expect(step.targets[0]).toEqual({
        minValue: 55,
        maxValue: 65,
      });
    });

    it('should handle different duration values', () => {
      const durations = [
        randomNumber(1, 2),
        randomNumber(2, 5),
        randomNumber(5, 10),
      ];

      durations.forEach((duration) => {
        const step = createRecoveryStep(duration);
        expect(step.length.value).toBe(duration);
        expect(step.name).toBe('Recovery');
        expect(step.intensityClass).toBe(IntensityClass.REST);
      });
    });
  });

  describe('createSteadyStep', () => {
    it('should create a steady step with correct properties', () => {
      const duration = randomNumber(15, 60);
      const intensity = randomNumber(70, 100);
      const step = createSteadyStep(duration, intensity);

      expect(step).toBeDefined();
      expect(step.name).toBe('Steady');
      expect(step.length.value).toBe(duration);
      expect(step.intensityClass).toBe(IntensityClass.ACTIVE);
      expect(step.targets).toBeDefined();
      expect(step.targets.length).toBeGreaterThan(0);
    });

    it('should create steady with intensity range ±5% around target', () => {
      const intensity = 90;
      const step = createSteadyStep(randomNumber(20, 40), intensity);

      expect(step.targets[0]).toEqual({
        minValue: 85,
        maxValue: 95,
      });
    });

    it('should handle different intensity values', () => {
      const testCases = [
        { intensity: 75, expectedMin: 70, expectedMax: 80 },
        { intensity: 100, expectedMin: 95, expectedMax: 105 },
        { intensity: 60, expectedMin: 55, expectedMax: 65 },
      ];

      testCases.forEach(({ intensity, expectedMin, expectedMax }) => {
        const step = createSteadyStep(randomNumber(15, 30), intensity);
        expect(step.targets[0]).toEqual({
          minValue: expectedMin,
          maxValue: expectedMax,
        });
      });
    });

    it('should handle different duration and intensity combinations', () => {
      const combinations = [
        { duration: 20, intensity: 75 },
        { duration: 60, intensity: 85 },
        { duration: 120, intensity: 70 },
      ];

      combinations.forEach(({ duration, intensity }) => {
        const step = createSteadyStep(duration, intensity);
        expect(step.length.value).toBe(duration);
        expect(step.targets[0].minValue).toBe(intensity - 5);
        expect(step.targets[0].maxValue).toBe(intensity + 5);
      });
    });
  });

  describe('Integration tests', () => {
    it('should create different step types with consistent structure', () => {
      const warmup = createWarmupStep(randomNumber(8, 15));
      const interval = createIntervalStep(
        randomNumber(3, 8),
        randomNumber(110, 130)
      );
      const recovery = createRecoveryStep(randomNumber(2, 5));
      const steady = createSteadyStep(
        randomNumber(20, 40),
        randomNumber(80, 100)
      );
      const cooldown = createCooldownStep(randomNumber(8, 15));

      const steps = [warmup, interval, recovery, steady, cooldown];

      steps.forEach((step) => {
        expect(step).toHaveProperty('name');
        expect(step).toHaveProperty('length');
        expect(step).toHaveProperty('intensityClass');
        expect(step).toHaveProperty('targets');
        expect(Array.isArray(step.targets)).toBe(true);
        expect(step.targets.length).toBeGreaterThan(0);
      });
    });

    it('should create steps with appropriate intensity classes', () => {
      const warmup = createWarmupStep(randomNumber(8, 15));
      const interval = createIntervalStep(
        randomNumber(3, 8),
        randomNumber(110, 130)
      );
      const recovery = createRecoveryStep(randomNumber(2, 5));
      const steady = createSteadyStep(
        randomNumber(20, 40),
        randomNumber(80, 100)
      );
      const cooldown = createCooldownStep(randomNumber(8, 15));

      expect(warmup.intensityClass).toBe(IntensityClass.WARM_UP);
      expect(interval.intensityClass).toBe(IntensityClass.ACTIVE);
      expect(recovery.intensityClass).toBe(IntensityClass.REST);
      expect(steady.intensityClass).toBe(IntensityClass.ACTIVE);
      expect(cooldown.intensityClass).toBe(IntensityClass.COOL_DOWN);
    });
  });
});
