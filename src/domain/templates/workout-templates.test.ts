import { describe, expect, it, test } from 'vitest';

import { ElementType, IntensityClass } from '@/types';

import {
  createIntervalWorkout,
  createLongSteadyWorkout,
  createTempoWorkout,
} from './workout-templates';

describe('Domain Templates - Workout Templates', () => {
  describe('createIntervalWorkout', () => {
    it('should create interval workout with default parameters', () => {
      const workout = createIntervalWorkout();

      expect(workout).toBeDefined();
      expect(workout.structure).toBeDefined();
      expect(Array.isArray(workout.structure)).toBe(true);
      expect(workout.structure.length).toBeGreaterThan(0);
    });

    it('should create interval workout with custom parameters', () => {
      const warmup = 15;
      const intervalDuration = 5;
      const intervalIntensity = 120;
      const recoveryDuration = 3;
      const intervals = 6;
      const cooldown = 15;

      const workout = createIntervalWorkout(
        warmup,
        intervalDuration,
        intervalIntensity,
        recoveryDuration,
        intervals,
        cooldown
      );

      expect(workout).toBeDefined();
      expect(workout.structure).toBeDefined();
    });

    it('should include warmup, intervals with recovery, and cooldown', () => {
      const intervals = 4;
      const workout = createIntervalWorkout(10, 5, 120, 3, intervals, 10);

      // Expected structure: warmup + (interval + recovery) * (intervals-1) + final interval + cooldown
      // = 1 warmup + 3 intervals + 3 recoveries + 1 final interval + 1 cooldown = 9 elements
      const expectedElements = 1 + intervals + (intervals - 1) + 1; // warmup + intervals + recoveries + cooldown
      expect(workout.structure).toHaveLength(expectedElements);

      // First element should be warmup
      const firstElement = workout.structure[0];
      expect(firstElement.type).toBe(ElementType.STEP);
      expect(firstElement.steps[0].name).toBe('Warmup');
      expect(firstElement.steps[0].intensityClass).toBe(IntensityClass.WARM_UP);

      // Last element should be cooldown
      const lastElement = workout.structure[workout.structure.length - 1];
      expect(lastElement.type).toBe(ElementType.STEP);
      expect(lastElement.steps[0].name).toBe('Cooldown');
      expect(lastElement.steps[0].intensityClass).toBe(
        IntensityClass.COOL_DOWN
      );
    });

    it('should handle single interval', () => {
      const workout = createIntervalWorkout(10, 5, 120, 3, 1, 10);

      // Should have warmup + 1 interval + cooldown = 3 elements
      expect(workout.structure).toHaveLength(3);

      const elements = workout.structure;
      expect(elements[0].steps[0].name).toBe('Warmup');
      expect(elements[1].steps[0].name).toBe('Interval');
      expect(elements[2].steps[0].name).toBe('Cooldown');
    });

    it('should create intervals with correct intensity', () => {
      const intensity = 130;
      const workout = createIntervalWorkout(10, 5, intensity, 3, 2, 10);

      // Find interval elements (not warmup, recovery, or cooldown)
      const intervalElements = workout.structure.filter(
        (element) => element.steps[0].name === 'Interval'
      );

      expect(intervalElements).toHaveLength(2);
      intervalElements.forEach((element) => {
        const step = element.steps[0];
        expect(step.targets[0].minValue).toBe(intensity - 5);
        expect(step.targets[0].maxValue).toBe(intensity + 5);
      });
    });

    it('should handle zero intervals gracefully', () => {
      const workout = createIntervalWorkout(10, 5, 120, 3, 0, 10);

      // Should still have warmup + cooldown
      expect(workout.structure).toHaveLength(2);
      expect(workout.structure[0].steps[0].name).toBe('Warmup');
      expect(workout.structure[1].steps[0].name).toBe('Cooldown');
    });
  });

  describe('createTempoWorkout', () => {
    it('should create tempo workout with default parameters', () => {
      const workout = createTempoWorkout();

      expect(workout).toBeDefined();
      expect(workout.structure).toBeDefined();
      expect(Array.isArray(workout.structure)).toBe(true);
    });

    it('should create tempo workout with custom parameters', () => {
      const warmup = 20;
      const tempoDuration = 45;
      const tempoIntensity = 95;
      const cooldown = 15;

      const workout = createTempoWorkout(
        warmup,
        tempoDuration,
        tempoIntensity,
        cooldown
      );

      expect(workout).toBeDefined();
      expect(workout.structure).toBeDefined();
    });

    it('should have warmup, tempo, and cooldown structure', () => {
      const workout = createTempoWorkout(15, 30, 90, 10);

      expect(workout.structure).toHaveLength(3);

      const [warmupElement, tempoElement, cooldownElement] = workout.structure;

      // Warmup
      expect(warmupElement.type).toBe(ElementType.STEP);
      expect(warmupElement.steps[0].name).toBe('Warmup');
      expect(warmupElement.steps[0].intensityClass).toBe(
        IntensityClass.WARM_UP
      );
      expect(warmupElement.steps[0].length.value).toBe(15);

      // Tempo (steady step)
      expect(tempoElement.type).toBe(ElementType.STEP);
      expect(tempoElement.steps[0].name).toBe('Steady');
      expect(tempoElement.steps[0].intensityClass).toBe(IntensityClass.ACTIVE);
      expect(tempoElement.steps[0].length.value).toBe(30);

      // Cooldown
      expect(cooldownElement.type).toBe(ElementType.STEP);
      expect(cooldownElement.steps[0].name).toBe('Cooldown');
      expect(cooldownElement.steps[0].intensityClass).toBe(
        IntensityClass.COOL_DOWN
      );
      expect(cooldownElement.steps[0].length.value).toBe(10);
    });

    it('should create tempo with correct intensity', () => {
      const intensity = 95;
      const workout = createTempoWorkout(15, 30, intensity, 10);

      const tempoElement = workout.structure[1]; // Middle element should be tempo
      const tempoStep = tempoElement.steps[0];

      expect(tempoStep.targets[0].minValue).toBe(intensity - 5);
      expect(tempoStep.targets[0].maxValue).toBe(intensity + 5);
    });

    test.each([15, 20, 45, 60])(
      'should handle tempo duration of %d minutes',
      (duration) => {
        const workout = createTempoWorkout(10, duration, 90, 10);
        const tempoElement = workout.structure[1];
        expect(tempoElement.steps[0].length.value).toBe(duration);
      }
    );
  });

  describe('createLongSteadyWorkout', () => {
    it('should create long steady workout with default parameters', () => {
      const workout = createLongSteadyWorkout();

      expect(workout).toBeDefined();
      expect(workout.structure).toBeDefined();
      expect(Array.isArray(workout.structure)).toBe(true);
    });

    it('should create long steady workout with custom parameters', () => {
      const warmup = 15;
      const steadyDuration = 180;
      const steadyIntensity = 80;
      const cooldown = 15;

      const workout = createLongSteadyWorkout(
        warmup,
        steadyDuration,
        steadyIntensity,
        cooldown
      );

      expect(workout).toBeDefined();
      expect(workout.structure).toBeDefined();
    });

    it('should have warmup, steady, and cooldown structure', () => {
      const workout = createLongSteadyWorkout(10, 120, 75, 10);

      expect(workout.structure).toHaveLength(3);

      const [warmupElement, steadyElement, cooldownElement] = workout.structure;

      // Warmup
      expect(warmupElement.type).toBe(ElementType.STEP);
      expect(warmupElement.steps[0].name).toBe('Warmup');
      expect(warmupElement.steps[0].intensityClass).toBe(
        IntensityClass.WARM_UP
      );
      expect(warmupElement.steps[0].length.value).toBe(10);

      // Steady
      expect(steadyElement.type).toBe(ElementType.STEP);
      expect(steadyElement.steps[0].name).toBe('Steady');
      expect(steadyElement.steps[0].intensityClass).toBe(IntensityClass.ACTIVE);
      expect(steadyElement.steps[0].length.value).toBe(120);

      // Cooldown
      expect(cooldownElement.type).toBe(ElementType.STEP);
      expect(cooldownElement.steps[0].name).toBe('Cooldown');
      expect(cooldownElement.steps[0].intensityClass).toBe(
        IntensityClass.COOL_DOWN
      );
      expect(cooldownElement.steps[0].length.value).toBe(10);
    });

    it('should create steady with correct intensity', () => {
      const intensity = 80;
      const workout = createLongSteadyWorkout(10, 120, intensity, 10);

      const steadyElement = workout.structure[1]; // Middle element should be steady
      const steadyStep = steadyElement.steps[0];

      expect(steadyStep.targets[0].minValue).toBe(intensity - 5);
      expect(steadyStep.targets[0].maxValue).toBe(intensity + 5);
    });

    test.each([60, 120, 180])(
      'should handle steady duration of %d minutes',
      (duration) => {
        const workout = createLongSteadyWorkout(10, duration, 75, 10);
        const steadyElement = workout.structure[1];
        expect(steadyElement.steps[0].length.value).toBe(duration);
      }
    );

    it('should handle very long durations', () => {
      const workout = createLongSteadyWorkout(15, 240, 70, 15);

      expect(workout.structure).toHaveLength(3);
      const steadyElement = workout.structure[1];
      expect(steadyElement.steps[0].length.value).toBe(240);
    });
  });

  describe('Integration tests', () => {
    test.each([
      ['interval', createIntervalWorkout],
      ['tempo', createTempoWorkout],
      ['longSteady', createLongSteadyWorkout],
    ])(
      'should create %s workout with consistent structure',
      (workoutType, workoutFactory) => {
        const workout = workoutFactory();
        expect(workout).toHaveProperty('structure');
        expect(Array.isArray(workout.structure)).toBe(true);
        expect(workout.structure.length).toBeGreaterThan(0);

        // All workouts should start with warmup and end with cooldown
        const firstElement = workout.structure[0];
        const lastElement = workout.structure[workout.structure.length - 1];

        expect(firstElement.steps[0].name).toBe('Warmup');
        expect(lastElement.steps[0].name).toBe('Cooldown');
      }
    );

    test.each([
      ['interval', createIntervalWorkout],
      ['tempo', createTempoWorkout],
      ['longSteady', createLongSteadyWorkout],
    ])(
      'should create %s workout with valid element types',
      (workoutType, workoutFactory) => {
        const workout = workoutFactory();
        workout.structure.forEach((element) => {
          expect(element.type).toBe(ElementType.STEP);
          expect(Array.isArray(element.steps)).toBe(true);
          expect(element.steps.length).toBeGreaterThan(0);
        });
      }
    );

    it('should create workouts with different total durations', () => {
      const interval = createIntervalWorkout(10, 5, 120, 3, 4, 10); // 10 + 4*5 + 3*3 + 10 = 49 min
      const tempo = createTempoWorkout(15, 30, 90, 10); // 15 + 30 + 10 = 55 min
      const longSteady = createLongSteadyWorkout(10, 120, 75, 10); // 10 + 120 + 10 = 140 min

      // Calculate total duration for each workout
      const getTotalDuration = (workout: {
        structure: Array<{ steps: Array<{ length: { value: number } }> }>;
      }) => {
        return workout.structure.reduce((total: number, element) => {
          return (
            total +
            element.steps.reduce(
              (stepTotal: number, step) => stepTotal + step.length.value,
              0
            )
          );
        }, 0);
      };

      expect(getTotalDuration(interval)).toBe(49);
      expect(getTotalDuration(tempo)).toBe(55);
      expect(getTotalDuration(longSteady)).toBe(140);
    });
  });
});
