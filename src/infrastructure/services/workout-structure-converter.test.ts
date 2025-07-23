/**
 * Workout Structure Converter Tests
 * Unit tests for the workout structure converter functionality
 */

import { describe, expect, it } from 'vitest';
import type {
  SimpleWorkoutStructure,
  SimpleWorkoutStructureElement,
} from '../../types';
import {
  ElementType,
  IntensityClass,
  IntensityMetric,
  IntensityTargetType,
  LengthMetric,
  LengthUnit,
} from '../../types';
import {
  SimpleStructureElementBuilder,
  SimpleWorkoutStructureBuilder,
} from './workout-builder';
import {
  calculateSimpleStructureDuration,
  convertSimpleElementToComplete,
  convertSimpleToCompleteStructure,
} from './workout-structure-converter';

describe('Workout Structure Converter', () => {
  describe('calculateSimpleStructureDuration', () => {
    it('should calculate total duration correctly with repetitions', () => {
      // Arrange
      const simpleStructure: SimpleWorkoutStructure = {
        structure: [
          {
            type: ElementType.STEP,
            length: { value: 600, unit: LengthUnit.SECOND }, // 10 minutes
            steps: [],
          },
          {
            type: ElementType.REPETITION,
            length: { value: 3, unit: LengthUnit.REPETITION },
            steps: [
              {
                name: 'Interval',
                length: { value: 300, unit: LengthUnit.SECOND }, // 5 minutes
                targets: [{ minValue: 85, maxValue: 95 }],
                intensityClass: IntensityClass.ACTIVE,
                openDuration: false,
              },
              {
                name: 'Recovery',
                length: { value: 180, unit: LengthUnit.SECOND }, // 3 minutes
                targets: [{ minValue: 65, maxValue: 75 }],
                intensityClass: IntensityClass.REST,
                openDuration: false,
              },
            ],
          },
          {
            type: ElementType.STEP,
            length: { value: 300, unit: LengthUnit.SECOND }, // 5 minutes
            steps: [],
          },
        ],
        primaryLengthMetric: LengthMetric.DURATION,
        primaryIntensityMetric: IntensityMetric.PERCENT_OF_THRESHOLD_PACE,
        intensityTargetType: IntensityTargetType.RANGE,
      };

      // Act
      const totalDuration = calculateSimpleStructureDuration(simpleStructure);

      // Assert
      // 600 + (3 * (300 + 180)) + 300 = 600 + (3 * 480) + 300 = 600 + 1440 + 300 = 2340
      expect(totalDuration).toBe(2340);
    });

    it('should throw error for repetition with empty steps', () => {
      // Arrange
      const simpleStructure: SimpleWorkoutStructure = {
        structure: [
          {
            type: ElementType.REPETITION,
            length: { value: 3, unit: LengthUnit.REPETITION },
            steps: [],
          },
        ],
        primaryLengthMetric: LengthMetric.DURATION,
        primaryIntensityMetric: IntensityMetric.PERCENT_OF_THRESHOLD_PACE,
        intensityTargetType: IntensityTargetType.RANGE,
      };

      // Act & Assert
      expect(() => calculateSimpleStructureDuration(simpleStructure)).toThrow(
        'Repetition element must have at least one step. Found 0 steps.'
      );
    });

    it('should handle empty structure', () => {
      // Arrange
      const simpleStructure: SimpleWorkoutStructure = {
        structure: [],
        primaryLengthMetric: LengthMetric.DURATION,
        primaryIntensityMetric: IntensityMetric.PERCENT_OF_THRESHOLD_PACE,
        intensityTargetType: IntensityTargetType.RANGE,
      };

      // Act
      const totalDuration = calculateSimpleStructureDuration(simpleStructure);

      // Assert
      expect(totalDuration).toBe(0);
    });
  });

  describe('convertSimpleElementToComplete', () => {
    it('should convert simple element to complete element with correct timing', () => {
      // Arrange
      const simpleElement: SimpleWorkoutStructureElement = {
        type: ElementType.STEP,
        length: { value: 600, unit: LengthUnit.SECOND },
        steps: [
          {
            name: 'Warm Up',
            length: { value: 600, unit: LengthUnit.SECOND },
            targets: [{ minValue: 60, maxValue: 70 }],
            intensityClass: IntensityClass.WARM_UP,
            openDuration: false,
          },
        ],
      };
      const startTime = 300; // 5 minutes

      // Act
      const completeElement = convertSimpleElementToComplete(
        simpleElement,
        startTime
      );

      // Assert
      expect(completeElement.begin).toBe(300);
      expect(completeElement.end).toBe(900); // 300 + 600
      expect(completeElement.type).toBe(ElementType.STEP);
      expect(completeElement.length).toEqual({
        value: 600,
        unit: LengthUnit.SECOND,
      });
      expect(completeElement.polyline).toBeDefined();
      expect(Array.isArray(completeElement.polyline)).toBe(true);
    });
  });

  describe('convertSimpleToCompleteStructure', () => {
    it('should convert simple structure to complete structure', () => {
      // Arrange
      const simpleStructure: SimpleWorkoutStructure = {
        structure: [
          {
            type: ElementType.STEP,
            length: { value: 600, unit: LengthUnit.SECOND }, // 10 minutes
            steps: [
              {
                name: 'Warm Up',
                length: { value: 600, unit: LengthUnit.SECOND },
                targets: [{ minValue: 60, maxValue: 70 }],
                intensityClass: IntensityClass.WARM_UP,
                openDuration: false,
              },
            ],
          },
          {
            type: ElementType.REPETITION,
            length: { value: 2, unit: LengthUnit.REPETITION },
            steps: [
              {
                name: 'Interval',
                length: { value: 300, unit: LengthUnit.SECOND },
                targets: [{ minValue: 85, maxValue: 95 }],
                intensityClass: IntensityClass.ACTIVE,
                openDuration: false,
              },
              {
                name: 'Recovery',
                length: { value: 180, unit: LengthUnit.SECOND },
                targets: [{ minValue: 65, maxValue: 75 }],
                intensityClass: IntensityClass.REST,
                openDuration: false,
              },
            ],
          },
          {
            type: ElementType.STEP,
            length: { value: 300, unit: LengthUnit.SECOND }, // 5 minutes
            steps: [
              {
                name: 'Cool Down',
                length: { value: 300, unit: LengthUnit.SECOND },
                targets: [{ minValue: 50, maxValue: 60 }],
                intensityClass: IntensityClass.COOL_DOWN,
                openDuration: false,
              },
            ],
          },
        ],
        primaryLengthMetric: LengthMetric.DURATION,
        primaryIntensityMetric: IntensityMetric.PERCENT_OF_THRESHOLD_PACE,
        intensityTargetType: IntensityTargetType.RANGE,
      };

      // Act
      const completeStructure =
        convertSimpleToCompleteStructure(simpleStructure);

      // Assert
      expect(completeStructure.structure).toHaveLength(3);
      expect(completeStructure.primaryLengthMetric).toBe(LengthMetric.DURATION);
      expect(completeStructure.primaryIntensityMetric).toBe(
        IntensityMetric.PERCENT_OF_THRESHOLD_PACE
      );
      expect(completeStructure.primaryIntensityTargetOrRange).toBe(
        IntensityTargetType.RANGE
      );
      expect(completeStructure.polyline).toBeDefined();
      expect(Array.isArray(completeStructure.polyline)).toBe(true);

      // Check timing of elements
      expect(completeStructure.structure[0].begin).toBe(0);
      expect(completeStructure.structure[0].end).toBe(600);

      expect(completeStructure.structure[1].begin).toBe(600);
      expect(completeStructure.structure[1].end).toBe(1560); // 600 + (2 * (300 + 180)) = 600 + 960 = 1560

      expect(completeStructure.structure[2].begin).toBe(1560);
      expect(completeStructure.structure[2].end).toBe(1860); // 1560 + 300
    });

    it('should handle structure with only one element', () => {
      // Arrange
      const simpleStructure: SimpleWorkoutStructure = {
        structure: [
          {
            type: ElementType.STEP,
            length: { value: 1800, unit: LengthUnit.SECOND }, // 30 minutes
            steps: [
              {
                name: 'Easy Run',
                length: { value: 1800, unit: LengthUnit.SECOND },
                targets: [{ minValue: 70, maxValue: 80 }],
                intensityClass: IntensityClass.ACTIVE,
                openDuration: false,
              },
            ],
          },
        ],
        primaryLengthMetric: LengthMetric.DURATION,
        primaryIntensityMetric: IntensityMetric.PERCENT_OF_THRESHOLD_PACE,
        intensityTargetType: IntensityTargetType.RANGE,
      };

      // Act
      const completeStructure =
        convertSimpleToCompleteStructure(simpleStructure);

      // Assert
      expect(completeStructure.structure).toHaveLength(1);
      expect(completeStructure.structure[0].begin).toBe(0);
      expect(completeStructure.structure[0].end).toBe(1800);
      expect(completeStructure.structure[0].polyline).toBeDefined();
    });

    it('should preserve all properties from simple structure', () => {
      // Arrange
      const simpleStructure: SimpleWorkoutStructure = {
        structure: [
          {
            type: ElementType.STEP,
            length: { value: 600, unit: LengthUnit.SECOND },
            steps: [
              {
                name: 'Test Step',
                length: { value: 600, unit: LengthUnit.SECOND },
                targets: [{ minValue: 75, maxValue: 85 }],
                intensityClass: IntensityClass.ACTIVE,
                openDuration: false,
              },
            ],
          },
        ],
        primaryLengthMetric: LengthMetric.DISTANCE,
        primaryIntensityMetric: IntensityMetric.PERCENT_OF_THRESHOLD_POWER,
        intensityTargetType: IntensityTargetType.TARGET,
      };

      // Act
      const completeStructure =
        convertSimpleToCompleteStructure(simpleStructure);

      // Assert
      expect(completeStructure.primaryLengthMetric).toBe(LengthMetric.DISTANCE);
      expect(completeStructure.primaryIntensityMetric).toBe(
        IntensityMetric.PERCENT_OF_THRESHOLD_POWER
      );
      expect(completeStructure.primaryIntensityTargetOrRange).toBe(
        IntensityTargetType.TARGET
      );
      expect(completeStructure.structure[0].steps[0].name).toBe('Test Step');
      expect(completeStructure.structure[0].steps[0].targets[0].minValue).toBe(
        75
      );
      expect(completeStructure.structure[0].steps[0].targets[0].maxValue).toBe(
        85
      );
    });
  });

  it('should convert a simple cycling workout (10min warmup, 40min active @80% power, 5min cooldown)', () => {
    // Arrange
    const simpleCyclingWorkout: SimpleWorkoutStructure = {
      structure: [
        {
          type: ElementType.STEP,
          length: { value: 10, unit: LengthUnit.MINUTE },
          steps: [
            {
              name: 'Warm Up',
              length: { value: 10, unit: LengthUnit.MINUTE },
              targets: [{ minValue: 50, maxValue: 60 }],
              intensityClass: IntensityClass.WARM_UP,
              openDuration: false,
            },
          ],
        },
        {
          type: ElementType.STEP,
          length: { value: 40, unit: LengthUnit.MINUTE },
          steps: [
            {
              name: 'Active',
              length: { value: 40, unit: LengthUnit.MINUTE },
              targets: [{ minValue: 80, maxValue: 80 }],
              intensityClass: IntensityClass.ACTIVE,
              openDuration: false,
            },
          ],
        },
        {
          type: ElementType.STEP,
          length: { value: 5, unit: LengthUnit.MINUTE },
          steps: [
            {
              name: 'Cool Down',
              length: { value: 5, unit: LengthUnit.MINUTE },
              targets: [{ minValue: 50, maxValue: 60 }],
              intensityClass: IntensityClass.COOL_DOWN,
              openDuration: false,
            },
          ],
        },
      ],
      primaryLengthMetric: LengthMetric.DURATION,
      primaryIntensityMetric: IntensityMetric.PERCENT_OF_THRESHOLD_POWER,
      intensityTargetType: IntensityTargetType.TARGET,
    };

    // Act
    const completeStructure =
      convertSimpleToCompleteStructure(simpleCyclingWorkout);

    // Assert
    expect(completeStructure.structure).toHaveLength(3);
    expect(completeStructure.primaryLengthMetric).toBe(LengthMetric.DURATION);
    expect(completeStructure.primaryIntensityMetric).toBe(
      IntensityMetric.PERCENT_OF_THRESHOLD_POWER
    );
    expect(completeStructure.primaryIntensityTargetOrRange).toBe(
      IntensityTargetType.TARGET
    );

    // Check timing of elements
    expect(completeStructure.structure[0].begin).toBe(0);
    expect(completeStructure.structure[0].end).toBe(10);
    expect(completeStructure.structure[1].begin).toBe(10);
    expect(completeStructure.structure[1].end).toBe(50);
    expect(completeStructure.structure[2].begin).toBe(50);
    expect(completeStructure.structure[2].end).toBe(55);

    // Check targets
    expect(completeStructure.structure[1].steps[0].targets[0].minValue).toBe(
      80
    );
    expect(completeStructure.structure[1].steps[0].targets[0].maxValue).toBe(
      80
    );
  });

  it('should convert 3 repetitions of 30s active + 30s recovery using builder', () => {
    // Arrange
    const intervalsElement = new SimpleStructureElementBuilder()
      .type(ElementType.REPETITION)
      .length(3, LengthUnit.REPETITION)
      .steps([
        {
          name: 'Active',
          length: { value: 30, unit: LengthUnit.SECOND },
          targets: [{ minValue: 90, maxValue: 100 }],
          intensityClass: IntensityClass.ACTIVE,
          openDuration: false,
        },
        {
          name: 'Recovery',
          length: { value: 30, unit: LengthUnit.SECOND },
          targets: [{ minValue: 60, maxValue: 70 }],
          intensityClass: IntensityClass.ACTIVE,
          openDuration: false,
        },
      ])
      .build();

    const simpleWorkout = new SimpleWorkoutStructureBuilder()
      .addElement(intervalsElement)
      .setPrimaryLengthMetric(LengthMetric.DURATION)
      .setPrimaryIntensityMetric(IntensityMetric.PERCENT_OF_THRESHOLD_POWER)
      .setIntensityTargetType(IntensityTargetType.RANGE)
      .build();

    // Act
    const completeStructure = convertSimpleToCompleteStructure(simpleWorkout);

    // Assert
    expect(completeStructure.structure).toHaveLength(1);
    expect(completeStructure.structure[0].type).toBe(ElementType.REPETITION);
    expect(completeStructure.structure[0].length).toEqual({
      value: 3,
      unit: LengthUnit.REPETITION,
    });

    // Check timing: 3 repetitions * (30s + 30s) = 3 * 60s = 180s
    expect(completeStructure.structure[0].begin).toBe(0);
    expect(completeStructure.structure[0].end).toBe(180); // 180 seconds total

    // Check steps
    expect(completeStructure.structure[0].steps).toHaveLength(2);
    expect(completeStructure.structure[0].steps[0].name).toBe('Active');
    expect(completeStructure.structure[0].steps[0].length).toEqual({
      value: 30,
      unit: LengthUnit.SECOND,
    });
    expect(completeStructure.structure[0].steps[1].name).toBe('Recovery');
    expect(completeStructure.structure[0].steps[1].length).toEqual({
      value: 30,
      unit: LengthUnit.SECOND,
    });
  });
});
