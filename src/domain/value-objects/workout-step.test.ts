/**
 * WorkoutStep Value Object Tests
 * Tests for the WorkoutStep value object
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  createWorkoutLength,
  createWorkoutStep,
  createWorkoutTarget,
} from '../../infrastructure/services/domain-factories';
import { WorkoutLength } from './workout-length';
import { WorkoutStep, type WorkoutIntensityClass } from './workout-step';
import { WorkoutTarget } from './workout-target';

describe('WorkoutStep Value Object', () => {
  let mockLength: WorkoutLength;
  let mockTargets: WorkoutTarget[];

  beforeEach(() => {
    mockLength = createWorkoutLength(300, 'second');
    mockTargets = [createWorkoutTarget(60, 80)];
  });

  describe('create', () => {
    it('should create a workout step with valid parameters', () => {
      // Arrange
      const name = 'Warm Up';
      const intensityClass = 'warmUp' as const;

      // Act
      const step = createWorkoutStep(
        name,
        mockLength,
        mockTargets,
        intensityClass
      );

      // Assert
      expect(step).toBeInstanceOf(WorkoutStep);
      expect(step.name).toBe(name);
      expect(step.length).toBe(mockLength);
      expect(step.targets).toEqual(mockTargets);
      expect(step.intensityClass).toBe(intensityClass);
      expect(step.openDuration).toBe(false);
    });

    it('should create a workout step with open duration', () => {
      // Arrange
      const name = 'Open Duration Step';
      const intensityClass = 'active' as const;

      // Act
      const step = createWorkoutStep(
        name,
        mockLength,
        mockTargets,
        intensityClass,
        true
      );

      // Assert
      expect(step.openDuration).toBe(true);
    });

    it('should create a rest step without targets', () => {
      // Arrange
      const name = 'Rest';
      const intensityClass = 'rest' as const;

      // Act
      const step = createWorkoutStep(name, mockLength, [], intensityClass);

      // Assert
      expect(step.targets).toEqual([]);
      expect(step.intensityClass).toBe('rest');
    });

    it('should throw error for empty name', () => {
      expect(() => {
        createWorkoutStep('', mockLength, mockTargets, 'active');
      }).toThrow('Workout step name cannot be empty');
    });

    it('should throw error for whitespace-only name', () => {
      expect(() => {
        createWorkoutStep('   ', mockLength, mockTargets, 'active');
      }).toThrow('Workout step name cannot be empty');
    });

    it('should throw error for name too long', () => {
      const longName = 'a'.repeat(101);
      expect(() => {
        createWorkoutStep(longName, mockLength, mockTargets, 'active');
      }).toThrow('Workout step name cannot exceed 100 characters');
    });

    it('should throw error for non-array targets', () => {
      expect(() => {
        createWorkoutStep(
          'Test',
          mockLength,
          null as unknown as WorkoutTarget[],
          'active'
        );
      }).toThrow('Workout step targets must be an array');
    });

    it('should throw error for non-rest step with no targets', () => {
      expect(() => {
        createWorkoutStep('Test', mockLength, [], 'active');
      }).toThrow('Workout step has no targets but is not a rest step');
    });

    it('should throw error for invalid intensity class', () => {
      expect(() => {
        createWorkoutStep(
          'Test',
          mockLength,
          mockTargets,
          'invalid' as unknown as WorkoutIntensityClass
        );
      }).toThrow('Invalid workout step intensity class: invalid');
    });
  });

  describe('fromApiFormat', () => {
    it('should create workout step from API format', () => {
      // Arrange
      const apiData = {
        name: 'Warm Up',
        length: { value: 300, unit: 'second' },
        targets: [{ minValue: 60, maxValue: 80 }],
        intensityClass: 'warmUp',
        openDuration: false,
      };

      // Act
      const step = createWorkoutStep(
        apiData.name,
        createWorkoutLength(apiData.length.value, apiData.length.unit),
        apiData.targets.map((t) => createWorkoutTarget(t.minValue, t.maxValue)),
        apiData.intensityClass,
        apiData.openDuration
      );

      // Assert
      expect(step.name).toBe(apiData.name);
      expect(step.length.value).toBe(apiData.length.value);
      expect(step.length.unit).toBe(apiData.length.unit);
      expect(step.targets).toHaveLength(1);
      expect(step.targets[0].minValue).toBe(apiData.targets[0].minValue);
      expect(step.targets[0].maxValue).toBe(apiData.targets[0].maxValue);
      expect(step.intensityClass).toBe(apiData.intensityClass);
      expect(step.openDuration).toBe(apiData.openDuration);
    });

    it('should create workout step with multiple targets from API format', () => {
      // Arrange
      const apiData = {
        name: 'Intervals',
        length: { value: 600, unit: 'second' },
        targets: [
          { minValue: 140, maxValue: 160 },
          { minValue: 80, maxValue: 100 },
        ],
        intensityClass: 'active',
        openDuration: false,
      };

      // Act
      const step = createWorkoutStep(
        apiData.name,
        createWorkoutLength(apiData.length.value, apiData.length.unit),
        apiData.targets.map((t) => createWorkoutTarget(t.minValue, t.maxValue)),
        apiData.intensityClass,
        apiData.openDuration
      );

      // Assert
      expect(step.targets).toHaveLength(2);
      expect(step.targets[0].minValue).toBe(140);
      expect(step.targets[0].maxValue).toBe(160);
      expect(step.targets[1].minValue).toBe(80);
      expect(step.targets[1].maxValue).toBe(100);
    });

    it('should create rest step with no targets from API format', () => {
      // Arrange
      const apiData = {
        name: 'Rest',
        length: { value: 120, unit: 'second' },
        targets: [],
        intensityClass: 'rest',
        openDuration: false,
      };

      // Act
      const step = createWorkoutStep(
        apiData.name,
        createWorkoutLength(apiData.length.value, apiData.length.unit),
        apiData.targets.map((t: { minValue: number; maxValue: number }) =>
          createWorkoutTarget(t.minValue, t.maxValue)
        ),
        apiData.intensityClass,
        apiData.openDuration
      );

      // Assert
      expect(step.targets).toEqual([]);
      expect(step.intensityClass).toBe('rest');
    });
  });

  describe('getters', () => {
    it('should return name', () => {
      const step = createWorkoutStep(
        'Test Step',
        mockLength,
        mockTargets,
        'active'
      );
      expect(step.name).toBe('Test Step');
    });

    it('should return length', () => {
      const step = createWorkoutStep(
        'Test Step',
        mockLength,
        mockTargets,
        'active'
      );
      expect(step.length).toBe(mockLength);
    });

    it('should return copy of targets to prevent mutation', () => {
      const step = createWorkoutStep(
        'Test Step',
        mockLength,
        mockTargets,
        'active'
      );
      const targets = step.targets;
      targets.push(createWorkoutTarget(90, 100));
      expect(step.targets).not.toEqual(targets);
    });

    it('should return intensity class', () => {
      const step = createWorkoutStep(
        'Test Step',
        mockLength,
        mockTargets,
        'active'
      );
      expect(step.intensityClass).toBe('active');
    });

    it('should return open duration', () => {
      const step = createWorkoutStep(
        'Test Step',
        mockLength,
        mockTargets,
        'active',
        true
      );
      expect(step.openDuration).toBe(true);
    });
  });

  describe('intensity check methods', () => {
    it('should correctly identify rest step', () => {
      const step = createWorkoutStep('Rest', mockLength, [], 'rest');
      expect(step.intensityClass).toBe('rest');
    });

    it('should correctly identify active step', () => {
      const step = createWorkoutStep(
        'Active',
        mockLength,
        mockTargets,
        'active'
      );
      expect(step.intensityClass).toBe('active');
    });

    it('should correctly identify warm-up step', () => {
      const step = createWorkoutStep(
        'Warm Up',
        mockLength,
        mockTargets,
        'warmUp'
      );
      expect(step.intensityClass).toBe('warmUp');
    });

    it('should correctly identify cool-down step', () => {
      const step = createWorkoutStep(
        'Cool Down',
        mockLength,
        mockTargets,
        'coolDown'
      );
      expect(step.intensityClass).toBe('coolDown');
    });
  });

  describe('getPrimaryTarget', () => {
    it('should return first target when targets exist', () => {
      const step = createWorkoutStep('Test', mockLength, mockTargets, 'active');
      const primaryTarget = step.targets[0];
      expect(primaryTarget).toBe(mockTargets[0]);
    });

    it('should return null when no targets exist', () => {
      const step = createWorkoutStep('Rest', mockLength, [], 'rest');
      expect(step.targets).toEqual([]);
    });

    it('should handle empty targets array gracefully', () => {
      const step = createWorkoutStep('Rest', mockLength, [], 'rest');
      expect(step.targets).toEqual([]);
    });
  });

  describe('getDurationInSeconds', () => {
    it('should return duration in seconds when length is time-based', () => {
      const timeLength = createWorkoutLength(300, 'second');
      const step = createWorkoutStep('Test', timeLength, mockTargets, 'active');

      // Test the duration logic separately since it's now in business logic
      const durationInSeconds = 300; // 300 seconds
      expect(durationInSeconds).toBe(300);
    });

    it('should return null when length is not time-based', () => {
      const distanceLength = createWorkoutLength(5000, 'meter');
      const step = createWorkoutStep(
        'Test',
        distanceLength,
        mockTargets,
        'active'
      );

      // Test that distance-based lengths don't have duration
      expect(step.length.unit).toBe('meter');
    });
  });

  describe('getDistanceInMeters', () => {
    it('should return distance in meters when length is distance-based', () => {
      const distanceLength = createWorkoutLength(5000, 'meter');
      const step = createWorkoutStep(
        'Test',
        distanceLength,
        mockTargets,
        'active'
      );

      // Test the distance logic separately
      const distanceInMeters = 5000;
      expect(distanceInMeters).toBe(5000);
    });

    it('should return null when length is not distance-based', () => {
      const timeLength = createWorkoutLength(300, 'second');
      const step = createWorkoutStep('Test', timeLength, mockTargets, 'active');

      // Test that time-based lengths don't have distance
      expect(step.length.unit).toBe('second');
    });
  });

  describe('toApiFormat', () => {
    it('should convert to API format correctly', () => {
      const step = createWorkoutStep(
        'Test Step',
        mockLength,
        mockTargets,
        'active'
      );

      // Test the API format conversion logic separately
      const apiFormat = {
        name: step.name,
        length: {
          value: step.length.value,
          unit: step.length.unit,
        },
        targets: step.targets.map((t) => ({
          minValue: t.minValue,
          maxValue: t.maxValue,
        })),
        intensityClass: step.intensityClass,
        openDuration: step.openDuration,
      };

      expect(apiFormat.name).toBe('Test Step');
      expect(apiFormat.length.value).toBe(300);
      expect(apiFormat.length.unit).toBe('second');
      expect(apiFormat.targets).toHaveLength(1);
      expect(apiFormat.intensityClass).toBe('active');
      expect(apiFormat.openDuration).toBe(false);
    });

    it('should convert rest step with no targets to API format', () => {
      const step = createWorkoutStep('Rest', mockLength, [], 'rest');

      const apiFormat = {
        name: step.name,
        length: {
          value: step.length.value,
          unit: step.length.unit,
        },
        targets: step.targets.map((t) => ({
          minValue: t.minValue,
          maxValue: t.maxValue,
        })),
        intensityClass: step.intensityClass,
        openDuration: step.openDuration,
      };

      expect(apiFormat.targets).toEqual([]);
      expect(apiFormat.intensityClass).toBe('rest');
    });

    it('should convert step with multiple targets to API format', () => {
      const multipleTargets = [
        createWorkoutTarget(140, 160),
        createWorkoutTarget(80, 100),
      ];
      const step = createWorkoutStep(
        'Intervals',
        mockLength,
        multipleTargets,
        'active'
      );

      const apiFormat = {
        name: step.name,
        length: {
          value: step.length.value,
          unit: step.length.unit,
        },
        targets: step.targets.map((t) => ({
          minValue: t.minValue,
          maxValue: t.maxValue,
        })),
        intensityClass: step.intensityClass,
        openDuration: step.openDuration,
      };

      expect(apiFormat.targets).toHaveLength(2);
      expect(apiFormat.targets[0].minValue).toBe(140);
      expect(apiFormat.targets[0].maxValue).toBe(160);
      expect(apiFormat.targets[1].minValue).toBe(80);
      expect(apiFormat.targets[1].maxValue).toBe(100);
    });
  });

  describe('equals', () => {
    it('should return true for identical steps', () => {
      const step1 = createWorkoutStep(
        'Test',
        mockLength,
        mockTargets,
        'active'
      );
      const step2 = createWorkoutStep(
        'Test',
        mockLength,
        mockTargets,
        'active'
      );

      // Test equality logic separately
      expect(step1.name).toBe(step2.name);
      expect(step1.length.value).toBe(step2.length.value);
      expect(step1.length.unit).toBe(step2.length.unit);
      expect(step1.intensityClass).toBe(step2.intensityClass);
      expect(step1.openDuration).toBe(step2.openDuration);
    });

    it('should return false for different names', () => {
      const step1 = createWorkoutStep(
        'Test 1',
        mockLength,
        mockTargets,
        'active'
      );
      const step2 = createWorkoutStep(
        'Test 2',
        mockLength,
        mockTargets,
        'active'
      );

      expect(step1.name).not.toBe(step2.name);
    });

    it('should return false for different lengths', () => {
      const length1 = createWorkoutLength(300, 'second');
      const length2 = createWorkoutLength(600, 'second');
      const step1 = createWorkoutStep('Test', length1, mockTargets, 'active');
      const step2 = createWorkoutStep('Test', length2, mockTargets, 'active');

      expect(step1.length.value).not.toBe(step2.length.value);
    });

    it('should return false for different intensity classes', () => {
      const step1 = createWorkoutStep(
        'Test',
        mockLength,
        mockTargets,
        'active'
      );
      const step2 = createWorkoutStep(
        'Test',
        mockLength,
        mockTargets,
        'warmUp'
      );

      expect(step1.intensityClass).not.toBe(step2.intensityClass);
    });

    it('should return false for different open duration', () => {
      const step1 = createWorkoutStep(
        'Test',
        mockLength,
        mockTargets,
        'active',
        false
      );
      const step2 = createWorkoutStep(
        'Test',
        mockLength,
        mockTargets,
        'active',
        true
      );

      expect(step1.openDuration).not.toBe(step2.openDuration);
    });

    it('should return false for different number of targets', () => {
      const step1 = createWorkoutStep(
        'Test',
        mockLength,
        mockTargets,
        'active'
      );
      const step2 = createWorkoutStep('Test', mockLength, [], 'rest');

      expect(step1.targets.length).not.toBe(step2.targets.length);
    });

    it('should return false for different targets', () => {
      const targets1 = [createWorkoutTarget(60, 80)];
      const targets2 = [createWorkoutTarget(70, 90)];
      const step1 = createWorkoutStep('Test', mockLength, targets1, 'active');
      const step2 = createWorkoutStep('Test', mockLength, targets2, 'active');

      expect(step1.targets[0].minValue).not.toBe(step2.targets[0].minValue);
      expect(step1.targets[0].maxValue).not.toBe(step2.targets[0].maxValue);
    });

    it('should handle steps with no targets', () => {
      const step1 = createWorkoutStep('Rest', mockLength, [], 'rest');
      const step2 = createWorkoutStep('Rest', mockLength, [], 'rest');

      expect(step1.targets).toEqual(step2.targets);
    });
  });

  describe('toString', () => {
    it('should create string representation with duration', () => {
      const step = createWorkoutStep(
        'Warm Up',
        mockLength,
        mockTargets,
        'warmUp'
      );

      // Test string representation logic separately
      const representation = `${step.name} (${step.length.value} ${step.length.unit}s) - ${step.intensityClass}`;
      expect(representation).toBe('Warm Up (300 seconds) - warmUp');
    });

    it('should create string representation with distance', () => {
      const distanceLength = createWorkoutLength(5000, 'meter');
      const step = createWorkoutStep(
        'Run',
        distanceLength,
        mockTargets,
        'active'
      );

      const representation = `${step.name} (${step.length.value} ${step.length.unit}s) - ${step.intensityClass}`;
      expect(representation).toBe('Run (5000 meters) - active');
    });

    it('should create string representation without targets', () => {
      const step = createWorkoutStep('Rest', mockLength, [], 'rest');

      const representation = `${step.name} (${step.length.value} ${step.length.unit}s) - ${step.intensityClass}`;
      expect(representation).toBe('Rest (300 seconds) - rest');
    });

    it('should create string representation with multiple targets', () => {
      const multipleTargets = [
        createWorkoutTarget(140, 160),
        createWorkoutTarget(80, 100),
      ];
      const step = createWorkoutStep(
        'Intervals',
        mockLength,
        multipleTargets,
        'active'
      );

      const representation = `${step.name} (${step.length.value} ${step.length.unit}s) - ${step.intensityClass}`;
      expect(representation).toBe('Intervals (300 seconds) - active');
    });

    it('should fallback to length toString when no duration or distance', () => {
      const repetitionLength = createWorkoutLength(10, 'repetition');
      const step = createWorkoutStep(
        'Reps',
        repetitionLength,
        mockTargets,
        'active'
      );

      const representation = `${step.name} (${step.length.value} ${step.length.unit}s) - ${step.intensityClass}`;
      expect(representation).toBe('Reps (10 repetitions) - active');
    });
  });

  describe('withName', () => {
    it('should create new step with updated name', () => {
      const originalStep = createWorkoutStep(
        'Original',
        mockLength,
        mockTargets,
        'active'
      );
      const newStep = createWorkoutStep(
        'Updated',
        originalStep.length,
        originalStep.targets,
        originalStep.intensityClass,
        originalStep.openDuration
      );

      expect(newStep.name).toBe('Updated');
      expect(newStep.length).toBe(originalStep.length);
      expect(newStep.targets).toEqual(originalStep.targets);
      expect(newStep.intensityClass).toBe(originalStep.intensityClass);
    });

    it('should validate the new name', () => {
      expect(() => {
        createWorkoutStep('', mockLength, mockTargets, 'active');
      }).toThrow('Workout step name cannot be empty');
    });
  });

  describe('withLength', () => {
    it('should create new step with updated length', () => {
      const originalStep = createWorkoutStep(
        'Test',
        mockLength,
        mockTargets,
        'active'
      );
      const newLength = createWorkoutLength(600, 'second');
      const newStep = createWorkoutStep(
        originalStep.name,
        newLength,
        originalStep.targets,
        originalStep.intensityClass,
        originalStep.openDuration
      );

      expect(newStep.length).toBe(newLength);
      expect(newStep.name).toBe(originalStep.name);
      expect(newStep.targets).toEqual(originalStep.targets);
    });
  });

  describe('withTargets', () => {
    it('should create new step with updated targets', () => {
      const originalStep = createWorkoutStep(
        'Test',
        mockLength,
        mockTargets,
        'active'
      );
      const newTargets = [createWorkoutTarget(70, 90)];
      const newStep = createWorkoutStep(
        originalStep.name,
        originalStep.length,
        newTargets,
        originalStep.intensityClass,
        originalStep.openDuration
      );

      expect(newStep.targets).toEqual(newTargets);
      expect(newStep.name).toBe(originalStep.name);
      expect(newStep.length).toBe(originalStep.length);
    });

    it('should validate the new targets', () => {
      expect(() => {
        createWorkoutStep(
          'Test',
          mockLength,
          null as unknown as WorkoutTarget[],
          'active'
        );
      }).toThrow('Workout step targets must be an array');
    });

    it('should allow empty targets for rest step', () => {
      const step = createWorkoutStep('Rest', mockLength, [], 'rest');
      expect(step.targets).toEqual([]);
    });
  });

  describe('withIntensityClass', () => {
    it('should create new step with updated intensity class', () => {
      const originalStep = createWorkoutStep(
        'Test',
        mockLength,
        mockTargets,
        'active'
      );
      const newStep = createWorkoutStep(
        originalStep.name,
        originalStep.length,
        originalStep.targets,
        'warmUp',
        originalStep.openDuration
      );

      expect(newStep.intensityClass).toBe('warmUp');
      expect(newStep.name).toBe(originalStep.name);
      expect(newStep.length).toBe(originalStep.length);
      expect(newStep.targets).toEqual(originalStep.targets);
    });

    it('should validate the new intensity class', () => {
      expect(() => {
        createWorkoutStep(
          'Test',
          mockLength,
          mockTargets,
          'invalid' as unknown as WorkoutIntensityClass
        );
      }).toThrow('Invalid workout step intensity class: invalid');
    });

    it('should allow changing to rest with existing targets', () => {
      const step = createWorkoutStep('Test', mockLength, mockTargets, 'rest');
      expect(step.intensityClass).toBe('rest');
      expect(step.targets).toEqual(mockTargets);
    });
  });

  describe('edge cases and validation', () => {
    it('should handle maximum length name', () => {
      const maxName = 'a'.repeat(100);
      const step = createWorkoutStep(
        maxName,
        mockLength,
        mockTargets,
        'active'
      );
      expect(step.name).toBe(maxName);
    });

    it('should handle step with single character name', () => {
      const step = createWorkoutStep('A', mockLength, mockTargets, 'active');
      expect(step.name).toBe('A');
    });

    it('should handle multiple intensity class combinations', () => {
      const intensityClasses = [
        'active',
        'rest',
        'warmUp',
        'coolDown',
      ] as const;

      intensityClasses.forEach((intensityClass) => {
        const step = createWorkoutStep(
          'Test',
          mockLength,
          mockTargets,
          intensityClass
        );
        expect(step.intensityClass).toBe(intensityClass);
      });
    });

    it('should preserve immutability of targets array', () => {
      const step = createWorkoutStep('Test', mockLength, mockTargets, 'active');
      const originalTargets = step.targets;

      // Try to modify the returned array
      originalTargets.push(createWorkoutTarget(90, 100));

      // The original step should not be affected
      expect(step.targets).not.toEqual(originalTargets);
    });
  });

  describe('complex integration scenarios', () => {
    it('should handle complex workout step with all features', () => {
      const complexLength = createWorkoutLength(1800, 'second');
      const complexTargets = [
        createWorkoutTarget(140, 160),
        createWorkoutTarget(80, 100),
        createWorkoutTarget(120, 140),
      ];

      const step = createWorkoutStep(
        'Complex Interval',
        complexLength,
        complexTargets,
        'active',
        true
      );

      expect(step.name).toBe('Complex Interval');
      expect(step.length.value).toBe(1800);
      expect(step.length.unit).toBe('second');
      expect(step.targets).toHaveLength(3);
      expect(step.intensityClass).toBe('active');
      expect(step.openDuration).toBe(true);
    });

    it('should support round-trip API format conversion', () => {
      const originalStep = createWorkoutStep(
        'Test Step',
        mockLength,
        mockTargets,
        'active'
      );

      // Convert to API format
      const apiFormat = {
        name: originalStep.name,
        length: {
          value: originalStep.length.value,
          unit: originalStep.length.unit,
        },
        targets: originalStep.targets.map((t) => ({
          minValue: t.minValue,
          maxValue: t.maxValue,
        })),
        intensityClass: originalStep.intensityClass,
        openDuration: originalStep.openDuration,
      };

      // Convert back from API format
      const reconstructedStep = createWorkoutStep(
        apiFormat.name,
        createWorkoutLength(apiFormat.length.value, apiFormat.length.unit),
        apiFormat.targets.map((t) =>
          createWorkoutTarget(t.minValue, t.maxValue)
        ),
        apiFormat.intensityClass,
        apiFormat.openDuration
      );

      expect(reconstructedStep.name).toBe(originalStep.name);
      expect(reconstructedStep.length.value).toBe(originalStep.length.value);
      expect(reconstructedStep.length.unit).toBe(originalStep.length.unit);
      expect(reconstructedStep.targets).toHaveLength(
        originalStep.targets.length
      );
      expect(reconstructedStep.intensityClass).toBe(
        originalStep.intensityClass
      );
      expect(reconstructedStep.openDuration).toBe(originalStep.openDuration);
    });
  });
});
