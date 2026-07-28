import { describe, expect, it } from 'vitest';

import { IntensityClass, type WorkoutStructureStep } from '@/types';

import {
  createCooldownStep,
  createIntervalStep,
  createRecoveryStep,
  createSteadyStep,
  createWarmupStep,
} from './workout-steps';

/**
 * Helper function to assert intensity range invariants
 */
const assertIntensityRangeInvariant = (step: WorkoutStructureStep): void => {
  const target = step.targets[0];
  const { minValue, maxValue } = target;

  expect(minValue).toBeGreaterThanOrEqual(0); // 0 <= minValue
  expect(minValue).toBeLessThan(maxValue); // minValue < maxValue
  expect(maxValue).toBeLessThanOrEqual(100); // maxValue <= 100
};

describe('Domain Templates - Workout Steps', () => {
  describe('createWarmupStep', () => {
    it('should create a warmup step with correct properties', () => {
      const duration = 10;
      const step = createWarmupStep(duration);

      expect(step).toBeDefined();
      expect(step.name).toBe('Warmup');
      expect(step.length.value).toBe(duration);
      expect(step.intensityClass).toBe(IntensityClass.WARM_UP);
      expect(step.targets).toBeDefined();
      expect(step.targets.length).toBeGreaterThan(0);
    });

    it('should create warmup with default intensity range 45-55%', () => {
      const step = createWarmupStep(10);

      expect(step.targets[0]).toEqual(
        expect.objectContaining({
          minValue: 45,
          maxValue: 55,
        })
      );
    });

    it.each([5, 15, 25])(
      'should handle duration value of %d minutes',
      (duration) => {
        const step = createWarmupStep(duration);
        expect(step.length.value).toBe(duration);
        expect(step.name).toBe('Warmup');
        expect(step.intensityClass).toBe(IntensityClass.WARM_UP);
      }
    );

    it('should handle zero duration', () => {
      const zeroDuration = 0;
      const step = createWarmupStep(zeroDuration);
      expect(step.length.value).toBe(zeroDuration);
    });
  });

  describe('createCooldownStep', () => {
    it('should create a cooldown step with correct properties', () => {
      const duration = 10;
      const step = createCooldownStep(duration);

      expect(step).toBeDefined();
      expect(step.name).toBe('Cooldown');
      expect(step.length.value).toBe(duration);
      expect(step.intensityClass).toBe(IntensityClass.COOL_DOWN);
      expect(step.targets).toBeDefined();
      expect(step.targets.length).toBeGreaterThan(0);
    });

    it('should create cooldown with default intensity range 35-45%', () => {
      const step = createCooldownStep(10);

      expect(step.targets[0]).toEqual(
        expect.objectContaining({
          minValue: 35,
          maxValue: 45,
        })
      );
    });

    it.each([5, 15, 25])(
      'should handle duration value of %d minutes',
      (duration) => {
        const step = createCooldownStep(duration);
        expect(step.length.value).toBe(duration);
        expect(step.name).toBe('Cooldown');
        expect(step.intensityClass).toBe(IntensityClass.COOL_DOWN);
      }
    );
  });

  describe('createIntervalStep', () => {
    it('should create an interval step with correct properties', () => {
      const duration = 5;
      const intensity = 85; // Use a valid intensity within 0-100 range
      const step = createIntervalStep(duration, intensity);

      expect(step).toBeDefined();
      expect(step.name).toBe('Interval');
      expect(step.length.value).toBe(duration);
      expect(step.intensityClass).toBe(IntensityClass.ACTIVE);
      expect(step.targets).toBeDefined();
      expect(step.targets.length).toBeGreaterThan(0);
    });

    it('should create interval with intensity range ±5% around target', () => {
      const intensity = 85; // Use a valid intensity within 0-100 range
      const step = createIntervalStep(5, intensity);

      expect(step.targets[0]).toEqual(
        expect.objectContaining({
          minValue: 80, // 85 - 5 = 80
          maxValue: 90, // 85 + 5 = 90
        })
      );
    });

    it.each([
      { intensity: 100, expectedMin: 95, expectedMax: 100 }, // Clamped to MAX_INTENSITY
      { intensity: 150, expectedMin: 99, expectedMax: 100 }, // Both clamped, adjusted to ensure min < max
      { intensity: 80, expectedMin: 75, expectedMax: 85 },
      { intensity: 10, expectedMin: 5, expectedMax: 15 },
      { intensity: -10, expectedMin: 0, expectedMax: 1 }, // Clamped to MIN_INTENSITY
    ])(
      'should handle intensity $intensity with range $expectedMin-$expectedMax',
      ({ intensity, expectedMin, expectedMax }) => {
        const step = createIntervalStep(5, intensity);
        expect(step.targets[0]).toEqual(
          expect.objectContaining({
            minValue: expectedMin,
            maxValue: expectedMax,
          })
        );
      }
    );

    describe('Edge cases - intensity clamping', () => {
      it('should clamp low intensity values to valid range', () => {
        const step = createIntervalStep(10, 2); // intensityPercent - 5 = -3, should clamp to 0
        expect(step.targets[0]).toEqual(
          expect.objectContaining({
            minValue: 0, // Math.max(0, 2 - 5) = 0
            maxValue: 7, // Math.min(100, 2 + 5) = 7
          })
        );
        assertIntensityRangeInvariant(step);
      });

      it('should clamp high intensity values to valid range', () => {
        const step = createIntervalStep(10, 98); // intensityPercent + 5 = 103, should clamp to 100
        expect(step.targets[0]).toEqual(
          expect.objectContaining({
            minValue: 93, // Math.max(0, 98 - 5) = 93
            maxValue: 100, // Math.min(100, 98 + 5) = 100
          })
        );
        assertIntensityRangeInvariant(step);
      });

      it('should handle boundary intensity values', () => {
        const lowStep = createIntervalStep(10, 0);
        expect(lowStep.targets[0]).toEqual(
          expect.objectContaining({
            minValue: 0, // Math.max(0, 0 - 5) = 0
            maxValue: 5, // Math.min(100, 0 + 5) = 5
          })
        );
        assertIntensityRangeInvariant(lowStep);

        const highStep = createIntervalStep(10, 100);
        expect(highStep.targets[0]).toEqual(
          expect.objectContaining({
            minValue: 95, // Math.max(0, 100 - 5) = 95
            maxValue: 100, // Math.min(100, 100 + 5) = 100
          })
        );
        assertIntensityRangeInvariant(highStep);
      });
    });
  });

  describe('createRecoveryStep', () => {
    it('should create a recovery step with correct properties', () => {
      const duration = 5;
      const step = createRecoveryStep(duration);

      expect(step).toBeDefined();
      expect(step.name).toBe('Recovery');
      expect(step.length.value).toBe(duration);
      expect(step.intensityClass).toBe(IntensityClass.REST);
      expect(step.targets).toBeDefined();
      expect(step.targets.length).toBeGreaterThan(0);
    });

    it('should create recovery with default intensity range 55-65%', () => {
      const step = createRecoveryStep(3);

      expect(step.targets[0]).toEqual(
        expect.objectContaining({
          minValue: 55,
          maxValue: 65,
        })
      );
    });

    it.each([1, 3, 8])(
      'should handle duration value of %d minutes',
      (duration) => {
        const step = createRecoveryStep(duration);
        expect(step.length.value).toBe(duration);
        expect(step.name).toBe('Recovery');
        expect(step.intensityClass).toBe(IntensityClass.REST);
      }
    );
  });

  describe('createSteadyStep', () => {
    it('should create a steady step with correct properties', () => {
      const duration = 30;
      const intensity = 85;
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
      const step = createSteadyStep(30, intensity);

      expect(step.targets[0]).toEqual(
        expect.objectContaining({
          minValue: 85,
          maxValue: 95,
        })
      );
    });

    it.each([
      { intensity: 75, expectedMin: 70, expectedMax: 80 },
      { intensity: 100, expectedMin: 95, expectedMax: 100 }, // Clamped to MAX_INTENSITY
      { intensity: 60, expectedMin: 55, expectedMax: 65 },
    ])(
      'should handle intensity $intensity with range $expectedMin-$expectedMax',
      ({ intensity, expectedMin, expectedMax }) => {
        const step = createSteadyStep(20, intensity);
        expect(step.targets[0]).toEqual(
          expect.objectContaining({
            minValue: expectedMin,
            maxValue: expectedMax,
          })
        );
      }
    );

    it.each([
      { duration: 20, intensity: 75 },
      { duration: 60, intensity: 85 },
      { duration: 120, intensity: 70 },
    ])(
      'should handle duration $duration with intensity $intensity',
      ({ duration, intensity }) => {
        const step = createSteadyStep(duration, intensity);
        expect(step.length.value).toBe(duration);
        expect(step.targets[0]).toEqual(
          expect.objectContaining({
            minValue: intensity - 5,
            maxValue: intensity + 5,
          })
        );
      }
    );

    describe('Edge cases - intensity clamping', () => {
      it('should clamp low intensity values to valid range', () => {
        const step = createSteadyStep(20, 3); // intensityPercent - 5 = -2, should clamp to 0
        expect(step.targets[0]).toEqual(
          expect.objectContaining({
            minValue: 0, // Math.max(0, 3 - 5) = 0
            maxValue: 8, // Math.min(100, 3 + 5) = 8
          })
        );
        assertIntensityRangeInvariant(step);
      });

      it('should clamp high intensity values to valid range', () => {
        const step = createSteadyStep(20, 98); // intensityPercent + 5 = 103, should clamp to 100
        expect(step.targets[0]).toEqual(
          expect.objectContaining({
            minValue: 93, // Math.max(0, 98 - 5) = 93
            maxValue: 100, // Math.min(100, 98 + 5) = 100
          })
        );
        assertIntensityRangeInvariant(step);
      });

      it('should handle boundary intensity values', () => {
        const lowStep = createSteadyStep(20, 0);
        expect(lowStep.targets[0]).toEqual(
          expect.objectContaining({
            minValue: 0, // Math.max(0, 0 - 5) = 0
            maxValue: 5, // Math.min(100, 0 + 5) = 5
          })
        );
        assertIntensityRangeInvariant(lowStep);

        const highStep = createSteadyStep(20, 100);
        expect(highStep.targets[0]).toEqual(
          expect.objectContaining({
            minValue: 95, // Math.max(0, 100 - 5) = 95
            maxValue: 100, // Math.min(100, 100 + 5) = 100
          })
        );
        assertIntensityRangeInvariant(highStep);
      });
    });
  });

  describe('Integration tests', () => {
    it('should create different step types with consistent structure', () => {
      const warmup = createWarmupStep(12);
      const interval = createIntervalStep(5, 85); // Use a valid intensity within 0-100 range
      const recovery = createRecoveryStep(3);
      const steady = createSteadyStep(30, 90);
      const cooldown = createCooldownStep(12);

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
      const warmup = createWarmupStep(12);
      const interval = createIntervalStep(5, 85); // Use a valid intensity within 0-100 range
      const recovery = createRecoveryStep(3);
      const steady = createSteadyStep(30, 90);
      const cooldown = createCooldownStep(12);

      expect(warmup.intensityClass).toBe(IntensityClass.WARM_UP);
      expect(interval.intensityClass).toBe(IntensityClass.ACTIVE);
      expect(recovery.intensityClass).toBe(IntensityClass.REST);
      expect(steady.intensityClass).toBe(IntensityClass.ACTIVE);
      expect(cooldown.intensityClass).toBe(IntensityClass.COOL_DOWN);
    });
  });
});
