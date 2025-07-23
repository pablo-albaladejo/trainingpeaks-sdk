/**
 * Workout Builder Service
 * Provides builders and helper functions for creating workout structures
 */

import type {
  ElementType,
  IntensityClass,
  IntensityMetric,
  IntensityTargetType,
  LengthMetric,
  LengthUnit,
  SimpleWorkoutStructure,
  SimpleWorkoutStructureElement,
  WorkoutLength,
  WorkoutStructure,
  WorkoutStructureElement,
  WorkoutStructureStep,
  WorkoutTarget,
} from '@/types';
import {
  ElementType as ElementTypeEnum,
  IntensityClass as IntensityClassEnum,
  IntensityMetric as IntensityMetricEnum,
  IntensityTargetType as IntensityTargetTypeEnum,
  LengthMetric as LengthMetricEnum,
  LengthUnit as LengthUnitEnum,
} from '@/types';

/**
 * Builder for creating workout steps
 */
export class WorkoutStepBuilder {
  private stepName?: string;
  private stepLength?: WorkoutLength;
  private stepIntensityClass?: IntensityClass;
  private stepTargets?: WorkoutTarget[];
  private stepOpenDuration = false;

  name(name: string): this {
    this.stepName = name;
    return this;
  }

  duration(minutes: number): this {
    this.stepLength = { value: minutes, unit: LengthUnitEnum.MINUTE };
    return this;
  }

  distance(meters: number): this {
    this.stepLength = { value: meters, unit: LengthUnitEnum.METER };
    return this;
  }

  kilometers(km: number): this {
    this.stepLength = { value: km * 1000, unit: LengthUnitEnum.METER };
    return this;
  }

  intensity(intensity: IntensityClass): this {
    this.stepIntensityClass = intensity;
    return this;
  }

  target(min: number, max: number): this {
    this.stepTargets = [{ minValue: min, maxValue: max }];
    return this;
  }

  targets(targets: WorkoutTarget[]): this {
    this.stepTargets = targets;
    return this;
  }

  openDuration(open: boolean = true): this {
    this.stepOpenDuration = open;
    return this;
  }

  build(): WorkoutStructureStep {
    if (
      !this.stepName ||
      !this.stepLength ||
      !this.stepIntensityClass ||
      !this.stepTargets
    ) {
      throw new Error(
        'Incomplete WorkoutStep. Missing required properties: name, length, intensityClass, targets'
      );
    }

    return {
      name: this.stepName,
      length: this.stepLength,
      intensityClass: this.stepIntensityClass,
      targets: this.stepTargets,
      openDuration: this.stepOpenDuration,
    };
  }
}

/**
 * Builder for creating structure elements
 */
export class StructureElementBuilder {
  private element: Partial<WorkoutStructureElement> = {};

  type(elementType: ElementType): this {
    this.element.type = elementType;
    return this;
  }

  length(value: number, unit: LengthUnit): this {
    this.element.length = { value, unit };
    return this;
  }

  steps(steps: WorkoutStructureStep[]): this {
    this.element.steps = steps;
    return this;
  }

  timeRange(beginSeconds: number, endSeconds: number): this {
    this.element.begin = beginSeconds;
    this.element.end = endSeconds;
    return this;
  }

  begin(beginSeconds: number): this {
    this.element.begin = beginSeconds;
    return this;
  }

  end(endSeconds: number): this {
    this.element.end = endSeconds;
    return this;
  }

  build(): WorkoutStructureElement {
    if (
      !this.element.type ||
      !this.element.length ||
      !this.element.steps ||
      this.element.begin === undefined ||
      this.element.end === undefined
    ) {
      throw new Error(
        'Incomplete WorkoutStructureElement. Missing required properties: type, length, steps, begin, end'
      );
    }

    return {
      type: this.element.type,
      length: this.element.length,
      steps: this.element.steps,
      begin: this.element.begin,
      end: this.element.end,
    } as WorkoutStructureElement;
  }
}

/**
 * Builder for creating workout structures
 */
export class WorkoutStructureBuilder {
  private structure: WorkoutStructureElement[] = [];
  private polyline: number[][] = [];
  private primaryLengthMetric: LengthMetric = LengthMetricEnum.DURATION;
  private primaryIntensityMetric: IntensityMetric =
    IntensityMetricEnum.PERCENT_OF_THRESHOLD_PACE;
  private primaryIntensityTargetOrRange: IntensityTargetType =
    IntensityTargetTypeEnum.RANGE;

  addElement(element: WorkoutStructureElement): this {
    this.structure.push(element);
    return this;
  }

  addElements(elements: WorkoutStructureElement[]): this {
    this.structure.push(...elements);
    return this;
  }

  setPolyline(polyline: number[][]): this {
    this.polyline = polyline;
    return this;
  }

  setPrimaryLengthMetric(metric: LengthMetric): this {
    this.primaryLengthMetric = metric;
    return this;
  }

  setPrimaryIntensityMetric(metric: IntensityMetric): this {
    this.primaryIntensityMetric = metric;
    return this;
  }

  setIntensityTargetType(type: IntensityTargetType): this {
    this.primaryIntensityTargetOrRange = type;
    return this;
  }

  build(): WorkoutStructure {
    if (this.structure.length === 0) {
      throw new Error('WorkoutStructure must have at least one element');
    }

    return {
      structure: this.structure,
      polyline: this.polyline,
      primaryLengthMetric: this.primaryLengthMetric,
      primaryIntensityMetric: this.primaryIntensityMetric,
      primaryIntensityTargetOrRange: this.primaryIntensityTargetOrRange,
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS - STEPS
// ============================================================================

export function createWarmupStep(duration: number = 10): WorkoutStructureStep {
  return new WorkoutStepBuilder()
    .name('Progressive Warmup')
    .duration(duration)
    .intensity(IntensityClassEnum.WARM_UP)
    .target(50, 70)
    .build();
}

export function createIntervalStep(
  duration: number,
  intensity: { min: number; max: number },
  name?: string
): WorkoutStructureStep {
  return new WorkoutStepBuilder()
    .name(name || `${duration}min Interval`)
    .duration(duration)
    .intensity(IntensityClassEnum.ACTIVE)
    .target(intensity.min, intensity.max)
    .build();
}

export function createRecoveryStep(
  duration: number,
  intensity: { min: number; max: number },
  name?: string
): WorkoutStructureStep {
  return new WorkoutStepBuilder()
    .name(name || `${duration}min Recovery`)
    .duration(duration)
    .intensity(IntensityClassEnum.ACTIVE)
    .target(intensity.min, intensity.max)
    .build();
}

export function createRestStep(
  duration: number,
  name?: string
): WorkoutStructureStep {
  return new WorkoutStepBuilder()
    .name(name || `${duration}min Rest`)
    .duration(duration)
    .intensity(IntensityClassEnum.REST)
    .target(0, 0)
    .build();
}

export function createCooldownStep(duration: number = 5): WorkoutStructureStep {
  return new WorkoutStepBuilder()
    .name('Cooldown')
    .duration(duration)
    .intensity(IntensityClassEnum.COOL_DOWN)
    .target(45, 55)
    .build();
}

export function createSweetSpotStep(duration: number): WorkoutStructureStep {
  return new WorkoutStepBuilder()
    .name('Sweet Spot Training')
    .duration(duration)
    .intensity(IntensityClassEnum.ACTIVE)
    .target(88, 93)
    .build();
}

export function createVO2MaxStep(duration: number): WorkoutStructureStep {
  return new WorkoutStepBuilder()
    .name('VO2Max Interval')
    .duration(duration)
    .intensity(IntensityClassEnum.ACTIVE)
    .target(120, 130)
    .build();
}

// ============================================================================
// HELPER FUNCTIONS - ELEMENTS
// ============================================================================

export function createWarmupElement(
  duration: number = 10
): WorkoutStructureElement {
  const warmupStep = createWarmupStep(duration);
  return new StructureElementBuilder()
    .type(ElementTypeEnum.STEP)
    .length(duration, LengthUnitEnum.MINUTE)
    .steps([warmupStep])
    .timeRange(0, duration * 60)
    .build();
}

export function createIntervalsElement(
  numberOfIntervals: number,
  intervalDuration: number,
  recoveryDuration: number,
  intervalIntensity: { min: number; max: number },
  recoveryIntensity: { min: number; max: number },
  startTime: number = 0
): WorkoutStructureElement {
  const intervalStep = createIntervalStep(intervalDuration, intervalIntensity);
  const recoveryStep = createRecoveryStep(recoveryDuration, recoveryIntensity);
  const endTime =
    startTime + (intervalDuration + recoveryDuration) * 60 * numberOfIntervals;

  return new StructureElementBuilder()
    .type(ElementTypeEnum.REPETITION)
    .length(numberOfIntervals, LengthUnitEnum.REPETITION)
    .steps([intervalStep, recoveryStep])
    .timeRange(startTime, endTime)
    .build();
}

export function createCooldownElement(
  duration: number = 5,
  startTime: number = 0
): WorkoutStructureElement {
  const cooldownStep = createCooldownStep(duration);
  return new StructureElementBuilder()
    .type(ElementTypeEnum.STEP)
    .length(duration, LengthUnitEnum.MINUTE)
    .steps([cooldownStep])
    .timeRange(startTime, startTime + duration * 60)
    .build();
}

// ============================================================================
// HELPER FUNCTIONS - COMPLETE STRUCTURES
// ============================================================================

export interface IntervalWorkoutConfig {
  warmupDuration?: number;
  intervalDuration: number;
  recoveryDuration: number;
  numberOfIntervals: number;
  cooldownDuration?: number;
  intervalIntensity: { min: number; max: number };
  recoveryIntensity: { min: number; max: number };
  primaryIntensityMetric?: IntensityMetric;
}

export function createIntervalWorkoutStructure(
  config: IntervalWorkoutConfig
): WorkoutStructure {
  const elements: WorkoutStructureElement[] = [];
  let currentTime = 0;

  // Add warmup (default 10 minutes if not specified)
  const warmupDuration = config.warmupDuration ?? 10;
  const warmupElement = createWarmupElement(warmupDuration);
  elements.push(warmupElement);
  currentTime += warmupDuration * 60;

  // Add intervals
  const intervalsElement = createIntervalsElement(
    config.numberOfIntervals,
    config.intervalDuration,
    config.recoveryDuration,
    config.intervalIntensity,
    config.recoveryIntensity,
    currentTime
  );
  elements.push(intervalsElement);
  currentTime +=
    (config.intervalDuration + config.recoveryDuration) *
    60 *
    config.numberOfIntervals;

  // Add cooldown (default 5 minutes if not specified)
  const cooldownDuration = config.cooldownDuration ?? 5;
  const cooldownElement = createCooldownElement(cooldownDuration, currentTime);
  elements.push(cooldownElement);

  return new WorkoutStructureBuilder()
    .addElements(elements)
    .setPrimaryLengthMetric(LengthMetricEnum.DURATION)
    .setPrimaryIntensityMetric(
      config.primaryIntensityMetric ||
        IntensityMetricEnum.PERCENT_OF_THRESHOLD_PACE
    )
    .setIntensityTargetType(IntensityTargetTypeEnum.RANGE)
    .build();
}

export interface CyclingWorkoutConfig {
  warmupDuration?: number;
  sweetSpotDuration?: number;
  recoveryDuration?: number;
  vo2maxIntervals?: number;
  vo2maxDuration?: number;
  vo2maxRecoveryDuration?: number;
  cooldownDuration?: number;
}

export function createCyclingWorkoutStructure(
  config: CyclingWorkoutConfig = {}
): WorkoutStructure {
  const elements: WorkoutStructureElement[] = [];
  let currentTime = 0;

  // Add warmup (default 15 minutes if not specified)
  const warmupDuration = config.warmupDuration ?? 15;
  if (warmupDuration > 0) {
    const warmupElement = createWarmupElement(warmupDuration);
    elements.push(warmupElement);
    currentTime += warmupDuration * 60;
  }

  // Add sweet spot training (default 20 minutes if not specified)
  const sweetSpotDuration = config.sweetSpotDuration ?? 20;
  if (sweetSpotDuration > 0) {
    const sweetSpotStep = createSweetSpotStep(sweetSpotDuration);
    const sweetSpotElement = new StructureElementBuilder()
      .type(ElementTypeEnum.STEP)
      .length(sweetSpotDuration, LengthUnitEnum.MINUTE)
      .steps([sweetSpotStep])
      .timeRange(currentTime, currentTime + sweetSpotDuration * 60)
      .build();
    elements.push(sweetSpotElement);
    currentTime += sweetSpotDuration * 60;
  }

  // Add recovery (default 10 minutes if not specified)
  const recoveryDuration = config.recoveryDuration ?? 10;
  if (recoveryDuration > 0) {
    const recoveryStep = createRecoveryStep(recoveryDuration, {
      min: 60,
      max: 70,
    });
    const recoveryElement = new StructureElementBuilder()
      .type(ElementTypeEnum.STEP)
      .length(recoveryDuration, LengthUnitEnum.MINUTE)
      .steps([recoveryStep])
      .timeRange(currentTime, currentTime + recoveryDuration * 60)
      .build();
    elements.push(recoveryElement);
    currentTime += recoveryDuration * 60;
  }

  // Add VO2Max intervals (default 4 intervals if not specified)
  const vo2maxIntervals = config.vo2maxIntervals ?? 4;
  if (vo2maxIntervals > 0) {
    const vo2maxDuration = config.vo2maxDuration ?? 3;
    const vo2maxRecoveryDuration = config.vo2maxRecoveryDuration ?? 5;

    const vo2maxStep = createVO2MaxStep(vo2maxDuration);
    const vo2maxRecoveryStep = createRecoveryStep(vo2maxRecoveryDuration, {
      min: 50,
      max: 60,
    });

    const vo2maxElement = new StructureElementBuilder()
      .type(ElementTypeEnum.REPETITION)
      .length(vo2maxIntervals, LengthUnitEnum.REPETITION)
      .steps([vo2maxStep, vo2maxRecoveryStep])
      .timeRange(
        currentTime,
        currentTime +
          (vo2maxDuration + vo2maxRecoveryDuration) * 60 * vo2maxIntervals
      )
      .build();
    elements.push(vo2maxElement);
    currentTime +=
      (vo2maxDuration + vo2maxRecoveryDuration) * 60 * vo2maxIntervals;
  }

  // Add cooldown (default 15 minutes if not specified)
  const cooldownDuration = config.cooldownDuration ?? 15;
  if (cooldownDuration > 0) {
    const cooldownElement = createCooldownElement(
      cooldownDuration,
      currentTime
    );
    elements.push(cooldownElement);
  }

  return new WorkoutStructureBuilder()
    .addElements(elements)
    .setPrimaryLengthMetric(LengthMetricEnum.DURATION)
    .setPrimaryIntensityMetric(IntensityMetricEnum.PERCENT_OF_THRESHOLD_POWER)
    .setIntensityTargetType(IntensityTargetTypeEnum.RANGE)
    .build();
}

// ============================================================================
// SIMPLE WORKOUT STRUCTURE BUILDERS
// ============================================================================

/**
 * Builder for creating simple workout structures (without timeRange and polyline)
 */
export class SimpleWorkoutStructureBuilder {
  private structure: SimpleWorkoutStructureElement[] = [];
  private primaryLengthMetric: LengthMetric = LengthMetricEnum.DURATION;
  private primaryIntensityMetric: IntensityMetric =
    IntensityMetricEnum.PERCENT_OF_THRESHOLD_PACE;
  private intensityTargetType: IntensityTargetType =
    IntensityTargetTypeEnum.RANGE;

  addElement(
    element: SimpleWorkoutStructureElement
  ): SimpleWorkoutStructureBuilder {
    this.structure.push(element);
    return this;
  }

  addElements(
    elements: SimpleWorkoutStructureElement[]
  ): SimpleWorkoutStructureBuilder {
    this.structure.push(...elements);
    return this;
  }

  setPrimaryLengthMetric(metric: LengthMetric): SimpleWorkoutStructureBuilder {
    this.primaryLengthMetric = metric;
    return this;
  }

  setPrimaryIntensityMetric(
    metric: IntensityMetric
  ): SimpleWorkoutStructureBuilder {
    this.primaryIntensityMetric = metric;
    return this;
  }

  setIntensityTargetType(
    type: IntensityTargetType
  ): SimpleWorkoutStructureBuilder {
    this.intensityTargetType = type;
    return this;
  }

  build(): SimpleWorkoutStructure {
    if (this.structure.length === 0) {
      throw new Error('SimpleWorkoutStructure must have at least one element');
    }

    return {
      structure: this.structure,
      primaryLengthMetric: this.primaryLengthMetric,
      primaryIntensityMetric: this.primaryIntensityMetric,
      intensityTargetType: this.intensityTargetType,
    };
  }
}

/**
 * Builder for creating simple structure elements
 */
export class SimpleStructureElementBuilder {
  private element: Partial<SimpleWorkoutStructureElement> = {};

  type(type: ElementType): SimpleStructureElementBuilder {
    this.element.type = type;
    return this;
  }

  length(value: number, unit: LengthUnit): SimpleStructureElementBuilder {
    this.element.length = { value, unit };
    return this;
  }

  steps(steps: WorkoutStructureStep[]): SimpleStructureElementBuilder {
    this.element.steps = steps;
    return this;
  }

  build(): SimpleWorkoutStructureElement {
    if (!this.element.type || !this.element.length || !this.element.steps) {
      throw new Error(
        'Incomplete SimpleWorkoutStructureElement. Missing required properties: type, length, steps'
      );
    }

    return {
      type: this.element.type,
      length: this.element.length,
      steps: this.element.steps,
    } as SimpleWorkoutStructureElement;
  }
}

/**
 * Helper function to create a simple cycling workout structure
 */
export const createSimpleCyclingWorkoutStructure = (params: {
  warmupDuration: number;
  intervalDuration: number;
  recoveryDuration: number;
  numberOfIntervals: number;
  cooldownDuration: number;
  intervalIntensity: { min: number; max: number };
  recoveryIntensity: { min: number; max: number };
  primaryIntensityMetric?: IntensityMetric;
}): SimpleWorkoutStructure => {
  const elements: SimpleWorkoutStructureElement[] = [];

  // Add warmup
  elements.push(
    new SimpleStructureElementBuilder()
      .type(ElementTypeEnum.STEP)
      .length(params.warmupDuration, LengthUnitEnum.MINUTE)
      .steps([createWarmupStep(params.warmupDuration)])
      .build()
  );

  // Add intervals
  const intervalStep = createIntervalStep(
    params.intervalDuration,
    params.intervalIntensity
  );
  const recoveryStep = createRecoveryStep(
    params.recoveryDuration,
    params.recoveryIntensity
  );

  elements.push(
    new SimpleStructureElementBuilder()
      .type(ElementTypeEnum.REPETITION)
      .length(params.numberOfIntervals, LengthUnitEnum.REPETITION)
      .steps([intervalStep, recoveryStep])
      .build()
  );

  // Add cooldown
  elements.push(
    new SimpleStructureElementBuilder()
      .type(ElementTypeEnum.STEP)
      .length(params.cooldownDuration, LengthUnitEnum.MINUTE)
      .steps([createCooldownStep(params.cooldownDuration)])
      .build()
  );

  return new SimpleWorkoutStructureBuilder()
    .addElements(elements)
    .setPrimaryLengthMetric(LengthMetricEnum.DURATION)
    .setPrimaryIntensityMetric(
      params.primaryIntensityMetric ||
        IntensityMetricEnum.PERCENT_OF_THRESHOLD_POWER
    )
    .setIntensityTargetType(IntensityTargetTypeEnum.RANGE)
    .build();
};
