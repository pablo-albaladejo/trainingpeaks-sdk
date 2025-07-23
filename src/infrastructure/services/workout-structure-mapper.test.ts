import {
  ElementType,
  IntensityClass,
  LengthUnit,
  WorkoutStructure,
} from '@/types';
import { describe, expect, it } from 'vitest';
import { WorkoutStructureMapper } from './workout-structure-mapper';

describe('WorkoutStructureMapper', () => {
  describe('toTrainingPeaksFormat', () => {
    it('should transform a simple workout structure correctly', () => {
      const workoutStructure: WorkoutStructure = {
        structure: [
          {
            type: ElementType.STEP,
            length: { value: 60, unit: LengthUnit.SECOND },
            steps: [
              {
                name: '1 minute warm up',
                length: { value: 60, unit: LengthUnit.SECOND },
                targets: [{ minValue: 70, maxValue: 80 }],
                intensityClass: IntensityClass.WARM_UP,
                openDuration: false,
              },
            ],
            begin: 0,
            end: 60,
          },
        ],
      };

      const result =
        WorkoutStructureMapper.toTrainingPeaksFormat(workoutStructure);

      expect(result).toEqual({
        structure: [
          {
            type: 'step',
            length: { value: 60, unit: 'second' },
            steps: [
              {
                name: '1 minute warm up',
                length: { value: 60, unit: 'second' },
                targets: [{ minValue: 70, maxValue: 80 }],
                intensityClass: 'warmUp',
                openDuration: false,
              },
            ],
            begin: 0,
            end: 60,
          },
        ],
        polyline: expect.any(Array),
        primaryLengthMetric: 'duration',
        primaryIntensityMetric: 'percentOfThresholdPace',
        primaryIntensityTargetOrRange: 'range',
      });
    });

    it('should transform repetition elements correctly', () => {
      const workoutStructure: WorkoutStructure = {
        structure: [
          {
            type: ElementType.REPETITION,
            length: { value: 3, unit: LengthUnit.REPETITION },
            steps: [
              {
                name: '30 second interval',
                length: { value: 30, unit: LengthUnit.SECOND },
                targets: [{ minValue: 90, maxValue: 100 }],
                intensityClass: IntensityClass.ACTIVE,
                openDuration: false,
              },
              {
                name: '30 second rest',
                length: { value: 30, unit: LengthUnit.SECOND },
                targets: [{ minValue: 60, maxValue: 70 }],
                intensityClass: IntensityClass.REST,
                openDuration: false,
              },
            ],
            begin: 0,
            end: 180,
          },
        ],
      };

      const result =
        WorkoutStructureMapper.toTrainingPeaksFormat(workoutStructure);

      expect(result.structure[0]).toEqual({
        type: 'repetition',
        length: { value: 3, unit: 'repetition' },
        steps: [
          {
            name: '30 second interval',
            length: { value: 30, unit: 'second' },
            targets: [{ minValue: 90, maxValue: 100 }],
            intensityClass: 'active',
            openDuration: false,
          },
          {
            name: '30 second rest',
            length: { value: 30, unit: 'second' },
            targets: [{ minValue: 60, maxValue: 70 }],
            intensityClass: 'rest',
            openDuration: false,
          },
        ],
        begin: 0,
        end: 180,
      });
    });

    it('should convert time units correctly', () => {
      const workoutStructure: WorkoutStructure = {
        structure: [
          {
            type: ElementType.STEP,
            length: { value: 2, unit: LengthUnit.MINUTE },
            steps: [
              {
                name: '2 minute step',
                length: { value: 2, unit: LengthUnit.MINUTE },
                targets: [{ minValue: 80, maxValue: 90 }],
                intensityClass: IntensityClass.THRESHOLD,
                openDuration: false,
              },
            ],
            begin: 0,
            end: 120,
          },
        ],
      };

      const result =
        WorkoutStructureMapper.toTrainingPeaksFormat(workoutStructure);

      expect(result.structure[0].length).toEqual({
        value: 120,
        unit: 'second',
      });
      expect(result.structure[0].steps[0].length).toEqual({
        value: 120,
        unit: 'second',
      });
    });

    it('should convert distance units correctly', () => {
      const workoutStructure: WorkoutStructure = {
        structure: [
          {
            type: ElementType.STEP,
            length: { value: 5, unit: LengthUnit.KILOMETER },
            steps: [
              {
                name: '5km run',
                length: { value: 5, unit: LengthUnit.KILOMETER },
                targets: [{ minValue: 85, maxValue: 95 }],
                intensityClass: IntensityClass.ACTIVE,
                openDuration: false,
              },
            ],
            begin: 0,
            end: 1800, // 30 minutes
          },
        ],
      };

      const result =
        WorkoutStructureMapper.toTrainingPeaksFormat(workoutStructure);

      expect(result.structure[0].length).toEqual({
        value: 5000,
        unit: 'meter',
      });
      expect(result.structure[0].steps[0].length).toEqual({
        value: 5000,
        unit: 'meter',
      });
    });

    it('should map all intensity classes correctly', () => {
      const intensityClasses = [
        IntensityClass.ACTIVE,
        IntensityClass.REST,
        IntensityClass.WARM_UP,
        IntensityClass.COOL_DOWN,
      ];

      const expectedMappings = ['active', 'rest', 'warmUp', 'coolDown'];

      intensityClasses.forEach((intensityClass, index) => {
        const workoutStructure: WorkoutStructure = {
          structure: [
            {
              type: ElementType.STEP,
              length: { value: 60, unit: LengthUnit.SECOND },
              steps: [
                {
                  name: 'test step',
                  length: { value: 60, unit: LengthUnit.SECOND },
                  targets: [{ minValue: 70, maxValue: 80 }],
                  intensityClass,
                  openDuration: false,
                },
              ],
              begin: 0,
              end: 60,
            },
          ],
        };

        const result =
          WorkoutStructureMapper.toTrainingPeaksFormat(workoutStructure);
        expect(result.structure[0].steps[0].intensityClass).toBe(
          expectedMappings[index]
        );
      });
    });

    it('should generate polyline data', () => {
      const workoutStructure: WorkoutStructure = {
        structure: [
          {
            type: ElementType.STEP,
            length: { value: 60, unit: LengthUnit.SECOND },
            steps: [
              {
                name: '1 minute step',
                length: { value: 60, unit: LengthUnit.SECOND },
                targets: [{ minValue: 70, maxValue: 80 }],
                intensityClass: IntensityClass.ACTIVE,
                openDuration: false,
              },
            ],
            begin: 0,
            end: 60,
          },
        ],
      };

      const result =
        WorkoutStructureMapper.toTrainingPeaksFormat(workoutStructure);

      expect(result.polyline).toBeInstanceOf(Array);
      expect(result.polyline.length).toBeGreaterThan(0);
      expect(result.polyline[0]).toBeInstanceOf(Array);
      expect(result.polyline[0].length).toBe(2);
    });

    it('should handle empty structure', () => {
      const workoutStructure: WorkoutStructure = {
        structure: [],
      };

      const result =
        WorkoutStructureMapper.toTrainingPeaksFormat(workoutStructure);

      expect(result).toEqual({
        structure: [],
        polyline: expect.any(Array),
        primaryLengthMetric: 'duration',
        primaryIntensityMetric: 'percentOfThresholdPace',
        primaryIntensityTargetOrRange: 'range',
      });
    });
  });
});
