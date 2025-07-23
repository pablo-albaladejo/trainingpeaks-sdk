/**
 * Workout Builder Service Tests
 * Unit tests for the workout builder functionality
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  SimpleStructureElementBuilder,
  SimpleWorkoutStructureBuilder,
  StructureElementBuilder,
  WorkoutStepBuilder,
  WorkoutStructureBuilder,
  createCooldownElement,
  createCooldownStep,
  createCyclingWorkoutStructure,
  createIntervalStep,
  createIntervalWorkoutStructure,
  createIntervalsElement,
  createRecoveryStep,
  createRestStep,
  createSweetSpotStep,
  createVO2MaxStep,
  createWarmupElement,
  createWarmupStep,
  type CyclingWorkoutConfig,
  type IntervalWorkoutConfig,
} from './workout-builder';
import { convertSimpleToCompleteStructure } from './workout-structure-converter';

describe('WorkoutStepBuilder', () => {
  let builder: WorkoutStepBuilder;

  beforeEach(() => {
    builder = new WorkoutStepBuilder();
  });

  describe('fluent API', () => {
    it('should support fluent chaining', () => {
      const step = builder
        .name('Test Step')
        .duration(10)
        .intensity('active')
        .target(80, 90)
        .build();

      expect(step.name).toBe('Test Step');
      expect(step.length).toEqual({ value: 10, unit: 'minute' });
      expect(step.intensityClass).toBe('active');
      expect(step.targets).toEqual([{ minValue: 80, maxValue: 90 }]);
      expect(step.openDuration).toBe(false);
    });

    it('should support distance in meters', () => {
      const step = builder
        .name('Distance Step')
        .distance(5000)
        .intensity('active')
        .target(70, 80)
        .build();

      expect(step.length).toEqual({ value: 5000, unit: 'meter' });
    });

    it('should support distance in kilometers', () => {
      const step = builder
        .name('Distance Step')
        .kilometers(5)
        .intensity('active')
        .target(70, 80)
        .build();

      expect(step.length).toEqual({ value: 5000, unit: 'meter' });
    });

    it('should support open duration', () => {
      const step = builder
        .name('Open Step')
        .duration(15)
        .intensity('active')
        .target(60, 70)
        .openDuration(true)
        .build();

      expect(step.openDuration).toBe(true);
    });

    it('should support multiple targets', () => {
      const targets = [
        { minValue: 70, maxValue: 80 },
        { minValue: 85, maxValue: 95 },
      ];

      const step = builder
        .name('Multi Target Step')
        .duration(20)
        .intensity('active')
        .targets(targets)
        .build();

      expect(step.targets).toEqual(targets);
    });
  });

  describe('validation', () => {
    it('should throw error when name is missing', () => {
      expect(() =>
        builder.duration(10).intensity('active').target(70, 80).build()
      ).toThrow(
        'Incomplete WorkoutStep. Missing required properties: name, length, intensityClass, targets'
      );
    });

    it('should throw error when length is missing', () => {
      expect(() =>
        builder.name('Test').intensity('active').target(70, 80).build()
      ).toThrow(
        'Incomplete WorkoutStep. Missing required properties: name, length, intensityClass, targets'
      );
    });

    it('should throw error when intensity is missing', () => {
      expect(() =>
        builder.name('Test').duration(10).target(70, 80).build()
      ).toThrow(
        'Incomplete WorkoutStep. Missing required properties: name, length, intensityClass, targets'
      );
    });

    it('should throw error when targets are missing', () => {
      expect(() =>
        builder.name('Test').duration(10).intensity('active').build()
      ).toThrow(
        'Incomplete WorkoutStep. Missing required properties: name, length, intensityClass, targets'
      );
    });
  });
});

describe('StructureElementBuilder', () => {
  let builder: StructureElementBuilder;
  let mockStep: {
    name: string;
    length: { value: number; unit: string };
    intensityClass: string;
    targets: { minValue: number; maxValue: number }[];
    openDuration: boolean;
  };

  beforeEach(() => {
    builder = new StructureElementBuilder();
    mockStep = {
      name: 'Test Step',
      length: { value: 10, unit: 'minute' },
      intensityClass: 'active',
      targets: [{ minValue: 70, maxValue: 80 }],
      openDuration: false,
    };
  });

  describe('fluent API', () => {
    it('should support fluent chaining', () => {
      const element = builder
        .type('step')
        .length(10, 'minute')
        .steps([mockStep])
        .timeRange(0, 600)
        .build();

      expect(element.type).toBe('step');
      expect(element.length).toEqual({ value: 10, unit: 'minute' });
      expect(element.steps).toEqual([mockStep]);
      expect(element.begin).toBe(0);
      expect(element.end).toBe(600);
    });

    it('should support repetition type', () => {
      const element = builder
        .type('repetition')
        .length(5, 'repetition')
        .steps([mockStep])
        .timeRange(0, 300)
        .build();

      expect(element.type).toBe('repetition');
      expect(element.length).toEqual({ value: 5, unit: 'repetition' });
    });

    it('should support different length units', () => {
      const element = builder
        .type('step')
        .length(1000, 'meter')
        .steps([mockStep])
        .timeRange(0, 600)
        .build();

      expect(element.length).toEqual({ value: 1000, unit: 'meter' });
    });
  });

  describe('validation', () => {
    it('should throw error when type is missing', () => {
      expect(() =>
        builder.length(10, 'minute').steps([mockStep]).timeRange(0, 600).build()
      ).toThrow(
        'Incomplete WorkoutStructureElement. Missing required properties: type, length, steps, begin, end'
      );
    });

    it('should throw error when length is missing', () => {
      expect(() =>
        builder.type('step').steps([mockStep]).timeRange(0, 600).build()
      ).toThrow(
        'Incomplete WorkoutStructureElement. Missing required properties: type, length, steps, begin, end'
      );
    });

    it('should throw error when steps are missing', () => {
      expect(() =>
        builder.type('step').length(10, 'minute').timeRange(0, 600).build()
      ).toThrow(
        'Incomplete WorkoutStructureElement. Missing required properties: type, length, steps, begin, end'
      );
    });

    it('should throw error when time range is missing', () => {
      expect(() =>
        builder.type('step').length(10, 'minute').steps([mockStep]).build()
      ).toThrow(
        'Incomplete WorkoutStructureElement. Missing required properties: type, length, steps, begin, end'
      );
    });
  });
});

describe('WorkoutStructureBuilder', () => {
  let builder: WorkoutStructureBuilder;
  let mockElement: {
    type: string;
    length: { value: number; unit: string };
    steps: {
      name: string;
      length: { value: number; unit: string };
      intensityClass: string;
      targets: { minValue: number; maxValue: number }[];
      openDuration: boolean;
    }[];
    begin: number;
    end: number;
  };

  beforeEach(() => {
    builder = new WorkoutStructureBuilder();
    mockElement = {
      type: 'step',
      length: { value: 10, unit: 'minute' },
      steps: [
        {
          name: 'Test Step',
          length: { value: 10, unit: 'minute' },
          intensityClass: 'active',
          targets: [{ minValue: 70, maxValue: 80 }],
          openDuration: false,
        },
      ],
      begin: 0,
      end: 600,
    };
  });

  describe('fluent API', () => {
    it('should support fluent chaining', () => {
      const structure = builder
        .addElement(mockElement)
        .setPrimaryLengthMetric('duration')
        .setPrimaryIntensityMetric('percentOfThresholdPace')
        .setIntensityTargetType('range')
        .build();

      expect(structure.structure).toEqual([mockElement]);
      expect(structure.primaryLengthMetric).toBe('duration');
      expect(structure.primaryIntensityMetric).toBe('percentOfThresholdPace');
      expect(structure.primaryIntensityTargetOrRange).toBe('range');
    });

    it('should support adding multiple elements', () => {
      const element2 = { ...mockElement, begin: 600, end: 1200 };
      const structure = builder.addElements([mockElement, element2]).build();

      expect(structure.structure).toHaveLength(2);
      expect(structure.structure).toEqual([mockElement, element2]);
    });

    it('should support different intensity metrics', () => {
      const structure = builder
        .addElement(mockElement)
        .setPrimaryIntensityMetric('percentOfThresholdPower')
        .build();

      expect(structure.primaryIntensityMetric).toBe('percentOfThresholdPower');
    });

    it('should support different target types', () => {
      const structure = builder
        .addElement(mockElement)
        .setIntensityTargetType('target')
        .build();

      expect(structure.primaryIntensityTargetOrRange).toBe('target');
    });
  });

  describe('validation', () => {
    it('should throw error when no elements are added', () => {
      expect(() => builder.build()).toThrow(
        'WorkoutStructure must have at least one element'
      );
    });
  });
});

describe('Helper Functions - Steps', () => {
  describe('createWarmupStep', () => {
    it('should create warmup step with default duration', () => {
      const step = createWarmupStep();
      expect(step.name).toBe('Progressive Warmup');
      expect(step.length).toEqual({ value: 10, unit: 'minute' });
      expect(step.intensityClass).toBe('warmUp');
      expect(step.targets).toEqual([{ minValue: 50, maxValue: 70 }]);
    });

    it('should create warmup step with custom duration', () => {
      const step = createWarmupStep(15);
      expect(step.length).toEqual({ value: 15, unit: 'minute' });
    });
  });

  describe('createIntervalStep', () => {
    it('should create interval step with default name', () => {
      const step = createIntervalStep(5, { min: 90, max: 100 });
      expect(step.name).toBe('5min Interval');
      expect(step.length).toEqual({ value: 5, unit: 'minute' });
      expect(step.intensityClass).toBe('active');
      expect(step.targets).toEqual([{ minValue: 90, maxValue: 100 }]);
    });

    it('should create interval step with custom name', () => {
      const step = createIntervalStep(
        5,
        { min: 90, max: 100 },
        'Custom Interval'
      );
      expect(step.name).toBe('Custom Interval');
    });
  });

  describe('createRecoveryStep', () => {
    it('should create recovery step with default name', () => {
      const step = createRecoveryStep(3, { min: 60, max: 70 });
      expect(step.name).toBe('3min Recovery');
      expect(step.length).toEqual({ value: 3, unit: 'minute' });
      expect(step.intensityClass).toBe('active');
      expect(step.targets).toEqual([{ minValue: 60, maxValue: 70 }]);
    });
  });

  describe('createRestStep', () => {
    it('should create rest step with default name', () => {
      const step = createRestStep(2);
      expect(step.name).toBe('2min Rest');
      expect(step.intensityClass).toBe('rest');
      expect(step.targets).toEqual([{ minValue: 0, maxValue: 0 }]);
    });
  });

  describe('createCooldownStep', () => {
    it('should create cooldown step with default duration', () => {
      const step = createCooldownStep();
      expect(step.name).toBe('Cooldown');
      expect(step.length).toEqual({ value: 5, unit: 'minute' });
      expect(step.intensityClass).toBe('coolDown');
      expect(step.targets).toEqual([{ minValue: 45, maxValue: 55 }]);
    });
  });

  describe('createSweetSpotStep', () => {
    it('should create sweet spot step', () => {
      const step = createSweetSpotStep(20);
      expect(step.name).toBe('Sweet Spot Training');
      expect(step.length).toEqual({ value: 20, unit: 'minute' });
      expect(step.intensityClass).toBe('active');
      expect(step.targets).toEqual([{ minValue: 88, maxValue: 93 }]);
    });
  });

  describe('createVO2MaxStep', () => {
    it('should create VO2Max step', () => {
      const step = createVO2MaxStep(3);
      expect(step.name).toBe('VO2Max Interval');
      expect(step.length).toEqual({ value: 3, unit: 'minute' });
      expect(step.intensityClass).toBe('active');
      expect(step.targets).toEqual([{ minValue: 120, maxValue: 130 }]);
    });
  });
});

describe('Helper Functions - Elements', () => {
  describe('createWarmupElement', () => {
    it('should create warmup element with default duration', () => {
      const element = createWarmupElement();
      expect(element.type).toBe('step');
      expect(element.length).toEqual({ value: 10, unit: 'minute' });
      expect(element.steps).toHaveLength(1);
      expect(element.steps[0].name).toBe('Progressive Warmup');
      expect(element.begin).toBe(0);
      expect(element.end).toBe(600);
    });

    it('should create warmup element with custom duration', () => {
      const element = createWarmupElement(15);
      expect(element.length).toEqual({ value: 15, unit: 'minute' });
      expect(element.end).toBe(900);
    });
  });

  describe('createIntervalsElement', () => {
    it('should create intervals element', () => {
      const element = createIntervalsElement(
        5, // numberOfIntervals
        4, // intervalDuration
        2, // recoveryDuration
        { min: 90, max: 100 }, // intervalIntensity
        { min: 60, max: 70 }, // recoveryIntensity
        600 // startTime
      );

      expect(element.type).toBe('repetition');
      expect(element.length).toEqual({ value: 5, unit: 'repetition' });
      expect(element.steps).toHaveLength(2);
      expect(element.begin).toBe(600);
      expect(element.end).toBe(600 + (4 + 2) * 60 * 5);
    });
  });

  describe('createCooldownElement', () => {
    it('should create cooldown element with default duration', () => {
      const element = createCooldownElement();
      expect(element.type).toBe('step');
      expect(element.length).toEqual({ value: 5, unit: 'minute' });
      expect(element.steps).toHaveLength(1);
      expect(element.steps[0].name).toBe('Cooldown');
      expect(element.begin).toBe(0);
      expect(element.end).toBe(300);
    });

    it('should create cooldown element with custom start time', () => {
      const element = createCooldownElement(10, 1200);
      expect(element.begin).toBe(1200);
      expect(element.end).toBe(1200 + 600);
    });
  });
});

describe('Helper Functions - Complete Structures', () => {
  describe('createIntervalWorkoutStructure', () => {
    it('should create interval workout structure with default values', () => {
      const config: IntervalWorkoutConfig = {
        intervalDuration: 5,
        recoveryDuration: 3,
        numberOfIntervals: 4,
        intervalIntensity: { min: 90, max: 100 },
        recoveryIntensity: { min: 60, max: 70 },
      };

      const structure = createIntervalWorkoutStructure(config);

      expect(structure.structure).toHaveLength(3); // warmup, intervals, cooldown
      expect(structure.primaryLengthMetric).toBe('duration');
      expect(structure.primaryIntensityMetric).toBe('percentOfThresholdPace');
      expect(structure.primaryIntensityTargetOrRange).toBe('range');
    });

    it('should create interval workout structure with custom values', () => {
      const config: IntervalWorkoutConfig = {
        warmupDuration: 15,
        intervalDuration: 3,
        recoveryDuration: 2,
        numberOfIntervals: 6,
        cooldownDuration: 10,
        intervalIntensity: { min: 95, max: 105 },
        recoveryIntensity: { min: 65, max: 75 },
        primaryIntensityMetric: 'percentOfThresholdPower',
      };

      const structure = createIntervalWorkoutStructure(config);

      expect(structure.structure).toHaveLength(3);
      expect(structure.primaryIntensityMetric).toBe('percentOfThresholdPower');
    });
  });

  describe('createCyclingWorkoutStructure', () => {
    it('should create cycling workout structure with default values', () => {
      const structure = createCyclingWorkoutStructure();

      expect(structure.structure).toHaveLength(5); // warmup, sweet spot, recovery, vo2max, cooldown
      expect(structure.primaryLengthMetric).toBe('duration');
      expect(structure.primaryIntensityMetric).toBe('percentOfThresholdPower');
      expect(structure.primaryIntensityTargetOrRange).toBe('range');
    });

    it('should create cycling workout structure with custom values', () => {
      const config: CyclingWorkoutConfig = {
        warmupDuration: 20,
        sweetSpotDuration: 30,
        recoveryDuration: 15,
        vo2maxIntervals: 6,
        vo2maxDuration: 4,
        vo2maxRecoveryDuration: 6,
        cooldownDuration: 20,
      };

      const structure = createCyclingWorkoutStructure(config);

      expect(structure.structure).toHaveLength(5); // warmup, sweet spot, recovery, vo2max, cooldown
    });

    it('should create cycling workout structure without optional sections', () => {
      const config: CyclingWorkoutConfig = {
        warmupDuration: 10,
        sweetSpotDuration: 0, // disabled
        recoveryDuration: 0, // disabled
        vo2maxIntervals: 0, // disabled
        cooldownDuration: 10,
      };

      const structure = createCyclingWorkoutStructure(config);

      expect(structure.structure).toHaveLength(2); // only warmup and cooldown
    });
  });
});

describe('Integration Tests', () => {
  it('should create a complete workout using all builders', () => {
    // Create steps
    const warmupStep = new WorkoutStepBuilder()
      .name('Custom Warmup')
      .duration(8)
      .intensity('warmUp')
      .target(55, 65)
      .build();

    const intervalStep = new WorkoutStepBuilder()
      .name('Custom Interval')
      .duration(4)
      .intensity('active')
      .target(95, 105)
      .build();

    const recoveryStep = new WorkoutStepBuilder()
      .name('Custom Recovery')
      .duration(2)
      .intensity('active')
      .target(65, 75)
      .build();

    // Create elements
    const warmupElement = new StructureElementBuilder()
      .type('step')
      .length(8, 'minute')
      .steps([warmupStep])
      .timeRange(0, 480)
      .build();

    const intervalsElement = new StructureElementBuilder()
      .type('repetition')
      .length(5, 'repetition')
      .steps([intervalStep, recoveryStep])
      .timeRange(480, 1800)
      .build();

    const cooldownElement = new StructureElementBuilder()
      .type('step')
      .length(5, 'minute')
      .steps([createCooldownStep(5)])
      .timeRange(1800, 2100)
      .build();

    // Create structure
    const structure = new WorkoutStructureBuilder()
      .addElements([warmupElement, intervalsElement, cooldownElement])
      .setPrimaryLengthMetric('duration')
      .setPrimaryIntensityMetric('percentOfThresholdPace')
      .setIntensityTargetType('range')
      .build();

    // Verify structure
    expect(structure.structure).toHaveLength(3);
    expect(structure.primaryLengthMetric).toBe('duration');
    expect(structure.primaryIntensityMetric).toBe('percentOfThresholdPace');
    expect(structure.primaryIntensityTargetOrRange).toBe('range');

    // Verify elements
    expect(structure.structure[0].type).toBe('step');
    expect(structure.structure[1].type).toBe('repetition');
    expect(structure.structure[2].type).toBe('step');

    // Verify steps
    expect(structure.structure[0].steps[0].name).toBe('Custom Warmup');
    expect(structure.structure[1].steps[0].name).toBe('Custom Interval');
    expect(structure.structure[1].steps[1].name).toBe('Custom Recovery');
    expect(structure.structure[2].steps[0].name).toBe('Cooldown');
  });

  it('should create workout using helper functions', () => {
    const config: IntervalWorkoutConfig = {
      warmupDuration: 10,
      intervalDuration: 5,
      recoveryDuration: 3,
      numberOfIntervals: 4,
      cooldownDuration: 5,
      intervalIntensity: { min: 90, max: 100 },
      recoveryIntensity: { min: 60, max: 70 },
    };

    const structure = createIntervalWorkoutStructure(config);

    // Verify structure
    expect(structure.structure).toHaveLength(3);
    expect(structure.primaryLengthMetric).toBe('duration');
    expect(structure.primaryIntensityMetric).toBe('percentOfThresholdPace');

    // Verify warmup
    const warmupElement = structure.structure[0];
    expect(warmupElement.type).toBe('step');
    expect(warmupElement.steps[0].name).toBe('Progressive Warmup');
    expect(warmupElement.steps[0].length.value).toBe(10);

    // Verify intervals
    const intervalsElement = structure.structure[1];
    expect(intervalsElement.type).toBe('repetition');
    expect(intervalsElement.length.value).toBe(4);
    expect(intervalsElement.steps).toHaveLength(2);

    // Verify cooldown
    const cooldownElement = structure.structure[2];
    expect(cooldownElement.type).toBe('step');
    expect(cooldownElement.steps[0].name).toBe('Cooldown');
    expect(cooldownElement.steps[0].length.value).toBe(5);
  });
});

describe('SimpleWorkoutStructureBuilder + Converter Integration', () => {
  it('should convert a simple cycling workout built with the builder (10min warmup, 40min active @80% power, 5min cooldown)', () => {
    // Arrange
    const warmup = new SimpleStructureElementBuilder()
      .type('step')
      .length(10, 'minute')
      .steps([
        {
          name: 'Warm Up',
          length: { value: 10, unit: 'minute' },
          targets: [{ minValue: 50, maxValue: 60 }],
          intensityClass: 'warmUp',
          openDuration: false,
        },
      ])
      .build();
    const active = new SimpleStructureElementBuilder()
      .type('step')
      .length(40, 'minute')
      .steps([
        {
          name: 'Active',
          length: { value: 40, unit: 'minute' },
          targets: [{ minValue: 80, maxValue: 80 }],
          intensityClass: 'active',
          openDuration: false,
        },
      ])
      .build();
    const cooldown = new SimpleStructureElementBuilder()
      .type('step')
      .length(5, 'minute')
      .steps([
        {
          name: 'Cool Down',
          length: { value: 5, unit: 'minute' },
          targets: [{ minValue: 50, maxValue: 60 }],
          intensityClass: 'coolDown',
          openDuration: false,
        },
      ])
      .build();
    const simpleCyclingWorkout = new SimpleWorkoutStructureBuilder()
      .addElement(warmup)
      .addElement(active)
      .addElement(cooldown)
      .setPrimaryLengthMetric('duration')
      .setPrimaryIntensityMetric('percentOfThresholdPower')
      .setIntensityTargetType('target')
      .build();

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
});
