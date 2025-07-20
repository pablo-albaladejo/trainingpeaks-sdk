/**
 * Workout Structure Value Object
 * Represents the complete structure of a workout with elements, polyline, and metadata
 */

import {
  WorkoutLength,
  WorkoutLengthUnit,
} from '@/domain/value-objects/workout-length';
import {
  WorkoutIntensityClass,
  WorkoutStep,
} from '@/domain/value-objects/workout-step';

export type WorkoutElementType = 'step' | 'repetition';
export type WorkoutLengthMetric = 'duration' | 'distance';
export type WorkoutIntensityMetric =
  | 'percentOfThresholdPace'
  | 'percentOfThresholdPower'
  | 'heartRate'
  | 'power'
  | 'pace'
  | 'speed';
export type WorkoutIntensityTargetType = 'target' | 'range';

export type WorkoutStructureElement = {
  /** Element type */
  type: WorkoutElementType;
  /** Element length */
  length: WorkoutLength;
  /** Steps within this element */
  steps: WorkoutStep[];
  /** Start time in seconds */
  begin: number;
  /** End time in seconds */
  end: number;
};

export class WorkoutStructure {
  private constructor(
    private readonly _structure: WorkoutStructureElement[],
    private readonly _polyline: number[][],
    private readonly _primaryLengthMetric: WorkoutLengthMetric,
    private readonly _primaryIntensityMetric: WorkoutIntensityMetric,
    private readonly _primaryIntensityTargetOrRange: WorkoutIntensityTargetType
  ) {
    this.validateStructure();
    this.validatePolyline();
    this.validateMetrics();
  }

  public static create(
    structure: WorkoutStructureElement[],
    polyline: number[][],
    primaryLengthMetric: WorkoutLengthMetric,
    primaryIntensityMetric: WorkoutIntensityMetric,
    primaryIntensityTargetOrRange: WorkoutIntensityTargetType
  ): WorkoutStructure {
    return new WorkoutStructure(
      structure,
      polyline,
      primaryLengthMetric,
      primaryIntensityMetric,
      primaryIntensityTargetOrRange
    );
  }

  /**
   * Create from API format
   */
  public static fromApiFormat(data: {
    structure: {
      type: WorkoutElementType;
      length: { value: number; unit: string };
      steps: {
        name: string;
        length: { value: number; unit: string };
        targets: { minValue: number; maxValue: number }[];
        intensityClass: string;
        openDuration: boolean;
      }[];
      begin: number;
      end: number;
    }[];
    polyline: number[][];
    primaryLengthMetric: WorkoutLengthMetric;
    primaryIntensityMetric: WorkoutIntensityMetric;
    primaryIntensityTargetOrRange: WorkoutIntensityTargetType;
  }): WorkoutStructure {
    const structure = data.structure.map((element) => ({
      type: element.type,
      length: WorkoutLength.fromApiFormat(
        element.length as { value: number; unit: WorkoutLengthUnit }
      ),
      steps: element.steps.map((step) =>
        WorkoutStep.fromApiFormat({
          ...step,
          intensityClass: step.intensityClass as WorkoutIntensityClass,
        })
      ),
      begin: element.begin,
      end: element.end,
    }));

    return WorkoutStructure.create(
      structure,
      data.polyline,
      data.primaryLengthMetric,
      data.primaryIntensityMetric,
      data.primaryIntensityTargetOrRange
    );
  }

  public get structure(): WorkoutStructureElement[] {
    return this._structure.map((element) => ({
      ...element,
      steps: [...element.steps], // Deep copy steps
    }));
  }

  public get polyline(): number[][] {
    return this._polyline.map((point) => [...point]); // Deep copy polyline
  }

  public get primaryLengthMetric(): WorkoutLengthMetric {
    return this._primaryLengthMetric;
  }

  public get primaryIntensityMetric(): WorkoutIntensityMetric {
    return this._primaryIntensityMetric;
  }

  public get primaryIntensityTargetOrRange(): WorkoutIntensityTargetType {
    return this._primaryIntensityTargetOrRange;
  }

  /**
   * Get total duration of the workout in seconds
   */
  public getTotalDuration(): number {
    if (this._structure.length === 0) {
      return 0;
    }

    return Math.max(...this._structure.map((element) => element.end));
  }

  /**
   * Get all steps in the workout
   */
  public getAllSteps(): WorkoutStep[] {
    return this._structure.flatMap((element) => element.steps);
  }

  /**
   * Get all active steps (excluding rest)
   */
  public getActiveSteps(): WorkoutStep[] {
    return this.getAllSteps().filter((step) => step.isActive());
  }

  /**
   * Get all rest steps
   */
  public getRestSteps(): WorkoutStep[] {
    return this.getAllSteps().filter((step) => step.isRest());
  }

  /**
   * Get elements by type
   */
  public getElementsByType(
    type: WorkoutElementType
  ): WorkoutStructureElement[] {
    return this._structure.filter((element) => element.type === type);
  }

  /**
   * Get repetition elements
   */
  public getRepetitions(): WorkoutStructureElement[] {
    return this.getElementsByType('repetition');
  }

  /**
   * Get step elements
   */
  public getStepElements(): WorkoutStructureElement[] {
    return this.getElementsByType('step');
  }

  /**
   * Check if workout is time-based
   */
  public isTimeBased(): boolean {
    return this._primaryLengthMetric === 'duration';
  }

  /**
   * Check if workout is distance-based
   */
  public isDistanceBased(): boolean {
    return this._primaryLengthMetric === 'distance';
  }

  /**
   * Convert to API format
   */
  public toApiFormat(): {
    structure: {
      type: WorkoutElementType;
      length: { value: number; unit: string };
      steps: {
        name: string;
        length: { value: number; unit: string };
        targets: { minValue: number; maxValue: number }[];
        intensityClass: string;
        openDuration: boolean;
      }[];
      begin: number;
      end: number;
    }[];
    polyline: number[][];
    primaryLengthMetric: WorkoutLengthMetric;
    primaryIntensityMetric: WorkoutIntensityMetric;
    primaryIntensityTargetOrRange: WorkoutIntensityTargetType;
  } {
    return {
      structure: this._structure.map((element) => ({
        type: element.type,
        length: element.length.toApiFormat(),
        steps: element.steps.map((step) => step.toApiFormat()),
        begin: element.begin,
        end: element.end,
      })),
      polyline: this._polyline,
      primaryLengthMetric: this._primaryLengthMetric,
      primaryIntensityMetric: this._primaryIntensityMetric,
      primaryIntensityTargetOrRange: this._primaryIntensityTargetOrRange,
    };
  }

  /**
   * Check equality with another WorkoutStructure
   */
  public equals(other: WorkoutStructure): boolean {
    return (
      this._primaryLengthMetric === other._primaryLengthMetric &&
      this._primaryIntensityMetric === other._primaryIntensityMetric &&
      this._primaryIntensityTargetOrRange ===
        other._primaryIntensityTargetOrRange &&
      this._structure.length === other._structure.length &&
      this._structure.every((element, index) => {
        const otherElement = other._structure[index];
        return (
          otherElement &&
          element.type === otherElement.type &&
          element.length.equals(otherElement.length) &&
          element.begin === otherElement.begin &&
          element.end === otherElement.end &&
          element.steps.length === otherElement.steps.length &&
          element.steps.every((step, stepIndex) => {
            const otherStep = otherElement.steps[stepIndex];
            return otherStep && step.equals(otherStep);
          })
        );
      }) &&
      this._polyline.length === other._polyline.length &&
      this._polyline.every((point, index) => {
        const otherPoint = other._polyline[index];
        return (
          otherPoint &&
          point.length === otherPoint.length &&
          point.every((value, valueIndex) => value === otherPoint[valueIndex])
        );
      })
    );
  }

  /**
   * String representation
   */
  public toString(): string {
    const duration = this.getTotalDuration();
    const stepCount = this.getAllSteps().length;
    const activeStepCount = this.getActiveSteps().length;
    const repetitionCount = this.getRepetitions().length;

    return `Workout Structure (${duration}s, ${stepCount} steps, ${activeStepCount} active, ${repetitionCount} repetitions)`;
  }

  /**
   * Create a new structure with additional element
   */
  public withElement(element: WorkoutStructureElement): WorkoutStructure {
    return new WorkoutStructure(
      [...this._structure, element],
      this._polyline,
      this._primaryLengthMetric,
      this._primaryIntensityMetric,
      this._primaryIntensityTargetOrRange
    );
  }

  /**
   * Create a new structure with updated polyline
   */
  public withPolyline(polyline: number[][]): WorkoutStructure {
    return new WorkoutStructure(
      this._structure,
      polyline,
      this._primaryLengthMetric,
      this._primaryIntensityMetric,
      this._primaryIntensityTargetOrRange
    );
  }

  private validateStructure(): void {
    if (!Array.isArray(this._structure)) {
      throw new Error('Workout structure must be an array');
    }

    if (this._structure.length === 0) {
      throw new Error('Workout structure cannot be empty');
    }

    // Validate that elements don't overlap
    for (let i = 0; i < this._structure.length - 1; i++) {
      const current = this._structure[i];
      const next = this._structure[i + 1];

      if (current && next && current.end > next.begin) {
        throw new Error(
          `Workout structure elements overlap: element ${i} ends at ${current.end} but element ${i + 1} begins at ${next.begin}`
        );
      }
    }

    // Validate each element
    this._structure.forEach((element, index) => {
      if (element.begin < 0) {
        throw new Error(
          `Workout structure element ${index} has negative begin time: ${element.begin}`
        );
      }

      if (element.end <= element.begin) {
        throw new Error(
          `Workout structure element ${index} has invalid time range: ${element.begin} to ${element.end}`
        );
      }

      if (element.steps.length === 0) {
        throw new Error(`Workout structure element ${index} has no steps`);
      }
    });
  }

  private validatePolyline(): void {
    if (!Array.isArray(this._polyline)) {
      throw new Error('Workout polyline must be an array');
    }

    this._polyline.forEach((point, index) => {
      if (!Array.isArray(point) || point.length !== 2) {
        throw new Error(
          `Workout polyline point ${index} must be an array of exactly 2 numbers`
        );
      }

      if (
        !point.every(
          (value) => typeof value === 'number' && Number.isFinite(value)
        )
      ) {
        throw new Error(
          `Workout polyline point ${index} contains invalid values`
        );
      }
    });
  }

  private validateMetrics(): void {
    const validLengthMetrics: WorkoutLengthMetric[] = ['duration', 'distance'];
    const validIntensityMetrics: WorkoutIntensityMetric[] = [
      'percentOfThresholdPace',
      'percentOfThresholdPower',
      'heartRate',
      'power',
      'pace',
      'speed',
    ];
    const validTargetTypes: WorkoutIntensityTargetType[] = ['target', 'range'];

    if (!validLengthMetrics.includes(this._primaryLengthMetric)) {
      throw new Error(
        `Invalid primary length metric: ${this._primaryLengthMetric}`
      );
    }

    if (!validIntensityMetrics.includes(this._primaryIntensityMetric)) {
      throw new Error(
        `Invalid primary intensity metric: ${this._primaryIntensityMetric}`
      );
    }

    if (!validTargetTypes.includes(this._primaryIntensityTargetOrRange)) {
      throw new Error(
        `Invalid primary intensity target type: ${this._primaryIntensityTargetOrRange}`
      );
    }
  }
}
