/**
 * Workout Structure Converter Tests
 * Tests for converting simple workout structures to complete structures
 */

import { describe, expect, it } from 'vitest';
import type {
  SimpleWorkoutStructure,
  SimpleWorkoutStructureElement,
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
            type: 'step',
            length: { value: 600, unit: 'second' }, // 10 minutes
            steps: [],
          },
          {
            type: 'repetition',
            length: { value: 3, unit: 'repetition' },
            steps: [
              {
                name: 'Interval',
                length: { value: 300, unit: 'second' }, // 5 minutes
                targets: [{ minValue: 85, maxValue: 95 }],
                intensityClass: 'active',
                openDuration: false,
              },
              {
                name: 'Recovery',
                length: { value: 180, unit: 'second' }, // 3 minutes
                targets: [{ minValue: 65, maxValue: 75 }],
                intensityClass: 'rest',
                openDuration: false,
              },
            ],
          },
          {
            type: 'step',
            length: { value: 300, unit: 'second' }, // 5 minutes
            steps: [],
          },
        ],
        primaryLengthMetric: 'duration',
        primaryIntensityMetric: 'percentOfThresholdPace',
        intensityTargetType: 'range',
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
            type: 'repetition',
            length: { value: 3, unit: 'repetition' },
            steps: [],
          },
        ],
        primaryLengthMetric: 'duration',
        primaryIntensityMetric: 'percentOfThresholdPace',
        intensityTargetType: 'range',
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
        primaryLengthMetric: 'duration',
        primaryIntensityMetric: 'percentOfThresholdPace',
        intensityTargetType: 'range',
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
        type: 'step',
        length: { value: 600, unit: 'second' },
        steps: [
          {
            name: 'Warm Up',
            length: { value: 600, unit: 'second' },
            targets: [{ minValue: 60, maxValue: 70 }],
            intensityClass: 'warmUp',
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
      expect(completeElement.type).toBe('step');
      expect(completeElement.length).toEqual({ value: 600, unit: 'second' });
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
            type: 'step',
            length: { value: 600, unit: 'second' }, // 10 minutes
            steps: [
              {
                name: 'Warm Up',
                length: { value: 600, unit: 'second' },
                targets: [{ minValue: 60, maxValue: 70 }],
                intensityClass: 'warmUp',
                openDuration: false,
              },
            ],
          },
          {
            type: 'repetition',
            length: { value: 2, unit: 'repetition' },
            steps: [
              {
                name: 'Interval',
                length: { value: 300, unit: 'second' },
                targets: [{ minValue: 85, maxValue: 95 }],
                intensityClass: 'active',
                openDuration: false,
              },
              {
                name: 'Recovery',
                length: { value: 180, unit: 'second' },
                targets: [{ minValue: 65, maxValue: 75 }],
                intensityClass: 'rest',
                openDuration: false,
              },
            ],
          },
          {
            type: 'step',
            length: { value: 300, unit: 'second' }, // 5 minutes
            steps: [
              {
                name: 'Cool Down',
                length: { value: 300, unit: 'second' },
                targets: [{ minValue: 50, maxValue: 60 }],
                intensityClass: 'coolDown',
                openDuration: false,
              },
            ],
          },
        ],
        primaryLengthMetric: 'duration',
        primaryIntensityMetric: 'percentOfThresholdPace',
        intensityTargetType: 'range',
      };

      // Act
      const completeStructure =
        convertSimpleToCompleteStructure(simpleStructure);

      // Assert
      expect(completeStructure.structure).toHaveLength(3);
      expect(completeStructure.primaryLengthMetric).toBe('duration');
      expect(completeStructure.primaryIntensityMetric).toBe(
        'percentOfThresholdPace'
      );
      expect(completeStructure.primaryIntensityTargetOrRange).toBe('range');
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
            type: 'step',
            length: { value: 1800, unit: 'second' }, // 30 minutes
            steps: [
              {
                name: 'Easy Run',
                length: { value: 1800, unit: 'second' },
                targets: [{ minValue: 70, maxValue: 80 }],
                intensityClass: 'active',
                openDuration: false,
              },
            ],
          },
        ],
        primaryLengthMetric: 'duration',
        primaryIntensityMetric: 'percentOfThresholdPace',
        intensityTargetType: 'range',
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
            type: 'step',
            length: { value: 600, unit: 'second' },
            steps: [
              {
                name: 'Test Step',
                length: { value: 600, unit: 'second' },
                targets: [{ minValue: 75, maxValue: 85 }],
                intensityClass: 'active',
                openDuration: false,
              },
            ],
          },
        ],
        primaryLengthMetric: 'distance',
        primaryIntensityMetric: 'percentOfThresholdPower',
        intensityTargetType: 'target',
      };

      // Act
      const completeStructure =
        convertSimpleToCompleteStructure(simpleStructure);

      // Assert
      expect(completeStructure.primaryLengthMetric).toBe('distance');
      expect(completeStructure.primaryIntensityMetric).toBe(
        'percentOfThresholdPower'
      );
      expect(completeStructure.primaryIntensityTargetOrRange).toBe('target');
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
          type: 'step',
          length: { value: 10, unit: 'minute' },
          steps: [
            {
              name: 'Warm Up',
              length: { value: 10, unit: 'minute' },
              targets: [{ minValue: 50, maxValue: 60 }],
              intensityClass: 'warmUp',
              openDuration: false,
            },
          ],
        },
        {
          type: 'step',
          length: { value: 40, unit: 'minute' },
          steps: [
            {
              name: 'Active',
              length: { value: 40, unit: 'minute' },
              targets: [{ minValue: 80, maxValue: 80 }],
              intensityClass: 'active',
              openDuration: false,
            },
          ],
        },
        {
          type: 'step',
          length: { value: 5, unit: 'minute' },
          steps: [
            {
              name: 'Cool Down',
              length: { value: 5, unit: 'minute' },
              targets: [{ minValue: 50, maxValue: 60 }],
              intensityClass: 'coolDown',
              openDuration: false,
            },
          ],
        },
      ],
      primaryLengthMetric: 'duration',
      primaryIntensityMetric: 'percentOfThresholdPower',
      intensityTargetType: 'target',
    };

    // Act
    const completeStructure =
      convertSimpleToCompleteStructure(simpleCyclingWorkout);

    // Assert
    expect(completeStructure.structure).toHaveLength(3);
    expect(completeStructure.primaryLengthMetric).toBe('duration');
    expect(completeStructure.primaryIntensityMetric).toBe(
      'percentOfThresholdPower'
    );
    expect(completeStructure.primaryIntensityTargetOrRange).toBe('target');

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
      .type('repetition')
      .length(3, 'repetition')
      .steps([
        {
          name: 'Active',
          length: { value: 30, unit: 'second' },
          targets: [{ minValue: 90, maxValue: 100 }],
          intensityClass: 'active',
          openDuration: false,
        },
        {
          name: 'Recovery',
          length: { value: 30, unit: 'second' },
          targets: [{ minValue: 60, maxValue: 70 }],
          intensityClass: 'active',
          openDuration: false,
        },
      ])
      .build();

    const simpleWorkout = new SimpleWorkoutStructureBuilder()
      .addElement(intervalsElement)
      .setPrimaryLengthMetric('duration')
      .setPrimaryIntensityMetric('percentOfThresholdPower')
      .setIntensityTargetType('range')
      .build();

    // Act
    const completeStructure = convertSimpleToCompleteStructure(simpleWorkout);

    // Assert
    expect(completeStructure.structure).toHaveLength(1);
    expect(completeStructure.structure[0].type).toBe('repetition');
    expect(completeStructure.structure[0].length).toEqual({
      value: 3,
      unit: 'repetition',
    });

    // Check timing: 3 repetitions * (30s + 30s) = 3 * 60s = 180s
    expect(completeStructure.structure[0].begin).toBe(0);
    expect(completeStructure.structure[0].end).toBe(180); // 180 seconds total

    // Check steps
    expect(completeStructure.structure[0].steps).toHaveLength(2);
    expect(completeStructure.structure[0].steps[0].name).toBe('Active');
    expect(completeStructure.structure[0].steps[0].length).toEqual({
      value: 30,
      unit: 'second',
    });
    expect(completeStructure.structure[0].steps[1].name).toBe('Recovery');
    expect(completeStructure.structure[0].steps[1].length).toEqual({
      value: 30,
      unit: 'second',
    });
  });
});
