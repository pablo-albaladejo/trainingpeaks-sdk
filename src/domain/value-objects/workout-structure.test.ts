/**
 * Workout Structure Value Objects Tests
 * Tests for domain value objects using Zod schemas
 */

import { describe, expect, it } from 'vitest';
import {
  WorkoutLength,
  WorkoutStep,
  WorkoutStructure,
  WorkoutStructureElement,
  WorkoutTarget,
} from './workout-structure';

describe('WorkoutLength', () => {
  describe('create', () => {
    it('should create valid workout length', () => {
      const length = WorkoutLength.create(600, 'second');

      expect(length.value).toBe(600);
      expect(length.unit).toBe('second');
    });

    it('should throw error for negative value', () => {
      expect(() => {
        WorkoutLength.create(-100, 'second');
      }).toThrow();
    });

    it('should throw error for invalid unit', () => {
      expect(() => {
        WorkoutLength.create(100, 'invalid' as 'second');
      }).toThrow();
    });
  });

  describe('conversions', () => {
    it('should convert minutes to seconds', () => {
      const length = WorkoutLength.create(5, 'minute');
      expect(length.toSeconds()).toBe(300);
    });

    it('should convert hours to seconds', () => {
      const length = WorkoutLength.create(1, 'hour');
      expect(length.toSeconds()).toBe(3600);
    });

    it('should convert kilometers to meters', () => {
      const length = WorkoutLength.create(5, 'kilometer');
      expect(length.toMeters()).toBe(5000);
    });

    it('should return null for non-convertible units', () => {
      const length = WorkoutLength.create(5, 'repetition');
      expect(length.toSeconds()).toBeNull();
      expect(length.toMeters()).toBeNull();
    });
  });

  describe('type checks', () => {
    it('should identify time units', () => {
      expect(WorkoutLength.create(1, 'second').isTimeUnit()).toBe(true);
      expect(WorkoutLength.create(1, 'minute').isTimeUnit()).toBe(true);
      expect(WorkoutLength.create(1, 'hour').isTimeUnit()).toBe(true);
      expect(WorkoutLength.create(1, 'meter').isTimeUnit()).toBe(false);
    });

    it('should identify distance units', () => {
      expect(WorkoutLength.create(1, 'meter').isDistanceUnit()).toBe(true);
      expect(WorkoutLength.create(1, 'kilometer').isDistanceUnit()).toBe(true);
      expect(WorkoutLength.create(1, 'mile').isDistanceUnit()).toBe(true);
      expect(WorkoutLength.create(1, 'second').isDistanceUnit()).toBe(false);
    });

    it('should identify repetition units', () => {
      expect(WorkoutLength.create(5, 'repetition').isRepetitionUnit()).toBe(
        true
      );
      expect(WorkoutLength.create(1, 'second').isRepetitionUnit()).toBe(false);
    });
  });
});

describe('WorkoutTarget', () => {
  describe('create', () => {
    it('should create valid target', () => {
      const target = WorkoutTarget.create(70, 80);

      expect(target.minValue).toBe(70);
      expect(target.maxValue).toBe(80);
    });

    it('should throw error when minValue > maxValue', () => {
      expect(() => {
        WorkoutTarget.create(80, 70);
      }).toThrow();
    });

    it('should throw error for negative values', () => {
      expect(() => {
        WorkoutTarget.create(-10, 80);
      }).toThrow();
    });
  });

  describe('target types', () => {
    it('should identify single target', () => {
      const target = WorkoutTarget.create(75, 75);
      expect(target.isSingleTarget()).toBe(true);
      expect(target.isRangeTarget()).toBe(false);
    });

    it('should identify range target', () => {
      const target = WorkoutTarget.create(70, 80);
      expect(target.isSingleTarget()).toBe(false);
      expect(target.isRangeTarget()).toBe(true);
    });
  });

  describe('calculations', () => {
    it('should calculate range width', () => {
      const target = WorkoutTarget.create(70, 80);
      expect(target.getRangeWidth()).toBe(10);
    });

    it('should calculate midpoint', () => {
      const target = WorkoutTarget.create(70, 80);
      expect(target.getMidpoint()).toBe(75);
    });

    it('should check value in range', () => {
      const target = WorkoutTarget.create(70, 80);
      expect(target.isValueInRange(75)).toBe(true);
      expect(target.isValueInRange(85)).toBe(false);
      expect(target.isValueInRange(70)).toBe(true); // inclusive
      expect(target.isValueInRange(80)).toBe(true); // inclusive
    });
  });
});

describe('WorkoutStep', () => {
  describe('create', () => {
    it('should create valid step', () => {
      const length = WorkoutLength.create(600, 'second');
      const target = WorkoutTarget.create(70, 80);
      const step = WorkoutStep.create('Test Step', length, [target], 'active');

      expect(step.name).toBe('Test Step');
      expect(step.intensityClass).toBe('active');
      expect(step.targets).toHaveLength(1);
    });

    it('should allow rest step without targets', () => {
      const length = WorkoutLength.create(300, 'second');
      const step = WorkoutStep.create('Rest', length, [], 'rest');

      expect(step.intensityClass).toBe('rest');
      expect(step.targets).toHaveLength(0);
    });

    it('should throw error for non-rest step without targets', () => {
      const length = WorkoutLength.create(600, 'second');

      expect(() => {
        WorkoutStep.create('Active Step', length, [], 'active');
      }).toThrow();
    });

    it('should throw error for empty name', () => {
      const length = WorkoutLength.create(600, 'second');
      const target = WorkoutTarget.create(70, 80);

      expect(() => {
        WorkoutStep.create('', length, [target], 'active');
      }).toThrow();
    });
  });

  describe('intensity class checks', () => {
    it('should identify rest step', () => {
      const length = WorkoutLength.create(300, 'second');
      const step = WorkoutStep.create('Rest', length, [], 'rest');

      expect(step.isRest()).toBe(true);
      expect(step.isActive()).toBe(false);
      expect(step.isWarmUp()).toBe(false);
      expect(step.isCoolDown()).toBe(false);
    });

    it('should identify active step', () => {
      const length = WorkoutLength.create(600, 'second');
      const target = WorkoutTarget.create(80, 90);
      const step = WorkoutStep.create('Active', length, [target], 'active');

      expect(step.isActive()).toBe(true);
      expect(step.isRest()).toBe(false);
    });
  });

  describe('primary target', () => {
    it('should return first target as primary', () => {
      const length = WorkoutLength.create(600, 'second');
      const target1 = WorkoutTarget.create(70, 80);
      const target2 = WorkoutTarget.create(80, 90);
      const step = WorkoutStep.create(
        'Test',
        length,
        [target1, target2],
        'active'
      );

      const primary = step.getPrimaryTarget();
      expect(primary).not.toBeNull();
      expect(primary!.minValue).toBe(70);
      expect(primary!.maxValue).toBe(80);
    });

    it('should return null for step without targets', () => {
      const length = WorkoutLength.create(300, 'second');
      const step = WorkoutStep.create('Rest', length, [], 'rest');

      expect(step.getPrimaryTarget()).toBeNull();
    });
  });
});

describe('WorkoutStructureElement', () => {
  describe('create', () => {
    it('should create valid step element', () => {
      const length = WorkoutLength.create(600, 'second');
      const stepLength = WorkoutLength.create(600, 'second');
      const target = WorkoutTarget.create(70, 80);
      const step = WorkoutStep.create(
        'Test Step',
        stepLength,
        [target],
        'active'
      );

      const element = WorkoutStructureElement.create(
        'step',
        length,
        [step],
        0,
        600
      );

      expect(element.type).toBe('step');
      expect(element.begin).toBe(0);
      expect(element.end).toBe(600);
      expect(element.steps).toHaveLength(1);
    });

    it('should create valid repetition element', () => {
      const length = WorkoutLength.create(4, 'repetition');
      const stepLength = WorkoutLength.create(120, 'second');
      const target = WorkoutTarget.create(80, 90);
      const step = WorkoutStep.create(
        'Interval',
        stepLength,
        [target],
        'active'
      );

      const element = WorkoutStructureElement.create(
        'repetition',
        length,
        [step],
        0,
        480
      );

      expect(element.type).toBe('repetition');
      expect(element.length.value).toBe(4);
      expect(element.length.unit).toBe('repetition');
    });

    it('should throw error for invalid time range', () => {
      const length = WorkoutLength.create(600, 'second');
      const stepLength = WorkoutLength.create(600, 'second');
      const target = WorkoutTarget.create(70, 80);
      const step = WorkoutStep.create(
        'Test Step',
        stepLength,
        [target],
        'active'
      );

      expect(() => {
        WorkoutStructureElement.create('step', length, [step], 600, 0);
      }).toThrow();
    });

    it('should throw error for element without steps', () => {
      const length = WorkoutLength.create(600, 'second');

      expect(() => {
        WorkoutStructureElement.create('step', length, [], 0, 600);
      }).toThrow();
    });
  });

  describe('duration calculation', () => {
    it('should calculate element duration', () => {
      const length = WorkoutLength.create(600, 'second');
      const stepLength = WorkoutLength.create(600, 'second');
      const target = WorkoutTarget.create(70, 80);
      const step = WorkoutStep.create(
        'Test Step',
        stepLength,
        [target],
        'active'
      );

      const element = WorkoutStructureElement.create(
        'step',
        length,
        [step],
        0,
        600
      );

      expect(element.getDuration()).toBe(600);
    });
  });
});

describe('WorkoutStructure', () => {
  describe('create', () => {
    it('should create valid workout structure', () => {
      // Create warm-up step
      const warmUpLength = WorkoutLength.create(600, 'second');
      const warmUpStepLength = WorkoutLength.create(600, 'second');
      const warmUpTarget = WorkoutTarget.create(60, 70);
      const warmUpStep = WorkoutStep.create(
        'Warm-up',
        warmUpStepLength,
        [warmUpTarget],
        'warmUp'
      );
      const warmUpElement = WorkoutStructureElement.create(
        'step',
        warmUpLength,
        [warmUpStep],
        0,
        600
      );

      // Create main set step
      const mainLength = WorkoutLength.create(1200, 'second');
      const mainStepLength = WorkoutLength.create(1200, 'second');
      const mainTarget = WorkoutTarget.create(80, 90);
      const mainStep = WorkoutStep.create(
        'Main Set',
        mainStepLength,
        [mainTarget],
        'active'
      );
      const mainElement = WorkoutStructureElement.create(
        'step',
        mainLength,
        [mainStep],
        600,
        1800
      );

      const polyline = [
        [0, 0],
        [0.33, 0.65],
        [1, 0.85],
      ];

      const structure = WorkoutStructure.create(
        [warmUpElement, mainElement],
        polyline,
        'duration',
        'percentOfThresholdPace',
        'range'
      );

      expect(structure.structure).toHaveLength(2);
      expect(structure.primaryLengthMetric).toBe('duration');
      expect(structure.primaryIntensityMetric).toBe('percentOfThresholdPace');
      expect(structure.primaryIntensityTargetOrRange).toBe('range');
    });

    it('should throw error for overlapping elements', () => {
      const length1 = WorkoutLength.create(600, 'second');
      const stepLength1 = WorkoutLength.create(600, 'second');
      const target1 = WorkoutTarget.create(60, 70);
      const step1 = WorkoutStep.create(
        'Step 1',
        stepLength1,
        [target1],
        'active'
      );
      const element1 = WorkoutStructureElement.create(
        'step',
        length1,
        [step1],
        0,
        600
      );

      const length2 = WorkoutLength.create(600, 'second');
      const stepLength2 = WorkoutLength.create(600, 'second');
      const target2 = WorkoutTarget.create(80, 90);
      const step2 = WorkoutStep.create(
        'Step 2',
        stepLength2,
        [target2],
        'active'
      );
      const element2 = WorkoutStructureElement.create(
        'step',
        length2,
        [step2],
        300,
        900
      ); // Overlaps!

      const polyline = [
        [0, 0],
        [1, 1],
      ];

      expect(() => {
        WorkoutStructure.create(
          [element1, element2],
          polyline,
          'duration',
          'percentOfThresholdPace',
          'range'
        );
      }).toThrow();
    });
  });

  describe('calculations', () => {
    it('should calculate total duration', () => {
      const length1 = WorkoutLength.create(600, 'second');
      const stepLength1 = WorkoutLength.create(600, 'second');
      const target1 = WorkoutTarget.create(60, 70);
      const step1 = WorkoutStep.create(
        'Step 1',
        stepLength1,
        [target1],
        'active'
      );
      const element1 = WorkoutStructureElement.create(
        'step',
        length1,
        [step1],
        0,
        600
      );

      const length2 = WorkoutLength.create(1200, 'second');
      const stepLength2 = WorkoutLength.create(1200, 'second');
      const target2 = WorkoutTarget.create(80, 90);
      const step2 = WorkoutStep.create(
        'Step 2',
        stepLength2,
        [target2],
        'active'
      );
      const element2 = WorkoutStructureElement.create(
        'step',
        length2,
        [step2],
        600,
        1800
      );

      const polyline = [
        [0, 0],
        [1, 1],
      ];

      const structure = WorkoutStructure.create(
        [element1, element2],
        polyline,
        'duration',
        'percentOfThresholdPace',
        'range'
      );

      expect(structure.getTotalDuration()).toBe(1800); // 600 + 1200
    });

    it('should get all steps', () => {
      const length = WorkoutLength.create(600, 'second');
      const stepLength = WorkoutLength.create(600, 'second');
      const target = WorkoutTarget.create(70, 80);
      const step = WorkoutStep.create(
        'Test Step',
        stepLength,
        [target],
        'active'
      );
      const element = WorkoutStructureElement.create(
        'step',
        length,
        [step],
        0,
        600
      );

      const polyline = [
        [0, 0],
        [1, 1],
      ];

      const structure = WorkoutStructure.create(
        [element],
        polyline,
        'duration',
        'percentOfThresholdPace',
        'range'
      );

      const allSteps = structure.getAllSteps();
      expect(allSteps).toHaveLength(1);
      expect(allSteps[0].name).toBe('Test Step');
    });

    it('should calculate average intensity', () => {
      const length = WorkoutLength.create(600, 'second');
      const stepLength = WorkoutLength.create(600, 'second');
      const target1 = WorkoutTarget.create(60, 70); // midpoint: 65
      const step1 = WorkoutStep.create(
        'Step 1',
        stepLength,
        [target1],
        'active'
      );
      const element1 = WorkoutStructureElement.create(
        'step',
        length,
        [step1],
        0,
        600
      );

      const target2 = WorkoutTarget.create(80, 90); // midpoint: 85
      const step2 = WorkoutStep.create(
        'Step 2',
        stepLength,
        [target2],
        'active'
      );
      const element2 = WorkoutStructureElement.create(
        'step',
        length,
        [step2],
        600,
        1200
      );

      const polyline = [
        [0, 0],
        [1, 1],
      ];

      const structure = WorkoutStructure.create(
        [element1, element2],
        polyline,
        'duration',
        'percentOfThresholdPace',
        'range'
      );

      expect(structure.calculateAverageIntensity()).toBe(75); // (65 + 85) / 2
    });
  });

  describe('filtering', () => {
    it('should filter elements by type', () => {
      const stepLength = WorkoutLength.create(600, 'second');
      const target = WorkoutTarget.create(70, 80);
      const step = WorkoutStep.create(
        'Test Step',
        stepLength,
        [target],
        'active'
      );

      const stepElement = WorkoutStructureElement.create(
        'step',
        stepLength,
        [step],
        0,
        600
      );
      const repetitionElement = WorkoutStructureElement.create(
        'repetition',
        WorkoutLength.create(4, 'repetition'),
        [step],
        600,
        1200
      );

      const polyline = [
        [0, 0],
        [1, 1],
      ];

      const structure = WorkoutStructure.create(
        [stepElement, repetitionElement],
        polyline,
        'duration',
        'percentOfThresholdPace',
        'range'
      );

      expect(structure.getStepElements()).toHaveLength(1);
      expect(structure.getRepetitions()).toHaveLength(1);
      expect(structure.getElementsByType('step')).toHaveLength(1);
      expect(structure.getElementsByType('repetition')).toHaveLength(1);
    });

    it('should filter steps by intensity class', () => {
      const length = WorkoutLength.create(600, 'second');
      const stepLength = WorkoutLength.create(600, 'second');

      const activeTarget = WorkoutTarget.create(80, 90);
      const activeStep = WorkoutStep.create(
        'Active',
        stepLength,
        [activeTarget],
        'active'
      );
      const activeElement = WorkoutStructureElement.create(
        'step',
        length,
        [activeStep],
        0,
        600
      );

      const restStep = WorkoutStep.create('Rest', stepLength, [], 'rest');
      const restElement = WorkoutStructureElement.create(
        'step',
        length,
        [restStep],
        600,
        1200
      );

      const polyline = [
        [0, 0],
        [1, 1],
      ];

      const structure = WorkoutStructure.create(
        [activeElement, restElement],
        polyline,
        'duration',
        'percentOfThresholdPace',
        'range'
      );

      expect(structure.getActiveSteps()).toHaveLength(1);
      expect(structure.getRestSteps()).toHaveLength(1);
    });
  });
});
