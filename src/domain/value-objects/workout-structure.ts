/**
 * Workout Structure Value Objects
 * Domain value objects using Zod schemas for validation
 */

import {
  WorkoutLengthSchema,
  WorkoutStepSchema,
  WorkoutStructureElementSchema,
  WorkoutStructureSchema,
  WorkoutTargetSchema,
  type WorkoutIntensityClass,
  type WorkoutIntensityMetric,
  type WorkoutIntensityTargetType,
  type WorkoutLength as WorkoutLengthData,
  type WorkoutLengthMetric,
  type WorkoutLengthUnit,
  type WorkoutStep as WorkoutStepData,
  type WorkoutStructure as WorkoutStructureData,
  type WorkoutStructureElement as WorkoutStructureElementData,
  type WorkoutTarget as WorkoutTargetData,
} from '@/domain/schemas/workout-structure.schema';

/**
 * WorkoutLength Value Object
 */
export class WorkoutLength {
  private constructor(private readonly _data: WorkoutLengthData) {}

  public static create(value: number, unit: WorkoutLengthUnit): WorkoutLength {
    const data = { value, unit };
    const validated = WorkoutLengthSchema.parse(data);
    return new WorkoutLength(validated);
  }

  public static fromData(data: WorkoutLengthData): WorkoutLength {
    const validated = WorkoutLengthSchema.parse(data);
    return new WorkoutLength(validated);
  }

  public get value(): number {
    return this._data.value;
  }

  public get unit(): WorkoutLengthUnit {
    return this._data.unit;
  }

  public toData(): WorkoutLengthData {
    return { ...this._data };
  }

  public toSeconds(): number | null {
    switch (this._data.unit) {
      case 'second':
        return this._data.value;
      case 'minute':
        return this._data.value * 60;
      case 'hour':
        return this._data.value * 3600;
      default:
        return null;
    }
  }

  public toMeters(): number | null {
    switch (this._data.unit) {
      case 'meter':
        return this._data.value;
      case 'kilometer':
        return this._data.value * 1000;
      case 'mile':
        return this._data.value * 1609.344;
      default:
        return null;
    }
  }

  public isTimeUnit(): boolean {
    return ['second', 'minute', 'hour'].includes(this._data.unit);
  }

  public isDistanceUnit(): boolean {
    return ['meter', 'kilometer', 'mile'].includes(this._data.unit);
  }

  public isRepetitionUnit(): boolean {
    return this._data.unit === 'repetition';
  }

  public equals(other: WorkoutLength): boolean {
    return (
      this._data.value === other._data.value &&
      this._data.unit === other._data.unit
    );
  }

  public toString(): string {
    return `${this._data.value} ${this._data.unit}${this._data.value !== 1 ? 's' : ''}`;
  }
}

/**
 * WorkoutTarget Value Object
 */
export class WorkoutTarget {
  private constructor(private readonly _data: WorkoutTargetData) {}

  public static create(minValue: number, maxValue: number): WorkoutTarget {
    const data = { minValue, maxValue };
    const validated = WorkoutTargetSchema.parse(data);
    return new WorkoutTarget(validated);
  }

  public static fromData(data: WorkoutTargetData): WorkoutTarget {
    const validated = WorkoutTargetSchema.parse(data);
    return new WorkoutTarget(validated);
  }

  public get minValue(): number {
    return this._data.minValue;
  }

  public get maxValue(): number {
    return this._data.maxValue;
  }

  public toData(): WorkoutTargetData {
    return { ...this._data };
  }

  public isSingleTarget(): boolean {
    return this._data.minValue === this._data.maxValue;
  }

  public isRangeTarget(): boolean {
    return this._data.minValue < this._data.maxValue;
  }

  public getRangeWidth(): number {
    return this._data.maxValue - this._data.minValue;
  }

  public getMidpoint(): number {
    return (this._data.minValue + this._data.maxValue) / 2;
  }

  public isValueInRange(value: number): boolean {
    return value >= this._data.minValue && value <= this._data.maxValue;
  }

  public equals(other: WorkoutTarget): boolean {
    return (
      this._data.minValue === other._data.minValue &&
      this._data.maxValue === other._data.maxValue
    );
  }

  public toString(): string {
    if (this.isSingleTarget()) {
      return `${this._data.minValue}`;
    }
    return `${this._data.minValue}-${this._data.maxValue}`;
  }
}

/**
 * WorkoutStep Value Object
 */
export class WorkoutStep {
  private constructor(private readonly _data: WorkoutStepData) {}

  public static create(
    name: string,
    length: WorkoutLength,
    targets: WorkoutTarget[],
    intensityClass: WorkoutIntensityClass,
    openDuration: boolean = false
  ): WorkoutStep {
    const data = {
      name,
      length: length.toData(),
      targets: targets.map((t) => t.toData()),
      intensityClass,
      openDuration,
    };
    const validated = WorkoutStepSchema.parse(data);
    return new WorkoutStep(validated);
  }

  public static fromData(data: WorkoutStepData): WorkoutStep {
    const validated = WorkoutStepSchema.parse(data);
    return new WorkoutStep(validated);
  }

  public get name(): string {
    return this._data.name;
  }

  public get length(): WorkoutLength {
    return WorkoutLength.fromData(this._data.length);
  }

  public get targets(): WorkoutTarget[] {
    return this._data.targets.map((t) => WorkoutTarget.fromData(t));
  }

  public get intensityClass(): WorkoutIntensityClass {
    return this._data.intensityClass;
  }

  public get openDuration(): boolean {
    return this._data.openDuration;
  }

  public toData(): WorkoutStepData {
    return { ...this._data };
  }

  public isRest(): boolean {
    return this._data.intensityClass === 'rest';
  }

  public isActive(): boolean {
    return this._data.intensityClass === 'active';
  }

  public isWarmUp(): boolean {
    return this._data.intensityClass === 'warmUp';
  }

  public isCoolDown(): boolean {
    return this._data.intensityClass === 'coolDown';
  }

  public getPrimaryTarget(): WorkoutTarget | null {
    return this._data.targets.length > 0
      ? WorkoutTarget.fromData(this._data.targets[0]!)
      : null;
  }

  public getDurationInSeconds(): number | null {
    return this.length.toSeconds();
  }

  public getDistanceInMeters(): number | null {
    return this.length.toMeters();
  }

  public equals(other: WorkoutStep): boolean {
    return (
      this._data.name === other._data.name &&
      this.length.equals(other.length) &&
      this._data.intensityClass === other._data.intensityClass &&
      this._data.openDuration === other._data.openDuration &&
      this._data.targets.length === other._data.targets.length &&
      this._data.targets.every((target, index) => {
        const otherTarget = other._data.targets[index];
        return (
          otherTarget &&
          target.minValue === otherTarget.minValue &&
          target.maxValue === otherTarget.maxValue
        );
      })
    );
  }

  public toString(): string {
    const duration = this.getDurationInSeconds();
    const distance = this.getDistanceInMeters();

    let description = `${this._data.name} (${this._data.intensityClass})`;

    if (duration !== null) {
      description += ` - ${duration}s`;
    } else if (distance !== null) {
      description += ` - ${distance}m`;
    } else {
      description += ` - ${this.length.toString()}`;
    }

    if (this._data.targets.length > 0) {
      description += ` @ ${this._data.targets.map((t) => `${t.minValue}-${t.maxValue}`).join(', ')}`;
    }

    return description;
  }
}

/**
 * WorkoutStructureElement Value Object
 */
export class WorkoutStructureElement {
  private constructor(private readonly _data: WorkoutStructureElementData) {}

  public static create(
    type: 'step' | 'repetition',
    length: WorkoutLength,
    steps: WorkoutStep[],
    begin: number,
    end: number
  ): WorkoutStructureElement {
    const data = {
      type,
      length: length.toData(),
      steps: steps.map((s) => s.toData()),
      begin,
      end,
    };
    const validated = WorkoutStructureElementSchema.parse(data);
    return new WorkoutStructureElement(validated);
  }

  public static fromData(
    data: WorkoutStructureElementData
  ): WorkoutStructureElement {
    const validated = WorkoutStructureElementSchema.parse(data);
    return new WorkoutStructureElement(validated);
  }

  public get type(): 'step' | 'repetition' {
    return this._data.type;
  }

  public get length(): WorkoutLength {
    return WorkoutLength.fromData(this._data.length);
  }

  public get steps(): WorkoutStep[] {
    return this._data.steps.map((s) => WorkoutStep.fromData(s));
  }

  public get begin(): number {
    return this._data.begin;
  }

  public get end(): number {
    return this._data.end;
  }

  public toData(): WorkoutStructureElementData {
    return { ...this._data };
  }

  public getDuration(): number {
    return this._data.end - this._data.begin;
  }

  public equals(other: WorkoutStructureElement): boolean {
    return (
      this._data.type === other._data.type &&
      this.length.equals(other.length) &&
      this._data.begin === other._data.begin &&
      this._data.end === other._data.end &&
      this._data.steps.length === other._data.steps.length &&
      this._data.steps.every((step, index) => {
        const otherStep = other._data.steps[index];
        return otherStep && step.name === otherStep.name;
      })
    );
  }
}

/**
 * WorkoutStructure Value Object
 */
export class WorkoutStructure {
  private constructor(private readonly _data: WorkoutStructureData) {}

  public static create(
    structure: WorkoutStructureElement[],
    polyline: number[][],
    primaryLengthMetric: WorkoutLengthMetric,
    primaryIntensityMetric: WorkoutIntensityMetric,
    primaryIntensityTargetOrRange: WorkoutIntensityTargetType
  ): WorkoutStructure {
    const data = {
      structure: structure.map((s) => s.toData()),
      polyline,
      primaryLengthMetric,
      primaryIntensityMetric,
      primaryIntensityTargetOrRange,
    };
    const validated = WorkoutStructureSchema.parse(data);
    return new WorkoutStructure(validated);
  }

  public static fromData(data: WorkoutStructureData): WorkoutStructure {
    const validated = WorkoutStructureSchema.parse(data);
    return new WorkoutStructure(validated);
  }

  public get structure(): WorkoutStructureElement[] {
    return this._data.structure.map((s) => WorkoutStructureElement.fromData(s));
  }

  public get polyline(): number[][] {
    return [...this._data.polyline];
  }

  public get primaryLengthMetric(): WorkoutLengthMetric {
    return this._data.primaryLengthMetric;
  }

  public get primaryIntensityMetric(): WorkoutIntensityMetric {
    return this._data.primaryIntensityMetric;
  }

  public get primaryIntensityTargetOrRange(): WorkoutIntensityTargetType {
    return this._data.primaryIntensityTargetOrRange;
  }

  public toData(): WorkoutStructureData {
    return { ...this._data };
  }

  public getTotalDuration(): number {
    return this._data.structure.reduce((total, element) => {
      return total + (element.end - element.begin);
    }, 0);
  }

  public getAllSteps(): WorkoutStep[] {
    return this._data.structure.flatMap((element) =>
      element.steps.map((step) => WorkoutStep.fromData(step))
    );
  }

  public getActiveSteps(): WorkoutStep[] {
    return this.getAllSteps().filter((step) => step.isActive());
  }

  public getRestSteps(): WorkoutStep[] {
    return this.getAllSteps().filter((step) => step.isRest());
  }

  public getElementsByType(
    type: 'step' | 'repetition'
  ): WorkoutStructureElement[] {
    return this.structure.filter((element) => element.type === type);
  }

  public getRepetitions(): WorkoutStructureElement[] {
    return this.getElementsByType('repetition');
  }

  public getStepElements(): WorkoutStructureElement[] {
    return this.getElementsByType('step');
  }

  public isTimeBased(): boolean {
    return this._data.primaryLengthMetric === 'duration';
  }

  public isDistanceBased(): boolean {
    return this._data.primaryLengthMetric === 'distance';
  }

  public calculateAverageIntensity(): number {
    const steps = this.getAllSteps();
    if (steps.length === 0) return 0;

    const totalIntensity = steps.reduce((sum, step) => {
      const primaryTarget = step.getPrimaryTarget();
      const stepIntensity = primaryTarget ? primaryTarget.getMidpoint() : 0;
      return sum + stepIntensity;
    }, 0);

    return totalIntensity / steps.length;
  }

  public equals(other: WorkoutStructure): boolean {
    return (
      this._data.primaryLengthMetric === other._data.primaryLengthMetric &&
      this._data.primaryIntensityMetric ===
        other._data.primaryIntensityMetric &&
      this._data.primaryIntensityTargetOrRange ===
        other._data.primaryIntensityTargetOrRange &&
      this._data.structure.length === other._data.structure.length &&
      this._data.structure.every((element, index) => {
        const otherElement = other._data.structure[index];
        return otherElement && element.type === otherElement.type;
      })
    );
  }

  public toString(): string {
    const duration = this.getTotalDuration();
    const stepCount = this.getAllSteps().length;
    const activeStepCount = this.getActiveSteps().length;
    const repetitionCount = this.getRepetitions().length;

    return `Workout Structure (${duration}s, ${stepCount} steps, ${activeStepCount} active, ${repetitionCount} repetitions)`;
  }
}
