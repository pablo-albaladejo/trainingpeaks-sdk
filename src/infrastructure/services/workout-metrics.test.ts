/**
 * Workout Metrics Service Tests
 * Tests for workout metrics calculations
 */

import { describe, expect, it } from 'vitest';
import {
  createWorkoutLength,
  createWorkoutStep,
  createWorkoutStructure,
  createWorkoutStructureElement,
  createWorkoutTarget,
} from './domain-factories';
import { calculatePlannedMetrics } from './workout-metrics';

describe('Workout Metrics Service', () => {
  describe('calculatePlannedMetrics', () => {
    it('should calculate metrics for a simple workout structure', () => {
      // Arrange
      const warmUpStep = createWorkoutStep(
        'Warm-up',
        createWorkoutLength(600, 'second'),
        [createWorkoutTarget(60, 70)],
        'warmUp'
      );

      const mainSetStep = createWorkoutStep(
        'Main Set',
        createWorkoutLength(1200, 'second'),
        [createWorkoutTarget(80, 90)],
        'active'
      );

      const coolDownStep = createWorkoutStep(
        'Cool-down',
        createWorkoutLength(300, 'second'),
        [createWorkoutTarget(50, 60)],
        'coolDown'
      );

      const step1Element = createWorkoutStructureElement(
        'step',
        createWorkoutLength(600, 'second'),
        [warmUpStep],
        0,
        600
      );

      const step2Element = createWorkoutStructureElement(
        'step',
        createWorkoutLength(1200, 'second'),
        [mainSetStep],
        600,
        1800
      );

      const step3Element = createWorkoutStructureElement(
        'step',
        createWorkoutLength(300, 'second'),
        [coolDownStep],
        1800,
        2100
      );

      const structure = createWorkoutStructure(
        [step1Element, step2Element, step3Element],
        [
          [0, 0],
          [600, 0],
          [1800, 0],
          [2100, 0],
        ],
        'duration',
        'percentOfThresholdPace',
        'target'
      );

      // Act
      const metrics = calculatePlannedMetrics(structure);

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.totalTimePlanned).toBeCloseTo(0.583, 3); // 2100 seconds = 0.583 hours
      expect(metrics.tssPlanned).toBeGreaterThan(0);
      expect(metrics.ifPlanned).toBeGreaterThan(0);
      expect(metrics.velocityPlanned).toBeCloseTo(4.17, 2);
      expect(metrics.caloriesPlanned).toBeGreaterThan(0);
      expect(metrics.distancePlanned).toBeGreaterThan(0);
      expect(metrics.elevationGainPlanned).toBeGreaterThan(0);
      expect(metrics.energyPlanned).toBeGreaterThan(0);
    });

    it('should calculate metrics for interval workout', () => {
      // Arrange
      const intervalStep = createWorkoutStep(
        'Interval',
        createWorkoutLength(120, 'second'),
        [createWorkoutTarget(85, 95)],
        'active'
      );

      const restStep = createWorkoutStep(
        'Rest',
        createWorkoutLength(60, 'second'),
        [createWorkoutTarget(50, 60)],
        'rest'
      );

      const repetitionElement = createWorkoutStructureElement(
        'repetition',
        createWorkoutLength(4, 'repetition'),
        [intervalStep, restStep],
        0,
        720 // 4 * (120 + 60)
      );

      const structure = createWorkoutStructure(
        [repetitionElement],
        [
          [0, 0],
          [720, 0],
        ],
        'duration',
        'percentOfThresholdPace',
        'target'
      );

      // Act
      const metrics = calculatePlannedMetrics(structure);

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.totalTimePlanned).toBeCloseTo(0.2, 3); // 720 seconds = 0.2 hours
      expect(metrics.tssPlanned).toBeGreaterThan(0);
      expect(metrics.ifPlanned).toBeGreaterThan(0);
      expect(metrics.velocityPlanned).toBeCloseTo(4.17, 2);
      expect(metrics.caloriesPlanned).toBeGreaterThan(0);
      expect(metrics.distancePlanned).toBeGreaterThan(0);
      expect(metrics.elevationGainPlanned).toBeGreaterThan(0);
      expect(metrics.energyPlanned).toBeGreaterThan(0);
    });

    it('should handle empty structure gracefully', () => {
      // Arrange
      const structure = createWorkoutStructure(
        [],
        [],
        'duration',
        'percentOfThresholdPace',
        'target'
      );

      // Act
      const metrics = calculatePlannedMetrics(structure);

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.totalTimePlanned).toBe(0);
      expect(metrics.tssPlanned).toBe(0);
      expect(metrics.ifPlanned).toBe(0);
      expect(metrics.velocityPlanned).toBeCloseTo(4.17, 2);
      expect(metrics.caloriesPlanned).toBe(0);
      expect(metrics.distancePlanned).toBe(0);
      expect(metrics.elevationGainPlanned).toBe(0);
      expect(metrics.energyPlanned).toBe(0);
    });
  });
});
