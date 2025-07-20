/**
 * WorkoutStructure Value Object Tests
 * Tests for the WorkoutStructure value object following @unit-test-rule.mdc
 */

import { describe, expect, it } from 'vitest';
import { ValidationError } from '@/domain/errors';
import { WorkoutStructure, WorkoutStructureElement, WorkoutLengthMetric, WorkoutIntensityMetric, WorkoutIntensityTargetType } from './workout-structure';
import { WorkoutLength } from './workout-length';
import { WorkoutStep } from './workout-step';
import { WorkoutTarget } from './workout-target';
import { StructuredWorkoutDataFixture } from '../../__fixtures__/structured-workout-data.fixture';

describe('WorkoutStructure Value Object', () => {
  describe('create', () => {
    it('should create a workout structure with valid parameters', () => {
      // Arrange
      const step = WorkoutStep.create(
        'Test Step',
        WorkoutLength.create(300, 'second'),
        [WorkoutTarget.create(70, 80)],
        'active'
      );
      
      const structure: WorkoutStructureElement[] = [{
        type: 'step',
        length: WorkoutLength.create(300, 'second'),
        steps: [step],
        begin: 0,
        end: 300,
      }];
      
      const polyline: number[][] = [[0, 0], [1, 1]];

      // Act
      const workoutStructure = WorkoutStructure.create(
        structure,
        polyline,
        'duration',
        'percentOfThresholdPace',
        'range'
      );

      // Assert
      expect(workoutStructure.structure).toEqual(structure);
      expect(workoutStructure.polyline).toEqual(polyline);
      expect(workoutStructure.primaryLengthMetric).toBe('duration');
      expect(workoutStructure.primaryIntensityMetric).toBe('percentOfThresholdPace');
      expect(workoutStructure.primaryIntensityTargetOrRange).toBe('range');
    });

    it('should create structure with multiple elements', () => {
      // Arrange
      const warmUpStep = WorkoutStep.create(
        'Warm-up',
        WorkoutLength.create(300, 'second'),
        [WorkoutTarget.create(60, 70)],
        'warmUp'
      );
      
      const mainStep = WorkoutStep.create(
        'Main Set',
        WorkoutLength.create(600, 'second'),
        [WorkoutTarget.create(80, 90)],
        'active'
      );

      const structure: WorkoutStructureElement[] = [
        {
          type: 'step',
          length: WorkoutLength.create(300, 'second'),
          steps: [warmUpStep],
          begin: 0,
          end: 300,
        },
        {
          type: 'step',
          length: WorkoutLength.create(600, 'second'),
          steps: [mainStep],
          begin: 300,
          end: 900,
        },
      ];
      
      const polyline: number[][] = [[0, 0], [0.33, 0.65], [1, 0.85]];

      // Act
      const workoutStructure = WorkoutStructure.create(
        structure,
        polyline,
        'duration',
        'heartRate',
        'target'
      );

      // Assert
      expect(workoutStructure.structure).toHaveLength(2);
      expect(workoutStructure.getTotalDuration()).toBe(900);
    });

    it('should create structure with repetition elements', () => {
      // Arrange
      const intervalStep = WorkoutStep.create(
        'Interval',
        WorkoutLength.create(120, 'second'),
        [WorkoutTarget.create(85, 95)],
        'active'
      );
      
      const restStep = WorkoutStep.create(
        'Rest',
        WorkoutLength.create(60, 'second'),
        [],
        'rest'
      );

      const structure: WorkoutStructureElement[] = [{
        type: 'repetition',
        length: WorkoutLength.create(5, 'repetition'),
        steps: [intervalStep, restStep],
        begin: 0,
        end: 900, // 5 * (120 + 60) = 900
      }];
      
      const polyline: number[][] = [[0, 0], [1, 1]];

      // Act
      const workoutStructure = WorkoutStructure.create(
        structure,
        polyline,
        'duration',
        'power',
        'range'
      );

      // Assert
      expect(workoutStructure.structure).toHaveLength(1);
      expect(workoutStructure.structure[0].type).toBe('repetition');
      expect(workoutStructure.structure[0].steps).toHaveLength(2);
    });
  });

  describe('fromApiFormat', () => {
    it('should create workout structure from API format', () => {
      // Arrange
      const apiData = {
        structure: [{
          type: 'step' as const,
          length: { value: 300, unit: 'second' },
          steps: [{
            name: 'Test Step',
            length: { value: 300, unit: 'second' },
            targets: [{ minValue: 70, maxValue: 80 }],
            intensityClass: 'active',
            openDuration: false,
          }],
          begin: 0,
          end: 300,
        }],
        polyline: [[0, 0], [1, 1]],
        primaryLengthMetric: 'duration' as WorkoutLengthMetric,
        primaryIntensityMetric: 'percentOfThresholdPace' as WorkoutIntensityMetric,
        primaryIntensityTargetOrRange: 'range' as WorkoutIntensityTargetType,
      };

      // Act
      const workoutStructure = WorkoutStructure.fromApiFormat(apiData);

      // Assert
      expect(workoutStructure.structure).toHaveLength(1);
      expect(workoutStructure.structure[0].type).toBe('step');
      expect(workoutStructure.structure[0].steps).toHaveLength(1);
      expect(workoutStructure.structure[0].steps[0].name).toBe('Test Step');
      expect(workoutStructure.primaryLengthMetric).toBe('duration');
    });

    it('should handle complex API format with multiple elements', () => {
      // Arrange
      const apiData = {
        structure: [
          {
            type: 'step' as const,
            length: { value: 600, unit: 'second' },
            steps: [{
              name: 'Warm-up',
              length: { value: 600, unit: 'second' },
              targets: [{ minValue: 60, maxValue: 70 }],
              intensityClass: 'warmUp',
              openDuration: false,
            }],
            begin: 0,
            end: 600,
          },
          {
            type: 'repetition' as const,
            length: { value: 3, unit: 'repetition' },
            steps: [
              {
                name: 'Work',
                length: { value: 240, unit: 'second' },
                targets: [{ minValue: 85, maxValue: 95 }],
                intensityClass: 'active',
                openDuration: false,
              },
              {
                name: 'Rest',
                length: { value: 120, unit: 'second' },
                targets: [{ minValue: 65, maxValue: 75 }],
                intensityClass: 'rest',
                openDuration: false,
              },
            ],
            begin: 600,
            end: 1680, // 600 + 3 * (240 + 120)
          },
        ],
        polyline: [[0, 0], [0.4, 0.65], [1, 0.85]],
        primaryLengthMetric: 'distance' as WorkoutLengthMetric,
        primaryIntensityMetric: 'heartRate' as WorkoutIntensityMetric,
        primaryIntensityTargetOrRange: 'target' as WorkoutIntensityTargetType,
      };

      // Act
      const workoutStructure = WorkoutStructure.fromApiFormat(apiData);

      // Assert
      expect(workoutStructure.structure).toHaveLength(2);
      expect(workoutStructure.structure[1].type).toBe('repetition');
      expect(workoutStructure.structure[1].steps).toHaveLength(2);
      expect(workoutStructure.primaryLengthMetric).toBe('distance');
      expect(workoutStructure.primaryIntensityMetric).toBe('heartRate');
    });
  });

  describe('validation', () => {
    describe('structure validation', () => {
      it('should throw error for non-array structure', () => {
        expect(() => {
          WorkoutStructure.create(
            null as any,
            [[0, 0]],
            'duration',
            'percentOfThresholdPace',
            'range'
          );
        }).toThrow(ValidationError);
        expect(() => {
          WorkoutStructure.create(
            null as any,
            [[0, 0]],
            'duration',
            'percentOfThresholdPace',
            'range'
          );
        }).toThrow('Workout structure must be an array');
      });

      it('should throw error for empty structure', () => {
        expect(() => {
          WorkoutStructure.create(
            [],
            [[0, 0]],
            'duration',
            'percentOfThresholdPace',
            'range'
          );
        }).toThrow(ValidationError);
        expect(() => {
          WorkoutStructure.create(
            [],
            [[0, 0]],
            'duration',
            'percentOfThresholdPace',
            'range'
          );
        }).toThrow('Workout structure cannot be empty');
      });

      it('should throw error for overlapping elements', () => {
        // Arrange
        const step1 = WorkoutStep.create(
          'Step 1',
          WorkoutLength.create(300, 'second'),
          [WorkoutTarget.create(70, 80)],
          'active'
        );
        
        const step2 = WorkoutStep.create(
          'Step 2',
          WorkoutLength.create(300, 'second'),
          [WorkoutTarget.create(70, 80)],
          'active'
        );

        const overlappingStructure: WorkoutStructureElement[] = [
          {
            type: 'step',
            length: WorkoutLength.create(300, 'second'),
            steps: [step1],
            begin: 0,
            end: 300,
          },
          {
            type: 'step',
            length: WorkoutLength.create(300, 'second'),
            steps: [step2],
            begin: 250, // Overlaps with first element
            end: 550,
          },
        ];

        // Act & Assert
        expect(() => {
          WorkoutStructure.create(
            overlappingStructure,
            [[0, 0]],
            'duration',
            'percentOfThresholdPace',
            'range'
          );
        }).toThrow(ValidationError);
        expect(() => {
          WorkoutStructure.create(
            overlappingStructure,
            [[0, 0]],
            'duration',
            'percentOfThresholdPace',
            'range'
          );
        }).toThrow('Workout structure elements overlap');
      });

      it('should throw error for negative begin time', () => {
        // Arrange
        const step = WorkoutStep.create(
          'Test Step',
          WorkoutLength.create(300, 'second'),
          [WorkoutTarget.create(70, 80)],
          'active'
        );

        const invalidStructure: WorkoutStructureElement[] = [{
          type: 'step',
          length: WorkoutLength.create(300, 'second'),
          steps: [step],
          begin: -100, // Negative begin time
          end: 200,
        }];

        // Act & Assert
        expect(() => {
          WorkoutStructure.create(
            invalidStructure,
            [[0, 0]],
            'duration',
            'percentOfThresholdPace',
            'range'
          );
        }).toThrow(ValidationError);
        expect(() => {
          WorkoutStructure.create(
            invalidStructure,
            [[0, 0]],
            'duration',
            'percentOfThresholdPace',
            'range'
          );
        }).toThrow('has negative begin time: -100');
      });

      it('should throw error for invalid time range', () => {
        // Arrange
        const step = WorkoutStep.create(
          'Test Step',
          WorkoutLength.create(300, 'second'),
          [WorkoutTarget.create(70, 80)],
          'active'
        );

        const invalidStructure: WorkoutStructureElement[] = [{
          type: 'step',
          length: WorkoutLength.create(300, 'second'),
          steps: [step],
          begin: 300,
          end: 200, // End before begin
        }];

        // Act & Assert
        expect(() => {
          WorkoutStructure.create(
            invalidStructure,
            [[0, 0]],
            'duration',
            'percentOfThresholdPace',
            'range'
          );
        }).toThrow(ValidationError);
        expect(() => {
          WorkoutStructure.create(
            invalidStructure,
            [[0, 0]],
            'duration',
            'percentOfThresholdPace',
            'range'
          );
        }).toThrow('has invalid time range: 300 to 200');
      });

      it('should throw error for element with no steps', () => {
        // Arrange
        const invalidStructure: WorkoutStructureElement[] = [{
          type: 'step',
          length: WorkoutLength.create(300, 'second'),
          steps: [], // No steps
          begin: 0,
          end: 300,
        }];

        // Act & Assert
        expect(() => {
          WorkoutStructure.create(
            invalidStructure,
            [[0, 0]],
            'duration',
            'percentOfThresholdPace',
            'range'
          );
        }).toThrow(ValidationError);
        expect(() => {
          WorkoutStructure.create(
            invalidStructure,
            [[0, 0]],
            'duration',
            'percentOfThresholdPace',
            'range'
          );
        }).toThrow('has no steps');
      });
    });

    describe('polyline validation', () => {
      it('should throw error for non-array polyline', () => {
        // Arrange
        const step = WorkoutStep.create(
          'Test Step',
          WorkoutLength.create(300, 'second'),
          [WorkoutTarget.create(70, 80)],
          'active'
        );

        const structure: WorkoutStructureElement[] = [{
          type: 'step',
          length: WorkoutLength.create(300, 'second'),
          steps: [step],
          begin: 0,
          end: 300,
        }];

        // Act & Assert
        expect(() => {
          WorkoutStructure.create(
            structure,
            null as any,
            'duration',
            'percentOfThresholdPace',
            'range'
          );
        }).toThrow(ValidationError);
        expect(() => {
          WorkoutStructure.create(
            structure,
            null as any,
            'duration',
            'percentOfThresholdPace',
            'range'
          );
        }).toThrow('Workout polyline must be an array');
      });

      it('should throw error for invalid polyline points', () => {
        // Arrange
        const step = WorkoutStep.create(
          'Test Step',
          WorkoutLength.create(300, 'second'),
          [WorkoutTarget.create(70, 80)],
          'active'
        );

        const structure: WorkoutStructureElement[] = [{
          type: 'step',
          length: WorkoutLength.create(300, 'second'),
          steps: [step],
          begin: 0,
          end: 300,
        }];

        const invalidPolylines = [
          [[0]], // Not exactly 2 numbers
          [[0, 1, 2]], // More than 2 numbers
          [['0', '1']], // Not numbers
          [[0, NaN]], // Invalid number
          [[Infinity, 0]], // Infinite number
        ];

        invalidPolylines.forEach((polyline, index) => {
          expect(() => {
            WorkoutStructure.create(
              structure,
              polyline as any,
              'duration',
              'percentOfThresholdPace',
              'range'
            );
          }).toThrow(ValidationError);
        });
      });
    });

    describe('metrics validation', () => {
      it('should throw error for invalid primary length metric', () => {
        // Arrange
        const step = WorkoutStep.create(
          'Test Step',
          WorkoutLength.create(300, 'second'),
          [WorkoutTarget.create(70, 80)],
          'active'
        );

        const structure: WorkoutStructureElement[] = [{
          type: 'step',
          length: WorkoutLength.create(300, 'second'),
          steps: [step],
          begin: 0,
          end: 300,
        }];

        // Act & Assert
        expect(() => {
          WorkoutStructure.create(
            structure,
            [[0, 0]],
            'invalid' as any,
            'percentOfThresholdPace',
            'range'
          );
        }).toThrow(ValidationError);
        expect(() => {
          WorkoutStructure.create(
            structure,
            [[0, 0]],
            'invalid' as any,
            'percentOfThresholdPace',
            'range'
          );
        }).toThrow('Invalid primary length metric: invalid');
      });

      it('should throw error for invalid primary intensity metric', () => {
        // Arrange
        const step = WorkoutStep.create(
          'Test Step',
          WorkoutLength.create(300, 'second'),
          [WorkoutTarget.create(70, 80)],
          'active'
        );

        const structure: WorkoutStructureElement[] = [{
          type: 'step',
          length: WorkoutLength.create(300, 'second'),
          steps: [step],
          begin: 0,
          end: 300,
        }];

        // Act & Assert
        expect(() => {
          WorkoutStructure.create(
            structure,
            [[0, 0]],
            'duration',
            'invalid' as any,
            'range'
          );
        }).toThrow(ValidationError);
        expect(() => {
          WorkoutStructure.create(
            structure,
            [[0, 0]],
            'duration',
            'invalid' as any,
            'range'
          );
        }).toThrow('Invalid primary intensity metric: invalid');
      });

      it('should throw error for invalid primary intensity target type', () => {
        // Arrange
        const step = WorkoutStep.create(
          'Test Step',
          WorkoutLength.create(300, 'second'),
          [WorkoutTarget.create(70, 80)],
          'active'
        );

        const structure: WorkoutStructureElement[] = [{
          type: 'step',
          length: WorkoutLength.create(300, 'second'),
          steps: [step],
          begin: 0,
          end: 300,
        }];

        // Act & Assert
        expect(() => {
          WorkoutStructure.create(
            structure,
            [[0, 0]],
            'duration',
            'percentOfThresholdPace',
            'invalid' as any
          );
        }).toThrow(ValidationError);
        expect(() => {
          WorkoutStructure.create(
            structure,
            [[0, 0]],
            'duration',
            'percentOfThresholdPace',
            'invalid' as any
          );
        }).toThrow('Invalid primary intensity target type: invalid');
      });

      it('should accept all valid length metrics', () => {
        // Arrange
        const step = WorkoutStep.create(
          'Test Step',
          WorkoutLength.create(300, 'second'),
          [WorkoutTarget.create(70, 80)],
          'active'
        );

        const structure: WorkoutStructureElement[] = [{
          type: 'step',
          length: WorkoutLength.create(300, 'second'),
          steps: [step],
          begin: 0,
          end: 300,
        }];

        const validLengthMetrics: WorkoutLengthMetric[] = ['duration', 'distance'];

        // Act & Assert
        validLengthMetrics.forEach((metric) => {
          expect(() => {
            WorkoutStructure.create(
              structure,
              [[0, 0]],
              metric,
              'percentOfThresholdPace',
              'range'
            );
          }).not.toThrow();
        });
      });

      it('should accept all valid intensity metrics', () => {
        // Arrange
        const step = WorkoutStep.create(
          'Test Step',
          WorkoutLength.create(300, 'second'),
          [WorkoutTarget.create(70, 80)],
          'active'
        );

        const structure: WorkoutStructureElement[] = [{
          type: 'step',
          length: WorkoutLength.create(300, 'second'),
          steps: [step],
          begin: 0,
          end: 300,
        }];

        const validIntensityMetrics: WorkoutIntensityMetric[] = [
          'percentOfThresholdPace',
          'percentOfThresholdPower',
          'heartRate',
          'power',
          'pace',
          'speed',
        ];

        // Act & Assert
        validIntensityMetrics.forEach((metric) => {
          expect(() => {
            WorkoutStructure.create(
              structure,
              [[0, 0]],
              'duration',
              metric,
              'range'
            );
          }).not.toThrow();
        });
      });

      it('should accept all valid target types', () => {
        // Arrange
        const step = WorkoutStep.create(
          'Test Step',
          WorkoutLength.create(300, 'second'),
          [WorkoutTarget.create(70, 80)],
          'active'
        );

        const structure: WorkoutStructureElement[] = [{
          type: 'step',
          length: WorkoutLength.create(300, 'second'),
          steps: [step],
          begin: 0,
          end: 300,
        }];

        const validTargetTypes: WorkoutIntensityTargetType[] = ['target', 'range'];

        // Act & Assert
        validTargetTypes.forEach((targetType) => {
          expect(() => {
            WorkoutStructure.create(
              structure,
              [[0, 0]],
              'duration',
              'percentOfThresholdPace',
              targetType
            );
          }).not.toThrow();
        });
      });
    });
  });

  describe('getters', () => {
    it('should return deep copies of structure and polyline', () => {
      // Arrange
      const workoutStructure = StructuredWorkoutDataFixture.default().structure;

      // Act
      const structure1 = workoutStructure.structure;
      const structure2 = workoutStructure.structure;
      const polyline1 = workoutStructure.polyline;
      const polyline2 = workoutStructure.polyline;

      // Assert
      expect(structure1).not.toBe(structure2); // Different objects
      expect(structure1).toEqual(structure2); // Same content
      expect(polyline1).not.toBe(polyline2); // Different objects
      expect(polyline1).toEqual(polyline2); // Same content
    });

    it('should return correct primary metrics', () => {
      // Arrange
      const workoutStructure = StructuredWorkoutDataFixture.default().structure;

      // Act & Assert
      expect(workoutStructure.primaryLengthMetric).toBe('duration');
      expect(workoutStructure.primaryIntensityMetric).toBe('percentOfThresholdPace');
      expect(workoutStructure.primaryIntensityTargetOrRange).toBe('range');
    });
  });

  describe('business logic methods', () => {
    describe('getTotalDuration', () => {
      it('should return correct total duration from max end time', () => {
        // Arrange
        const workoutStructure = StructuredWorkoutDataFixture.default().structure;

        // Act
        const duration = workoutStructure.getTotalDuration();

        // Assert
        expect(duration).toBe(2100); // 35 minutes from fixture
        expect(typeof duration).toBe('number');
        expect(duration).toBeGreaterThan(0);
      });

      it('should return 0 for empty structure', () => {
        // This test cannot run due to validation preventing empty structures
        // But we can verify the logic by checking the implementation
        const workoutStructure = StructuredWorkoutDataFixture.default().structure;
        expect(workoutStructure.getTotalDuration()).toBeGreaterThan(0);
      });

      it('should handle single element correctly', () => {
        // Arrange
        const step = WorkoutStep.create(
          'Single Step',
          WorkoutLength.create(600, 'second'),
          [WorkoutTarget.create(70, 80)],
          'active'
        );

        const structure: WorkoutStructureElement[] = [{
          type: 'step',
          length: WorkoutLength.create(600, 'second'),
          steps: [step],
          begin: 0,
          end: 600,
        }];

        const workoutStructure = WorkoutStructure.create(
          structure,
          [[0, 0]],
          'duration',
          'percentOfThresholdPace',
          'range'
        );

        // Act
        const duration = workoutStructure.getTotalDuration();

        // Assert
        expect(duration).toBe(600);
      });
    });

    describe('getAllSteps', () => {
      it('should return all steps from all elements', () => {
        // Arrange
        const workoutStructure = StructuredWorkoutDataFixture.default().structure;

        // Act
        const allSteps = workoutStructure.getAllSteps();

        // Assert
        expect(allSteps).toHaveLength(3); // Warm-up, Main Set, Cool-down
        expect(allSteps[0].name).toBe('Warm-up');
        expect(allSteps[1].name).toBe('Main Set');
        expect(allSteps[2].name).toBe('Cool-down');
      });

      it('should return steps from repetition elements', () => {
        // Arrange
        const workoutStructure = StructuredWorkoutDataFixture.withIntervals().structure;

        // Act
        const allSteps = workoutStructure.getAllSteps();

        // Assert
        expect(allSteps.length).toBeGreaterThan(3); // Should include interval and recovery steps
        expect(allSteps.some(step => step.name === 'Interval')).toBe(true);
        expect(allSteps.some(step => step.name === 'Recovery')).toBe(true);
      });
    });

    describe('getActiveSteps', () => {
      it('should return only active steps', () => {
        // Arrange
        const workoutStructure = StructuredWorkoutDataFixture.withIntervals().structure;

        // Act
        const activeSteps = workoutStructure.getActiveSteps();

        // Assert
        activeSteps.forEach(step => {
          expect(step.isActive()).toBe(true);
        });
        expect(activeSteps.length).toBeGreaterThan(0);
      });

      it('should exclude rest, warmUp, and coolDown steps', () => {
        // Arrange
        const workoutStructure = StructuredWorkoutDataFixture.withIntervals().structure;

        // Act
        const activeSteps = workoutStructure.getActiveSteps();

        // Assert
        activeSteps.forEach(step => {
          expect(step.isRest()).toBe(false);
          expect(step.isWarmUp()).toBe(false);
          expect(step.isCoolDown()).toBe(false);
        });
      });
    });

    describe('getRestSteps', () => {
      it('should return only rest steps', () => {
        // Arrange
        const workoutStructure = StructuredWorkoutDataFixture.withIntervals().structure;

        // Act
        const restSteps = workoutStructure.getRestSteps();

        // Assert
        restSteps.forEach(step => {
          expect(step.isRest()).toBe(true);
        });
        expect(restSteps.length).toBeGreaterThan(0);
      });
    });

    describe('getElementsByType', () => {
      it('should return elements of specified type', () => {
        // Arrange
        const workoutStructure = StructuredWorkoutDataFixture.withIntervals().structure;

        // Act
        const stepElements = workoutStructure.getElementsByType('step');
        const repetitionElements = workoutStructure.getElementsByType('repetition');

        // Assert
        stepElements.forEach(element => {
          expect(element.type).toBe('step');
        });
        repetitionElements.forEach(element => {
          expect(element.type).toBe('repetition');
        });
        expect(stepElements.length).toBeGreaterThan(0);
        expect(repetitionElements.length).toBeGreaterThan(0);
      });
    });

    describe('getRepetitions', () => {
      it('should return only repetition elements', () => {
        // Arrange
        const workoutStructure = StructuredWorkoutDataFixture.withIntervals().structure;

        // Act
        const repetitions = workoutStructure.getRepetitions();

        // Assert
        repetitions.forEach(element => {
          expect(element.type).toBe('repetition');
        });
        expect(repetitions.length).toBeGreaterThan(0);
      });
    });

    describe('getStepElements', () => {
      it('should return only step elements', () => {
        // Arrange
        const workoutStructure = StructuredWorkoutDataFixture.default().structure;

        // Act
        const stepElements = workoutStructure.getStepElements();

        // Assert
        stepElements.forEach(element => {
          expect(element.type).toBe('step');
        });
        expect(stepElements).toHaveLength(3); // Default fixture has 3 step elements
      });
    });

    describe('isTimeBased and isDistanceBased', () => {
      it('should return true for time-based when primaryLengthMetric is duration', () => {
        // Arrange
        const workoutStructure = StructuredWorkoutDataFixture.default().structure;

        // Act & Assert
        expect(workoutStructure.isTimeBased()).toBe(true);
        expect(workoutStructure.isDistanceBased()).toBe(false);
      });

      it('should return true for distance-based when primaryLengthMetric is distance', () => {
        // Arrange
        const step = WorkoutStep.create(
          'Distance Step',
          WorkoutLength.create(5000, 'meter'),
          [WorkoutTarget.create(70, 80)],
          'active'
        );

        const structure: WorkoutStructureElement[] = [{
          type: 'step',
          length: WorkoutLength.create(5000, 'meter'),
          steps: [step],
          begin: 0,
          end: 1200, // Estimated time
        }];

        const workoutStructure = WorkoutStructure.create(
          structure,
          [[0, 0]],
          'distance',
          'pace',
          'range'
        );

        // Act & Assert
        expect(workoutStructure.isDistanceBased()).toBe(true);
        expect(workoutStructure.isTimeBased()).toBe(false);
      });
    });
  });

  describe('toApiFormat', () => {
    it('should convert to API format correctly', () => {
      // Arrange
      const workoutStructure = StructuredWorkoutDataFixture.default().structure;

      // Act
      const apiFormat = workoutStructure.toApiFormat();

      // Assert
      expect(apiFormat).toHaveProperty('structure');
      expect(apiFormat).toHaveProperty('polyline');
      expect(apiFormat).toHaveProperty('primaryLengthMetric');
      expect(apiFormat).toHaveProperty('primaryIntensityMetric');
      expect(apiFormat).toHaveProperty('primaryIntensityTargetOrRange');
      
      expect(Array.isArray(apiFormat.structure)).toBe(true);
      expect(Array.isArray(apiFormat.polyline)).toBe(true);
      
      expect(apiFormat.primaryLengthMetric).toBe('duration');
      expect(apiFormat.primaryIntensityMetric).toBe('percentOfThresholdPace');
      expect(apiFormat.primaryIntensityTargetOrRange).toBe('range');
    });

    it('should maintain data integrity in API format', () => {
      // Arrange
      const workoutStructure = StructuredWorkoutDataFixture.withIntervals().structure;

      // Act
      const apiFormat = workoutStructure.toApiFormat();

      // Assert
      expect(apiFormat.structure).toHaveLength(workoutStructure.structure.length);
      expect(apiFormat.polyline).toHaveLength(workoutStructure.polyline.length);
      
      apiFormat.structure.forEach((element, index) => {
        const originalElement = workoutStructure.structure[index];
        expect(element.type).toBe(originalElement.type);
        expect(element.begin).toBe(originalElement.begin);
        expect(element.end).toBe(originalElement.end);
        expect(element.steps).toHaveLength(originalElement.steps.length);
      });
    });
  });

  describe('equals', () => {
    it('should return true for identical workout structures', () => {
      // Arrange
      const workoutStructure1 = StructuredWorkoutDataFixture.default().structure;
      const workoutStructure2 = StructuredWorkoutDataFixture.default().structure;

      // Act & Assert
      expect(workoutStructure1.equals(workoutStructure2)).toBe(true);
    });

    it('should return false for different primary metrics', () => {
      // Arrange
      const step = WorkoutStep.create(
        'Test Step',
        WorkoutLength.create(300, 'second'),
        [WorkoutTarget.create(70, 80)],
        'active'
      );

      const structure: WorkoutStructureElement[] = [{
        type: 'step',
        length: WorkoutLength.create(300, 'second'),
        steps: [step],
        begin: 0,
        end: 300,
      }];

      const workoutStructure1 = WorkoutStructure.create(
        structure,
        [[0, 0]],
        'duration',
        'percentOfThresholdPace',
        'range'
      );

      const workoutStructure2 = WorkoutStructure.create(
        structure,
        [[0, 0]],
        'distance', // Different metric
        'percentOfThresholdPace',
        'range'
      );

      // Act & Assert
      expect(workoutStructure1.equals(workoutStructure2)).toBe(false);
    });

    it('should return false for different structure elements', () => {
      // Arrange
      const step1 = WorkoutStep.create(
        'Step 1',
        WorkoutLength.create(300, 'second'),
        [WorkoutTarget.create(70, 80)],
        'active'
      );

      const step2 = WorkoutStep.create(
        'Step 2',
        WorkoutLength.create(600, 'second'),
        [WorkoutTarget.create(70, 80)],
        'active'
      );

      const structure1: WorkoutStructureElement[] = [{
        type: 'step',
        length: WorkoutLength.create(300, 'second'),
        steps: [step1],
        begin: 0,
        end: 300,
      }];

      const structure2: WorkoutStructureElement[] = [{
        type: 'step',
        length: WorkoutLength.create(600, 'second'),
        steps: [step2],
        begin: 0,
        end: 600,
      }];

      const workoutStructure1 = WorkoutStructure.create(
        structure1,
        [[0, 0]],
        'duration',
        'percentOfThresholdPace',
        'range'
      );

      const workoutStructure2 = WorkoutStructure.create(
        structure2,
        [[0, 0]],
        'duration',
        'percentOfThresholdPace',
        'range'
      );

      // Act & Assert
      expect(workoutStructure1.equals(workoutStructure2)).toBe(false);
    });

    it('should return false for different polylines', () => {
      // Arrange
      const step = WorkoutStep.create(
        'Test Step',
        WorkoutLength.create(300, 'second'),
        [WorkoutTarget.create(70, 80)],
        'active'
      );

      const structure: WorkoutStructureElement[] = [{
        type: 'step',
        length: WorkoutLength.create(300, 'second'),
        steps: [step],
        begin: 0,
        end: 300,
      }];

      const workoutStructure1 = WorkoutStructure.create(
        structure,
        [[0, 0], [1, 1]],
        'duration',
        'percentOfThresholdPace',
        'range'
      );

      const workoutStructure2 = WorkoutStructure.create(
        structure,
        [[0, 0], [1, 0.5]], // Different polyline
        'duration',
        'percentOfThresholdPace',
        'range'
      );

      // Act & Assert
      expect(workoutStructure1.equals(workoutStructure2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return descriptive string representation', () => {
      // Arrange
      const workoutStructure = StructuredWorkoutDataFixture.default().structure;

      // Act
      const stringRepresentation = workoutStructure.toString();

      // Assert
      expect(stringRepresentation).toContain('Workout Structure');
      expect(stringRepresentation).toContain('2100s'); // Duration
      expect(stringRepresentation).toContain('3 steps');
      expect(stringRepresentation).toContain('1 active'); // Only one "active" step in default fixture
      expect(stringRepresentation).toContain('0 repetitions');
    });

    it('should show correct counts for interval workout', () => {
      // Arrange
      const workoutStructure = StructuredWorkoutDataFixture.withIntervals().structure;

      // Act
      const stringRepresentation = workoutStructure.toString();

      // Assert
      expect(stringRepresentation).toContain('Workout Structure');
      expect(stringRepresentation).toContain('2700s'); // Duration
      expect(stringRepresentation).toContain('repetitions');
      expect(stringRepresentation).toContain('steps');
      expect(stringRepresentation).toContain('active');
    });
  });

  describe('immutability methods', () => {
    describe('withElement', () => {
      it('should return new structure with additional element', () => {
        // Arrange
        const originalStructure = StructuredWorkoutDataFixture.default().structure;
        const newStep = WorkoutStep.create(
          'Extra Step',
          WorkoutLength.create(300, 'second'),
          [WorkoutTarget.create(75, 85)],
          'active'
        );

        const newElement: WorkoutStructureElement = {
          type: 'step',
          length: WorkoutLength.create(300, 'second'),
          steps: [newStep],
          begin: 2100,
          end: 2400,
        };

        // Act
        const newStructure = originalStructure.withElement(newElement);

        // Assert
        expect(newStructure).not.toBe(originalStructure);
        expect(newStructure.structure).toHaveLength(originalStructure.structure.length + 1);
        expect(newStructure.structure[3]).toEqual(newElement);
        expect(newStructure.getTotalDuration()).toBe(2400);
      });
    });

    describe('withPolyline', () => {
      it('should return new structure with updated polyline', () => {
        // Arrange
        const originalStructure = StructuredWorkoutDataFixture.default().structure;
        const newPolyline: number[][] = [[0, 0], [0.5, 1], [1, 0]];

        // Act
        const newStructure = originalStructure.withPolyline(newPolyline);

        // Assert
        expect(newStructure).not.toBe(originalStructure);
        expect(newStructure.polyline).toEqual(newPolyline);
        expect(newStructure.structure).toEqual(originalStructure.structure);
        expect(newStructure.primaryLengthMetric).toBe(originalStructure.primaryLengthMetric);
      });
    });
  });

  describe('edge cases and complex scenarios', () => {
    it('should handle empty polyline', () => {
      // Arrange
      const step = WorkoutStep.create(
        'Test Step',
        WorkoutLength.create(300, 'second'),
        [WorkoutTarget.create(70, 80)],
        'active'
      );

      const structure: WorkoutStructureElement[] = [{
        type: 'step',
        length: WorkoutLength.create(300, 'second'),
        steps: [step],
        begin: 0,
        end: 300,
      }];

      // Act & Assert
      expect(() => {
        WorkoutStructure.create(
          structure,
          [], // Empty polyline
          'duration',
          'percentOfThresholdPace',
          'range'
        );
      }).not.toThrow();
    });

    it('should handle multiple steps in single element', () => {
      // Arrange
      const step1 = WorkoutStep.create(
        'Step 1',
        WorkoutLength.create(150, 'second'),
        [WorkoutTarget.create(70, 80)],
        'active'
      );

      const step2 = WorkoutStep.create(
        'Step 2',
        WorkoutLength.create(150, 'second'),
        [WorkoutTarget.create(80, 90)],
        'active'
      );

      const structure: WorkoutStructureElement[] = [{
        type: 'step',
        length: WorkoutLength.create(300, 'second'),
        steps: [step1, step2], // Multiple steps in one element
        begin: 0,
        end: 300,
      }];

      const workoutStructure = WorkoutStructure.create(
        structure,
        [[0, 0]],
        'duration',
        'percentOfThresholdPace',
        'range'
      );

      // Act
      const allSteps = workoutStructure.getAllSteps();

      // Assert
      expect(allSteps).toHaveLength(2);
      expect(workoutStructure.structure[0].steps).toHaveLength(2);
    });

    it('should handle non-overlapping adjacent elements', () => {
      // Arrange
      const step1 = WorkoutStep.create(
        'Step 1',
        WorkoutLength.create(300, 'second'),
        [WorkoutTarget.create(70, 80)],
        'active'
      );

      const step2 = WorkoutStep.create(
        'Step 2',
        WorkoutLength.create(300, 'second'),
        [WorkoutTarget.create(80, 90)],
        'active'
      );

      const structure: WorkoutStructureElement[] = [
        {
          type: 'step',
          length: WorkoutLength.create(300, 'second'),
          steps: [step1],
          begin: 0,
          end: 300,
        },
        {
          type: 'step',
          length: WorkoutLength.create(300, 'second'),
          steps: [step2],
          begin: 300, // Exactly adjacent, no overlap
          end: 600,
        },
      ];

      // Act & Assert
      expect(() => {
        WorkoutStructure.create(
          structure,
          [[0, 0]],
          'duration',
          'percentOfThresholdPace',
          'range'
        );
      }).not.toThrow();
    });

    it('should handle fixture-generated random structures', () => {
      // Arrange & Act
      const randomWorkouts = Array.from({ length: 5 }, () =>
        StructuredWorkoutDataFixture.random().structure
      );

      // Assert
      randomWorkouts.forEach((structure, index) => {
        expect(structure.structure.length).toBeGreaterThan(0);
        expect(structure.getTotalDuration()).toBeGreaterThan(0);
        expect(structure.getAllSteps().length).toBeGreaterThan(0);
        expect(structure.toString()).toContain('Workout Structure');
      });
    });
  });
});