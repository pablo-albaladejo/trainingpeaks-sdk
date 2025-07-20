/**
 * WorkoutStep Value Object Tests
 * Tests for the WorkoutStep value object
 */

import { ValidationError } from '@/domain/errors';
import { WorkoutLength } from '@/domain/value-objects/workout-length';
import { WorkoutTarget } from '@/domain/value-objects/workout-target';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkoutIntensityClass, WorkoutStep } from './workout-step';

describe('WorkoutStep Value Object', () => {
  let mockLength: WorkoutLength;
  let mockTargets: WorkoutTarget[];

  beforeEach(() => {
    mockLength = WorkoutLength.create(300, 'second');
    mockTargets = [WorkoutTarget.create(60, 80, 'bpm')];
  });

  describe('create', () => {
    it('should create a workout step with valid parameters', () => {
      const step = WorkoutStep.create(
        'Warmup',
        mockLength,
        mockTargets,
        'warmUp'
      );

      expect(step).toBeInstanceOf(WorkoutStep);
      expect(step.name).toBe('Warmup');
      expect(step.length).toBe(mockLength);
      expect(step.targets).toEqual(mockTargets);
      expect(step.intensityClass).toBe('warmUp');
      expect(step.openDuration).toBe(false);
    });

    it('should create a workout step with open duration', () => {
      const step = WorkoutStep.create(
        'Interval',
        mockLength,
        mockTargets,
        'active',
        true
      );

      expect(step.openDuration).toBe(true);
    });

    it('should create a rest step without targets', () => {
      const step = WorkoutStep.create('Rest', mockLength, [], 'rest');

      expect(step.targets).toEqual([]);
      expect(step.intensityClass).toBe('rest');
    });

    it('should throw error for empty name', () => {
      expect(() =>
        WorkoutStep.create('', mockLength, mockTargets, 'active')
      ).toThrow(ValidationError);
    });

    it('should throw error for whitespace-only name', () => {
      expect(() =>
        WorkoutStep.create('   ', mockLength, mockTargets, 'active')
      ).toThrow(ValidationError);
    });

    it('should throw error for name too long', () => {
      const longName = 'a'.repeat(101);
      expect(() =>
        WorkoutStep.create(longName, mockLength, mockTargets, 'active')
      ).toThrow(ValidationError);
    });

    it('should throw error for non-array targets', () => {
      expect(() =>
        WorkoutStep.create('Test', mockLength, 'not-array' as any, 'active')
      ).toThrow(ValidationError);
    });

    it('should throw error for non-rest step with no targets', () => {
      expect(() =>
        WorkoutStep.create('Active', mockLength, [], 'active')
      ).toThrow(ValidationError);
    });

    it('should throw error for invalid intensity class', () => {
      expect(() =>
        WorkoutStep.create(
          'Test',
          mockLength,
          mockTargets,
          'invalid' as WorkoutIntensityClass
        )
      ).toThrow(ValidationError);
    });
  });

  describe('fromApiFormat', () => {
    it('should create workout step from API format', () => {
      const apiData = {
        name: 'Interval',
        length: { value: 300, unit: 'second' },
        targets: [{ minValue: 60, maxValue: 80 }],
        intensityClass: 'active' as WorkoutIntensityClass,
        openDuration: false,
      };

      const step = WorkoutStep.fromApiFormat(apiData);

      expect(step.name).toBe('Interval');
      expect(step.intensityClass).toBe('active');
      expect(step.openDuration).toBe(false);
      expect(step.targets).toHaveLength(1);
    });

    it('should create workout step with multiple targets from API format', () => {
      const apiData = {
        name: 'Complex Interval',
        length: { value: 600, unit: 'second' },
        targets: [
          { minValue: 60, maxValue: 80 },
          { minValue: 100, maxValue: 120 },
        ],
        intensityClass: 'active' as WorkoutIntensityClass,
        openDuration: true,
      };

      const step = WorkoutStep.fromApiFormat(apiData);

      expect(step.targets).toHaveLength(2);
      expect(step.openDuration).toBe(true);
    });

    it('should create rest step with no targets from API format', () => {
      const apiData = {
        name: 'Rest',
        length: { value: 60, unit: 'second' },
        targets: [],
        intensityClass: 'rest' as WorkoutIntensityClass,
        openDuration: false,
      };

      const step = WorkoutStep.fromApiFormat(apiData);

      expect(step.intensityClass).toBe('rest');
      expect(step.targets).toHaveLength(0);
    });
  });

  describe('getters', () => {
    let step: WorkoutStep;

    beforeEach(() => {
      step = WorkoutStep.create('Test', mockLength, mockTargets, 'active');
    });

    it('should return name', () => {
      expect(step.name).toBe('Test');
    });

    it('should return length', () => {
      expect(step.length).toBe(mockLength);
    });

    it('should return copy of targets to prevent mutation', () => {
      const targets = step.targets;
      expect(targets).toEqual(mockTargets);
      expect(targets).not.toBe(mockTargets); // Should be a copy
    });

    it('should return intensity class', () => {
      expect(step.intensityClass).toBe('active');
    });

    it('should return open duration', () => {
      expect(step.openDuration).toBe(false);
    });
  });

  describe('intensity check methods', () => {
    it('should correctly identify rest step', () => {
      const restStep = WorkoutStep.create('Rest', mockLength, [], 'rest');

      expect(restStep.isRest()).toBe(true);
      expect(restStep.isActive()).toBe(false);
      expect(restStep.isWarmUp()).toBe(false);
      expect(restStep.isCoolDown()).toBe(false);
    });

    it('should correctly identify active step', () => {
      const activeStep = WorkoutStep.create(
        'Interval',
        mockLength,
        mockTargets,
        'active'
      );

      expect(activeStep.isActive()).toBe(true);
      expect(activeStep.isRest()).toBe(false);
      expect(activeStep.isWarmUp()).toBe(false);
      expect(activeStep.isCoolDown()).toBe(false);
    });

    it('should correctly identify warm-up step', () => {
      const warmUpStep = WorkoutStep.create(
        'Warmup',
        mockLength,
        mockTargets,
        'warmUp'
      );

      expect(warmUpStep.isWarmUp()).toBe(true);
      expect(warmUpStep.isActive()).toBe(false);
      expect(warmUpStep.isRest()).toBe(false);
      expect(warmUpStep.isCoolDown()).toBe(false);
    });

    it('should correctly identify cool-down step', () => {
      const coolDownStep = WorkoutStep.create(
        'Cooldown',
        mockLength,
        mockTargets,
        'coolDown'
      );

      expect(coolDownStep.isCoolDown()).toBe(true);
      expect(coolDownStep.isActive()).toBe(false);
      expect(coolDownStep.isRest()).toBe(false);
      expect(coolDownStep.isWarmUp()).toBe(false);
    });
  });

  describe('getPrimaryTarget', () => {
    it('should return first target when targets exist', () => {
      const targets = [
        WorkoutTarget.create(60, 80, 'bpm'),
        WorkoutTarget.create(100, 120, 'watts'),
      ];
      const step = WorkoutStep.create('Test', mockLength, targets, 'active');

      const primaryTarget = step.getPrimaryTarget();

      expect(primaryTarget).toBe(targets[0]);
    });

    it('should return null when no targets exist', () => {
      const step = WorkoutStep.create('Rest', mockLength, [], 'rest');

      const primaryTarget = step.getPrimaryTarget();

      expect(primaryTarget).toBeNull();
    });

    it('should handle empty targets array gracefully', () => {
      const step = WorkoutStep.create('Rest', mockLength, [], 'rest');

      const primaryTarget = step.getPrimaryTarget();

      expect(primaryTarget).toBeNull();
    });
  });

  describe('getDurationInSeconds', () => {
    it('should return duration in seconds when length is time-based', () => {
      const timeLength = WorkoutLength.create(300, 'second');
      const step = WorkoutStep.create(
        'Test',
        timeLength,
        mockTargets,
        'active'
      );

      expect(step.getDurationInSeconds()).toBe(300);
    });

    it('should return null when length is not time-based', () => {
      const distanceLength = WorkoutLength.create(1000, 'meter');
      const step = WorkoutStep.create(
        'Test',
        distanceLength,
        mockTargets,
        'active'
      );

      expect(step.getDurationInSeconds()).toBeNull();
    });
  });

  describe('getDistanceInMeters', () => {
    it('should return distance in meters when length is distance-based', () => {
      const distanceLength = WorkoutLength.create(1000, 'meter');
      const step = WorkoutStep.create(
        'Test',
        distanceLength,
        mockTargets,
        'active'
      );

      expect(step.getDistanceInMeters()).toBe(1000);
    });

    it('should return null when length is not distance-based', () => {
      const timeLength = WorkoutLength.create(300, 'second');
      const step = WorkoutStep.create(
        'Test',
        timeLength,
        mockTargets,
        'active'
      );

      expect(step.getDistanceInMeters()).toBeNull();
    });
  });

  describe('toApiFormat', () => {
    it('should convert to API format correctly', () => {
      const step = WorkoutStep.create(
        'Interval',
        mockLength,
        mockTargets,
        'active',
        true
      );

      const apiFormat = step.toApiFormat();

      expect(apiFormat).toEqual({
        name: 'Interval',
        length: mockLength.toApiFormat(),
        targets: mockTargets.map((target) => target.toApiFormat()),
        intensityClass: 'active',
        openDuration: true,
      });
    });

    it('should convert rest step with no targets to API format', () => {
      const restStep = WorkoutStep.create('Rest', mockLength, [], 'rest');

      const apiFormat = restStep.toApiFormat();

      expect(apiFormat.targets).toEqual([]);
      expect(apiFormat.intensityClass).toBe('rest');
    });

    it('should convert step with multiple targets to API format', () => {
      const targets = [
        WorkoutTarget.create(60, 80, 'bpm'),
        WorkoutTarget.create(100, 120, 'watts'),
      ];
      const step = WorkoutStep.create('Complex', mockLength, targets, 'active');

      const apiFormat = step.toApiFormat();

      expect(apiFormat.targets).toHaveLength(2);
    });
  });

  describe('equals', () => {
    let step1: WorkoutStep;
    let step2: WorkoutStep;

    beforeEach(() => {
      step1 = WorkoutStep.create(
        'Test',
        mockLength,
        mockTargets,
        'active',
        false
      );
      step2 = WorkoutStep.create(
        'Test',
        mockLength,
        mockTargets,
        'active',
        false
      );
    });

    it('should return true for identical steps', () => {
      expect(step1.equals(step2)).toBe(true);
    });

    it('should return false for different names', () => {
      const differentName = WorkoutStep.create(
        'Different',
        mockLength,
        mockTargets,
        'active',
        false
      );
      expect(step1.equals(differentName)).toBe(false);
    });

    it('should return false for different lengths', () => {
      const differentLength = WorkoutLength.create(600, 'second');
      const differentLengthStep = WorkoutStep.create(
        'Test',
        differentLength,
        mockTargets,
        'active',
        false
      );
      expect(step1.equals(differentLengthStep)).toBe(false);
    });

    it('should return false for different intensity classes', () => {
      const differentIntensity = WorkoutStep.create(
        'Test',
        mockLength,
        mockTargets,
        'rest',
        false
      );
      expect(step1.equals(differentIntensity)).toBe(false);
    });

    it('should return false for different open duration', () => {
      const differentOpenDuration = WorkoutStep.create(
        'Test',
        mockLength,
        mockTargets,
        'active',
        true
      );
      expect(step1.equals(differentOpenDuration)).toBe(false);
    });

    it('should return false for different number of targets', () => {
      const moreTargets = [
        ...mockTargets,
        WorkoutTarget.create(100, 120, 'watts'),
      ];
      const differentTargetsStep = WorkoutStep.create(
        'Test',
        mockLength,
        moreTargets,
        'active',
        false
      );
      expect(step1.equals(differentTargetsStep)).toBe(false);
    });

    it('should return false for different targets', () => {
      const differentTargets = [WorkoutTarget.create(100, 120, 'watts')];
      const differentTargetsStep = WorkoutStep.create(
        'Test',
        mockLength,
        differentTargets,
        'active',
        false
      );
      expect(step1.equals(differentTargetsStep)).toBe(false);
    });

    it('should handle steps with no targets', () => {
      const stepWithNoTargets = WorkoutStep.create(
        'Rest',
        mockLength,
        [],
        'rest'
      );
      const anotherStepWithNoTargets = WorkoutStep.create(
        'Rest',
        mockLength,
        [],
        'rest'
      );

      expect(stepWithNoTargets.equals(anotherStepWithNoTargets)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should create string representation with duration', () => {
      const timeLength = WorkoutLength.create(300, 'second');
      const step = WorkoutStep.create(
        'Interval',
        timeLength,
        mockTargets,
        'active'
      );

      const result = step.toString();

      expect(result).toContain('300s');
      expect(result).toContain('Interval');
    });

    it('should create string representation with distance', () => {
      const distanceLength = WorkoutLength.create(1000, 'meter');
      const step = WorkoutStep.create(
        'Run',
        distanceLength,
        mockTargets,
        'active'
      );

      const result = step.toString();

      expect(result).toContain('1000m');
      expect(result).toContain('Run');
    });

    it('should create string representation without targets', () => {
      const step = WorkoutStep.create('Rest', mockLength, [], 'rest');

      const result = step.toString();

      expect(result).toContain('Rest');
      expect(result).not.toContain('targets');
    });

    it('should create string representation with multiple targets', () => {
      const targets = [
        WorkoutTarget.create(60, 80, 'bpm'),
        WorkoutTarget.create(100, 120, 'watts'),
      ];
      const step = WorkoutStep.create('Complex', mockLength, targets, 'active');

      const result = step.toString();

      expect(result).toContain('Complex');
      expect(result).toContain('60-80, 100-120');
    });

    it('should fallback to length toString when no duration or distance', () => {
      // Use a real WorkoutLength with repetition unit
      const repetitionLength = WorkoutLength.create(5, 'repetition');

      const step = WorkoutStep.create(
        'Test',
        repetitionLength,
        mockTargets,
        'active'
      );

      const result = step.toString();

      expect(result).toContain('5 repetitions');
    });
  });

  describe('withName', () => {
    it('should create new step with updated name', () => {
      const originalStep = WorkoutStep.create(
        'Original',
        mockLength,
        mockTargets,
        'active'
      );

      const updatedStep = originalStep.withName('Updated');

      expect(updatedStep.name).toBe('Updated');
      expect(updatedStep).not.toBe(originalStep); // Should be immutable
      expect(originalStep.name).toBe('Original'); // Original unchanged
    });

    it('should validate the new name', () => {
      const step = WorkoutStep.create(
        'Test',
        mockLength,
        mockTargets,
        'active'
      );

      expect(() => step.withName('')).toThrow(ValidationError);
    });
  });

  describe('withLength', () => {
    it('should create new step with updated length', () => {
      const originalStep = WorkoutStep.create(
        'Test',
        mockLength,
        mockTargets,
        'active'
      );
      const newLength = WorkoutLength.create(600, 'second');

      const updatedStep = originalStep.withLength(newLength);

      expect(updatedStep.length).toBe(newLength);
      expect(updatedStep).not.toBe(originalStep); // Should be immutable
      expect(originalStep.length).toBe(mockLength); // Original unchanged
    });
  });

  describe('withTargets', () => {
    it('should create new step with updated targets', () => {
      const originalStep = WorkoutStep.create(
        'Test',
        mockLength,
        mockTargets,
        'active'
      );
      const newTargets = [WorkoutTarget.create(100, 120, 'watts')];

      const updatedStep = originalStep.withTargets(newTargets);

      expect(updatedStep.targets).toEqual(newTargets);
      expect(updatedStep).not.toBe(originalStep); // Should be immutable
      expect(originalStep.targets).toEqual(mockTargets); // Original unchanged
    });

    it('should validate the new targets', () => {
      const step = WorkoutStep.create(
        'Test',
        mockLength,
        mockTargets,
        'active'
      );

      // Non-rest step with no targets should throw
      expect(() => step.withTargets([])).toThrow(ValidationError);
    });

    it('should allow empty targets for rest step', () => {
      const restStep = WorkoutStep.create('Rest', mockLength, [], 'rest');

      const updatedStep = restStep.withTargets([]);

      expect(updatedStep.targets).toEqual([]);
      expect(updatedStep.intensityClass).toBe('rest');
    });
  });

  describe('withIntensityClass', () => {
    it('should create new step with updated intensity class', () => {
      const originalStep = WorkoutStep.create(
        'Test',
        mockLength,
        mockTargets,
        'active'
      );

      const updatedStep = originalStep.withIntensityClass('warmUp');

      expect(updatedStep.intensityClass).toBe('warmUp');
      expect(updatedStep).not.toBe(originalStep); // Should be immutable
      expect(originalStep.intensityClass).toBe('active'); // Original unchanged
    });

    it('should validate the new intensity class', () => {
      const step = WorkoutStep.create(
        'Test',
        mockLength,
        mockTargets,
        'active'
      );

      expect(() =>
        step.withIntensityClass('invalid' as WorkoutIntensityClass)
      ).toThrow(ValidationError);
    });

    it('should allow changing to rest with existing targets', () => {
      const step = WorkoutStep.create(
        'Test',
        mockLength,
        mockTargets,
        'active'
      );

      // This should be allowed - validation only checks for empty targets on non-rest steps
      const updatedStep = step.withIntensityClass('rest');

      expect(updatedStep.intensityClass).toBe('rest');
      expect(updatedStep.targets).toEqual(mockTargets);
    });
  });

  describe('edge cases and validation', () => {
    it('should handle maximum length name', () => {
      const maxName = 'a'.repeat(100); // Exactly 100 characters

      const step = WorkoutStep.create(
        maxName,
        mockLength,
        mockTargets,
        'active'
      );

      expect(step.name).toBe(maxName);
    });

    it('should handle step with single character name', () => {
      const step = WorkoutStep.create('A', mockLength, mockTargets, 'active');

      expect(step.name).toBe('A');
    });

    it('should handle multiple intensity class combinations', () => {
      const intensityClasses: WorkoutIntensityClass[] = [
        'active',
        'rest',
        'warmUp',
        'coolDown',
      ];

      intensityClasses.forEach((intensity) => {
        const targets = intensity === 'rest' ? [] : mockTargets;
        const step = WorkoutStep.create(
          `Test ${intensity}`,
          mockLength,
          targets,
          intensity
        );

        expect(step.intensityClass).toBe(intensity);
      });
    });

    it('should preserve immutability of targets array', () => {
      const originalTargets = [...mockTargets];
      const step = WorkoutStep.create(
        'Test',
        mockLength,
        mockTargets,
        'active'
      );

      // Get targets and try to modify them
      const targets = step.targets;
      targets.push(WorkoutTarget.create(100, 120, 'watts'));

      // Original step targets should remain unchanged
      expect(step.targets).toEqual(originalTargets);
    });
  });

  describe('complex integration scenarios', () => {
    it('should handle complex workout step with all features', () => {
      const targets = [
        WorkoutTarget.create(60, 80, 'bpm'),
        WorkoutTarget.create(100, 150, 'watts'),
        WorkoutTarget.create(15, 20, 'mph'),
      ];
      const length = WorkoutLength.create(1200, 'second');
      const step = WorkoutStep.create(
        'Complex Interval',
        length,
        targets,
        'active',
        true
      );

      expect(step.name).toBe('Complex Interval');
      expect(step.length).toBe(length);
      expect(step.targets).toHaveLength(3);
      expect(step.intensityClass).toBe('active');
      expect(step.openDuration).toBe(true);
      expect(step.getDurationInSeconds()).toBe(1200);
      expect(step.getDistanceInMeters()).toBeNull();
    });

    it('should support round-trip API format conversion', () => {
      const originalStep = WorkoutStep.create(
        'Test',
        mockLength,
        mockTargets,
        'active',
        true
      );

      const apiFormat = originalStep.toApiFormat();
      const reconstructedStep = WorkoutStep.fromApiFormat(apiFormat);

      expect(reconstructedStep.equals(originalStep)).toBe(true);
    });
  });
});
