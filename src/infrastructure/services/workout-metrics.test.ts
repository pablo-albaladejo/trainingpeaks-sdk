/**
 * Workout Metrics Infrastructure Services Tests
 */

import {
  WorkoutLength,
  WorkoutStep,
  WorkoutStructure,
  WorkoutStructureElement,
  WorkoutTarget,
} from '@/domain/value-objects/workout-structure';
import { describe, expect, it } from 'vitest';
import {
  calculateCalories,
  calculateDistance,
  calculateElevationGain,
  calculateEnergy,
  calculateIntensityFactor,
  calculatePlannedMetrics,
  calculateTSS,
  calculateVelocity,
} from './workout-metrics';

describe('Workout Metrics Services', () => {
  // Helper function to create a simple workout structure
  const createSimpleWorkoutStructure = (intensity: number = 75) => {
    const step = WorkoutStep.create(
      'Test Step',
      WorkoutLength.create(3600, 'second'), // 1 hour
      [WorkoutTarget.create(intensity, intensity)], // Use single target to avoid midpoint calculation
      'active'
    );

    const element = WorkoutStructureElement.create(
      'step',
      WorkoutLength.create(3600, 'second'),
      [step],
      0,
      3600
    );

    return WorkoutStructure.create(
      [element],
      [
        [0, 0],
        [1, 1],
      ],
      'duration',
      'percentOfThresholdPace',
      'range'
    );
  };

  describe('calculateTSS', () => {
    it('should calculate TSS for a simple workout', () => {
      const structure = createSimpleWorkoutStructure(75);
      const tss = calculateTSS(structure);

      // TSS = (1 hour) * (0.75 intensity) * 100 = 75
      expect(tss).toBeCloseTo(75, 1);
    });

    it('should adjust TSS for athlete weight', () => {
      const structure = createSimpleWorkoutStructure(75);
      const tssLight = calculateTSS(structure, 60);
      const tssHeavy = calculateTSS(structure, 80);

      expect(tssLight).toBeLessThan(tssHeavy);
    });

    it('should handle high intensity workouts', () => {
      const structure = createSimpleWorkoutStructure(90);
      const tss = calculateTSS(structure);

      // TSS = (1 hour) * (0.90 intensity) * 100 = 90
      expect(tss).toBeCloseTo(90, 1);
    });
  });

  describe('calculateIntensityFactor', () => {
    it('should calculate IF for moderate intensity', () => {
      const structure = createSimpleWorkoutStructure(75);
      const ifValue = calculateIntensityFactor(structure);

      expect(ifValue).toBe(0.75);
    });

    it('should calculate IF for high intensity', () => {
      const structure = createSimpleWorkoutStructure(90);
      const ifValue = calculateIntensityFactor(structure);

      expect(ifValue).toBe(0.9);
    });

    it('should calculate IF for low intensity', () => {
      const structure = createSimpleWorkoutStructure(60);
      const ifValue = calculateIntensityFactor(structure);

      expect(ifValue).toBe(0.6);
    });
  });

  describe('calculateVelocity', () => {
    it('should calculate velocity for running', () => {
      const structure = createSimpleWorkoutStructure(75);
      const velocity = calculateVelocity(structure, 'RUN');

      // Base velocity for running is 3.33 m/s, adjusted for 75% intensity
      expect(velocity).toBeGreaterThan(2.5);
      expect(velocity).toBeLessThan(4.0);
    });

    it('should calculate velocity for cycling', () => {
      const structure = createSimpleWorkoutStructure(75);
      const velocity = calculateVelocity(structure, 'BIKE');

      // Base velocity for cycling is 8.33 m/s
      expect(velocity).toBeGreaterThan(6.0);
      expect(velocity).toBeLessThan(10.0);
    });

    it('should adjust velocity based on intensity', () => {
      const structureLow = createSimpleWorkoutStructure(60);
      const structureHigh = createSimpleWorkoutStructure(90);

      const velocityLow = calculateVelocity(structureLow, 'RUN');
      const velocityHigh = calculateVelocity(structureHigh, 'RUN');

      expect(velocityHigh).toBeGreaterThan(velocityLow);
    });
  });

  describe('calculateCalories', () => {
    it('should calculate calories for running', () => {
      const structure = createSimpleWorkoutStructure(75);
      const calories = calculateCalories(structure, 70, 'RUN');

      // For 70kg athlete, 1 hour running at 600 cal/kg/hour = 42,000 base calories
      // Adjusted for 75% intensity (1.1 multiplier)
      expect(calories).toBeGreaterThan(40000);
      expect(calories).toBeLessThan(50000);
    });

    it('should calculate calories for cycling', () => {
      const structure = createSimpleWorkoutStructure(75);
      const calories = calculateCalories(structure, 70, 'BIKE');

      // For 70kg athlete, 1 hour cycling at 400 cal/kg/hour = 28,000 base calories
      // Adjusted for 75% intensity (1.1 multiplier)
      expect(calories).toBeGreaterThan(25000);
      expect(calories).toBeLessThan(35000);
    });

    it('should adjust calories for athlete weight', () => {
      const structure = createSimpleWorkoutStructure(75);
      const caloriesLight = calculateCalories(structure, 60, 'RUN');
      const caloriesHeavy = calculateCalories(structure, 80, 'RUN');

      expect(caloriesHeavy).toBeGreaterThan(caloriesLight);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance for running', () => {
      const structure = createSimpleWorkoutStructure(75);
      const distance = calculateDistance(structure, 'RUN');

      // 1 hour at ~3.33 m/s = ~12,000 meters
      expect(distance).toBeGreaterThan(10000);
      expect(distance).toBeLessThan(15000);
    });

    it('should calculate distance for cycling', () => {
      const structure = createSimpleWorkoutStructure(75);
      const distance = calculateDistance(structure, 'BIKE');

      // 1 hour at ~8.33 m/s = ~30,000 meters
      expect(distance).toBeGreaterThan(25000);
      expect(distance).toBeLessThan(35000);
    });
  });

  describe('calculateElevationGain', () => {
    it('should calculate elevation gain', () => {
      const structure = createSimpleWorkoutStructure(75);
      const elevation = calculateElevationGain(structure);

      // ~100m per hour for moderate activity
      expect(elevation).toBeCloseTo(100, 0);
    });

    it('should scale with duration', () => {
      // Create a 2-hour workout
      const step = WorkoutStep.create(
        'Long Step',
        WorkoutLength.create(7200, 'second'), // 2 hours
        [WorkoutTarget.create(75, 80)],
        'active'
      );

      const element = WorkoutStructureElement.create(
        'step',
        WorkoutLength.create(7200, 'second'),
        [step],
        0,
        7200
      );

      const structure = WorkoutStructure.create(
        [element],
        [
          [0, 0],
          [1, 1],
        ],
        'duration',
        'percentOfThresholdPace',
        'range'
      );

      const elevation = calculateElevationGain(structure);

      // ~200m for 2 hours
      expect(elevation).toBeCloseTo(200, 0);
    });
  });

  describe('calculateEnergy', () => {
    it('should calculate energy in kJ', () => {
      const structure = createSimpleWorkoutStructure(75);
      const energy = calculateEnergy(structure, 70);

      // Energy should be calories * 4.184
      const calories = calculateCalories(structure, 70, 'RUN');
      const expectedEnergy = Math.round(calories * 4.184);

      expect(energy).toBe(expectedEnergy);
    });
  });

  describe('calculatePlannedMetrics', () => {
    it('should calculate all planned metrics', () => {
      const structure = createSimpleWorkoutStructure(75);
      const metrics = calculatePlannedMetrics(structure, 70, 'RUN');

      expect(metrics).toHaveProperty('totalTimePlanned');
      expect(metrics).toHaveProperty('tssPlanned');
      expect(metrics).toHaveProperty('ifPlanned');
      expect(metrics).toHaveProperty('velocityPlanned');
      expect(metrics).toHaveProperty('caloriesPlanned');
      expect(metrics).toHaveProperty('distancePlanned');
      expect(metrics).toHaveProperty('elevationGainPlanned');
      expect(metrics).toHaveProperty('energyPlanned');

      expect(metrics.totalTimePlanned).toBeCloseTo(1.0, 3); // 1 hour
      expect(metrics.ifPlanned).toBe(0.75);
      expect(metrics.tssPlanned).toBeCloseTo(75, 1);
    });

    it('should use default values when not provided', () => {
      const structure = createSimpleWorkoutStructure(75);
      const metrics = calculatePlannedMetrics(structure);

      expect(metrics.totalTimePlanned).toBeCloseTo(1.0, 3);
      expect(metrics.ifPlanned).toBe(0.75);
    });

    it('should adjust metrics for different activity types', () => {
      const structure = createSimpleWorkoutStructure(75);
      const runMetrics = calculatePlannedMetrics(structure, 70, 'RUN');
      const bikeMetrics = calculatePlannedMetrics(structure, 70, 'BIKE');

      // Cycling should have higher velocity and distance
      expect(bikeMetrics.velocityPlanned).toBeGreaterThan(
        runMetrics.velocityPlanned
      );
      expect(bikeMetrics.distancePlanned).toBeGreaterThan(
        runMetrics.distancePlanned
      );

      // Running should have higher calories (more intense)
      expect(runMetrics.caloriesPlanned).toBeGreaterThan(
        bikeMetrics.caloriesPlanned
      );
    });
  });
});
