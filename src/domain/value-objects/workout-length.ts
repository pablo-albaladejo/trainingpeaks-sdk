/**
 * Workout Length Value Object
 * Represents the duration or length of a workout step
 */

import { ValidationError } from '@/domain/errors';

export type WorkoutLengthUnit =
  | 'second'
  | 'minute'
  | 'hour'
  | 'repetition'
  | 'meter'
  | 'kilometer'
  | 'mile';

export class WorkoutLength {
  private constructor(
    private readonly _value: number,
    private readonly _unit: WorkoutLengthUnit
  ) {
    this.validateValue();
    this.validateUnit();
  }

  public static create(value: number, unit: WorkoutLengthUnit): WorkoutLength {
    return new WorkoutLength(value, unit);
  }

  public get value(): number {
    return this._value;
  }

  public get unit(): WorkoutLengthUnit {
    return this._unit;
  }

  /**
   * Convert to seconds for time-based units
   */
  public toSeconds(): number | null {
    switch (this._unit) {
      case 'second':
        return this._value;
      case 'minute':
        return this._value * 60;
      case 'hour':
        return this._value * 3600;
      default:
        return null; // Cannot convert non-time units
    }
  }

  /**
   * Convert to meters for distance-based units
   */
  public toMeters(): number | null {
    switch (this._unit) {
      case 'meter':
        return this._value;
      case 'kilometer':
        return this._value * 1000;
      case 'mile':
        return this._value * 1609.344;
      default:
        return null; // Cannot convert non-distance units
    }
  }

  /**
   * Check if this is a time-based unit
   */
  public isTimeUnit(): boolean {
    return ['second', 'minute', 'hour'].includes(this._unit);
  }

  /**
   * Check if this is a distance-based unit
   */
  public isDistanceUnit(): boolean {
    return ['meter', 'kilometer', 'mile'].includes(this._unit);
  }

  /**
   * Check if this is a repetition unit
   */
  public isRepetitionUnit(): boolean {
    return this._unit === 'repetition';
  }

  /**
   * Convert to API format
   */
  public toApiFormat(): { value: number; unit: WorkoutLengthUnit } {
    return {
      value: this._value,
      unit: this._unit,
    };
  }

  /**
   * Create from API format
   */
  public static fromApiFormat(data: {
    value: number;
    unit: WorkoutLengthUnit;
  }): WorkoutLength {
    return WorkoutLength.create(data.value, data.unit);
  }

  /**
   * Check equality with another WorkoutLength
   */
  public equals(other: WorkoutLength): boolean {
    return this._value === other._value && this._unit === other._unit;
  }

  /**
   * String representation
   */
  public toString(): string {
    return `${this._value} ${this._unit}${this._value !== 1 ? 's' : ''}`;
  }

  private validateValue(): void {
    if (this._value < 0) {
      throw new ValidationError('Workout length value must be non-negative');
    }

    if (!Number.isFinite(this._value)) {
      throw new ValidationError('Workout length value must be a finite number');
    }

    if (this._unit === 'repetition' && !Number.isInteger(this._value)) {
      throw new ValidationError('Repetition count must be an integer');
    }
  }

  private validateUnit(): void {
    const validUnits: WorkoutLengthUnit[] = [
      'second',
      'minute',
      'hour',
      'repetition',
      'meter',
      'kilometer',
      'mile',
    ];

    if (!validUnits.includes(this._unit)) {
      throw new ValidationError(`Invalid workout length unit: ${this._unit}`);
    }
  }
}
