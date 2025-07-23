/**
 * Workout Builder Service
 *
 * Implements the Builder pattern for creating structured workouts
 * in a more readable and maintainable way.
 */

import type {
  SimpleWorkoutStructure,
  SimpleWorkoutStructureElement,
  WorkoutLength,
  WorkoutStructure,
  WorkoutStructureElement,
  WorkoutStructureStep,
  WorkoutTarget,
} from '@/types';

// ============================================================================
// WORKOUT STEP BUILDER CLASS
// ============================================================================

export class WorkoutStepBuilder {
  private step: Partial<WorkoutStructureStep> = {};

  name(name: string): WorkoutStepBuilder {
    this.step.name = name;
    return this;
  }

  duration(minutes: number): WorkoutStepBuilder {
    this.step.length = { value: minutes, unit: 'minute' } as WorkoutLength;
    return this;
  }

  distance(meters: number): WorkoutStepBuilder {
    this.step.length = { value: meters, unit: 'meter' } as WorkoutLength;
    return this;
  }

  kilometers(km: number): WorkoutStepBuilder {
    this.step.length = { value: km * 1000, unit: 'meter' } as WorkoutLength;
    return this;
  }

  intensity(
    intensityClass: 'active' | 'rest' | 'warmUp' | 'coolDown'
  ): WorkoutStepBuilder {
    this.step.intensityClass = intensityClass;
    return this;
  }

  target(minValue: number, maxValue: number): WorkoutStepBuilder {
    this.step.targets = [{ minValue, maxValue } as WorkoutTarget];
    return this;
  }

  targets(targets: WorkoutTarget[]): WorkoutStepBuilder {
    this.step.targets = targets;
    return this;
  }

  openDuration(open: boolean = true): WorkoutStepBuilder {
    this.step.openDuration = open;
    return this;
  }

  build(): WorkoutStructureStep {
    if (
      !this.step.name ||
      !this.step.length ||
      !this.step.intensityClass ||
      !this.step.targets
    ) {
      throw new Error(
        'Incomplete WorkoutStep. Missing required properties: name, length, intensityClass, targets'
      );
    }

    return {
      name: this.step.name,
      length: this.step.length,
      intensityClass: this.step.intensityClass,
      targets: this.step.targets,
      openDuration: this.step.openDuration ?? false,
    } as WorkoutStructureStep;
  }
}

// ============================================================================
// STRUCTURE ELEMENT BUILDER CLASS
// ============================================================================

export class StructureElementBuilder {
  private element: Partial<WorkoutStructureElement> = {};

  type(elementType: 'step' | 'repetition'): StructureElementBuilder {
    this.element.type = elementType;
    return this;
  }

  length(
    value: number,
    unit: 'minute' | 'repetition' | 'meter' | 'kilometer'
  ): StructureElementBuilder {
    this.element.length = { value, unit } as WorkoutLength;
    return this;
  }

  steps(steps: WorkoutStructureStep[]): StructureElementBuilder {
    this.element.steps = steps;
    return this;
  }

  timeRange(beginSeconds: number, endSeconds: number): StructureElementBuilder {
    this.element.begin = beginSeconds;
    this.element.end = endSeconds;
    return this;
  }

  begin(beginSeconds: number): StructureElementBuilder {
    this.element.begin = beginSeconds;
    return this;
  }

  end(endSeconds: number): StructureElementBuilder {
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
      polyline: [],
    } as WorkoutStructureElement;
  }
}

// ============================================================================
// WORKOUT STRUCTURE BUILDER
// ============================================================================

export class WorkoutStructureBuilder {
  private structure: WorkoutStructureElement[] = [];
  private polyline: number[][] = [];
  private primaryLengthMetric: 'duration' | 'distance' = 'duration';
  private primaryIntensityMetric:
    | 'percentOfThresholdPace'
    | 'percentOfThresholdPower'
    | 'heartRate'
    | 'power'
    | 'pace'
    | 'speed' = 'percentOfThresholdPace';
  private primaryIntensityTargetOrRange: 'target' | 'range' = 'range';

  addElement(element: WorkoutStructureElement): WorkoutStructureBuilder {
    this.structure.push(element);
    return this;
  }

  addElements(elements: WorkoutStructureElement[]): WorkoutStructureBuilder {
    this.structure.push(...elements);
    return this;
  }

  setPolyline(polyline: number[][]): WorkoutStructureBuilder {
    this.polyline = polyline;
    return this;
  }

  setPrimaryLengthMetric(
    metric: 'duration' | 'distance'
  ): WorkoutStructureBuilder {
    this.primaryLengthMetric = metric;
    return this;
  }

  setPrimaryIntensityMetric(
    metric:
      | 'percentOfThresholdPace'
      | 'percentOfThresholdPower'
      | 'heartRate'
      | 'power'
      | 'pace'
      | 'speed'
  ): WorkoutStructureBuilder {
    this.primaryIntensityMetric = metric;
    return this;
  }

  setIntensityTargetType(type: 'target' | 'range'): WorkoutStructureBuilder {
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
// HELPER FUNCTIONS FOR CREATING COMMON STEPS
// ============================================================================

export function createWarmupStep(duration: number = 10): WorkoutStructureStep {
  return new WorkoutStepBuilder()
    .name('Progressive Warmup')
    .duration(duration)
    .intensity('warmUp')
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
    .intensity('active')
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
    .intensity('active')
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
    .intensity('rest')
    .target(0, 0)
    .build();
}

export function createCooldownStep(duration: number = 5): WorkoutStructureStep {
  return new WorkoutStepBuilder()
    .name('Cooldown')
    .duration(duration)
    .intensity('coolDown')
    .target(45, 55)
    .build();
}

export function createSweetSpotStep(duration: number): WorkoutStructureStep {
  return new WorkoutStepBuilder()
    .name('Sweet Spot Training')
    .duration(duration)
    .intensity('active')
    .target(88, 93)
    .build();
}

export function createVO2MaxStep(duration: number): WorkoutStructureStep {
  return new WorkoutStepBuilder()
    .name('VO2Max Interval')
    .duration(duration)
    .intensity('active')
    .target(120, 130)
    .build();
}

// ============================================================================
// HELPER FUNCTIONS FOR CREATING COMMON ELEMENTS
// ============================================================================

export function createWarmupElement(
  duration: number = 10
): WorkoutStructureElement {
  const warmupStep = createWarmupStep(duration);
  return new StructureElementBuilder()
    .type('step')
    .length(duration, 'minute')
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

  const totalDuration =
    (intervalDuration + recoveryDuration) * numberOfIntervals;
  const endTime = startTime + totalDuration * 60;

  return new StructureElementBuilder()
    .type('repetition')
    .length(numberOfIntervals, 'repetition')
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
    .type('step')
    .length(duration, 'minute')
    .steps([cooldownStep])
    .timeRange(startTime, startTime + duration * 60)
    .build();
}

// ============================================================================
// HELPER FUNCTIONS FOR CREATING COMPLETE STRUCTURES
// ============================================================================

export interface IntervalWorkoutConfig {
  warmupDuration?: number;
  intervalDuration: number;
  recoveryDuration: number;
  numberOfIntervals: number;
  cooldownDuration?: number;
  intervalIntensity: { min: number; max: number };
  recoveryIntensity: { min: number; max: number };
  primaryIntensityMetric?: string;
}

export function createIntervalWorkoutStructure(
  config: IntervalWorkoutConfig
): WorkoutStructure {
  const warmupDuration = config.warmupDuration ?? 10;
  const cooldownDuration = config.cooldownDuration ?? 5;

  // Create elements
  const warmupElement = createWarmupElement(warmupDuration);
  const intervalsElement = createIntervalsElement(
    config.numberOfIntervals,
    config.intervalDuration,
    config.recoveryDuration,
    config.intervalIntensity,
    config.recoveryIntensity,
    warmupDuration * 60
  );
  const cooldownElement = createCooldownElement(
    cooldownDuration,
    intervalsElement.end
  );

  // Build complete structure
  return new WorkoutStructureBuilder()
    .addElements([warmupElement, intervalsElement, cooldownElement])
    .setPrimaryLengthMetric('duration')
    .setPrimaryIntensityMetric(
      config.primaryIntensityMetric || 'percentOfThresholdPace'
    )
    .setIntensityTargetType('range')
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
  const warmupDuration = config.warmupDuration ?? 15;
  const sweetSpotDuration = config.sweetSpotDuration ?? 20;
  const recoveryDuration = config.recoveryDuration ?? 10;
  const vo2maxIntervals = config.vo2maxIntervals ?? 4;
  const vo2maxDuration = config.vo2maxDuration ?? 3;
  const vo2maxRecoveryDuration = config.vo2maxRecoveryDuration ?? 5;
  const cooldownDuration = config.cooldownDuration ?? 15;

  const elements: WorkoutStructureElement[] = [];
  let currentTime = 0;

  // Warmup
  const warmupElement = createWarmupElement(warmupDuration);
  warmupElement.begin = currentTime;
  warmupElement.end = currentTime + warmupDuration * 60;
  elements.push(warmupElement);
  currentTime = warmupElement.end;

  // Sweet Spot
  if (sweetSpotDuration > 0) {
    const sweetSpotStep = createSweetSpotStep(sweetSpotDuration);
    const sweetSpotElement = new StructureElementBuilder()
      .type('step')
      .length(sweetSpotDuration, 'minute')
      .steps([sweetSpotStep])
      .timeRange(currentTime, currentTime + sweetSpotDuration * 60)
      .build();
    elements.push(sweetSpotElement);
    currentTime = sweetSpotElement.end;
  }

  // Recovery
  if (recoveryDuration > 0) {
    const recoveryStep = createRecoveryStep(recoveryDuration, {
      min: 55,
      max: 65,
    });
    const recoveryElement = new StructureElementBuilder()
      .type('step')
      .length(recoveryDuration, 'minute')
      .steps([recoveryStep])
      .timeRange(currentTime, currentTime + recoveryDuration * 60)
      .build();
    elements.push(recoveryElement);
    currentTime = recoveryElement.end;
  }

  // VO2Max intervals
  if (vo2maxIntervals > 0) {
    const vo2maxStep = createVO2MaxStep(vo2maxDuration);
    const vo2maxRecoveryStep = createRestStep(vo2maxRecoveryDuration);

    const vo2maxElement = new StructureElementBuilder()
      .type('repetition')
      .length(vo2maxIntervals, 'repetition')
      .steps([vo2maxStep, vo2maxRecoveryStep])
      .timeRange(
        currentTime,
        currentTime +
          (vo2maxDuration + vo2maxRecoveryDuration) * 60 * vo2maxIntervals
      )
      .build();
    elements.push(vo2maxElement);
    currentTime = vo2maxElement.end;
  }

  // Cooldown
  const cooldownElement = createCooldownElement(cooldownDuration, currentTime);
  elements.push(cooldownElement);

  return new WorkoutStructureBuilder()
    .addElements(elements)
    .setPrimaryLengthMetric('duration')
    .setPrimaryIntensityMetric('percentOfThresholdPower')
    .setIntensityTargetType('range')
    .build();
}

/**
 * Create a simple cycling workout structure
 */
export const createSimpleCyclingWorkoutStructure = (params: {
  warmupDuration: number;
  intervalDuration: number;
  recoveryDuration: number;
  numberOfIntervals: number;
  cooldownDuration: number;
  intervalIntensity: { min: number; max: number };
  recoveryIntensity: { min: number; max: number };
  primaryIntensityMetric?:
    | 'percentOfThresholdPace'
    | 'percentOfThresholdPower'
    | 'heartRate'
    | 'power'
    | 'pace'
    | 'speed';
}): WorkoutStructure => {
  const elements: WorkoutStructureElement[] = [];

  // Warm up
  elements.push(
    new StructureElementBuilder()
      .type('step')
      .length(params.warmupDuration, 'minute')
      .steps([createWarmupStep(params.warmupDuration)])
      .begin(0)
      .end(params.warmupDuration * 60)
      .build()
  );

  // Intervals
  const intervalSteps = [
    createIntervalStep(params.intervalDuration, params.intervalIntensity),
    createRecoveryStep(params.recoveryDuration, params.recoveryIntensity),
  ];

  elements.push(
    new StructureElementBuilder()
      .type('repetition')
      .length(params.numberOfIntervals, 'repetition')
      .steps(intervalSteps)
      .begin(params.warmupDuration * 60)
      .end((params.warmupDuration + params.numberOfIntervals) * 60)
      .build()
  );

  // Cool down
  elements.push(
    new StructureElementBuilder()
      .type('step')
      .length(params.cooldownDuration, 'minute')
      .steps([createCooldownStep(params.cooldownDuration)])
      .begin((params.warmupDuration + params.numberOfIntervals) * 60)
      .end(
        (params.warmupDuration +
          params.numberOfIntervals +
          params.cooldownDuration) *
          60
      )
      .build()
  );

  return new WorkoutStructureBuilder()
    .addElements(elements)
    .setPrimaryLengthMetric('duration')
    .setPrimaryIntensityMetric(
      params.primaryIntensityMetric || 'percentOfThresholdPace'
    )
    .setIntensityTargetType('range')
    .build();
};

/**
 * Simple Workout Structure Builder
 * Builds simplified workout structures without timeRange or polyline
 */
export class SimpleWorkoutStructureBuilder {
  private structure: SimpleWorkoutStructureElement[] = [];
  private primaryLengthMetric: 'duration' | 'distance' = 'duration';
  private primaryIntensityMetric:
    | 'percentOfThresholdPace'
    | 'percentOfThresholdPower'
    | 'heartRate'
    | 'power'
    | 'pace'
    | 'speed' = 'percentOfThresholdPace';
  private intensityTargetType: 'target' | 'range' = 'range';

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

  setPrimaryLengthMetric(
    metric: 'duration' | 'distance'
  ): SimpleWorkoutStructureBuilder {
    this.primaryLengthMetric = metric;
    return this;
  }

  setPrimaryIntensityMetric(
    metric:
      | 'percentOfThresholdPace'
      | 'percentOfThresholdPower'
      | 'heartRate'
      | 'power'
      | 'pace'
      | 'speed'
  ): SimpleWorkoutStructureBuilder {
    this.primaryIntensityMetric = metric;
    return this;
  }

  setIntensityTargetType(
    type: 'target' | 'range'
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
 * Simple Structure Element Builder
 * Builds simplified workout structure elements without timeRange or polyline
 */
export class SimpleStructureElementBuilder {
  private element: Partial<SimpleWorkoutStructureElement> = {};

  type(type: 'step' | 'repetition'): SimpleStructureElementBuilder {
    this.element.type = type;
    return this;
  }

  length(
    value: number,
    unit:
      | 'minute'
      | 'second'
      | 'hour'
      | 'repetition'
      | 'meter'
      | 'kilometer'
      | 'mile'
  ): SimpleStructureElementBuilder {
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
