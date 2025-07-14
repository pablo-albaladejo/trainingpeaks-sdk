/**
 * Workout Target Value Object
 * Represents an intensity target with minimum and maximum values
 */

export class WorkoutTarget {
  private constructor(
    private readonly _minValue: number,
    private readonly _maxValue: number
  ) {
    this.validateValues();
  }

  public static create(minValue: number, maxValue: number): WorkoutTarget {
    return new WorkoutTarget(minValue, maxValue);
  }

  /**
   * Create a single target (min = max)
   */
  public static createSingle(value: number): WorkoutTarget {
    return new WorkoutTarget(value, value);
  }

  /**
   * Create from API format
   */
  public static fromApiFormat(data: {
    minValue: number;
    maxValue: number;
  }): WorkoutTarget {
    return WorkoutTarget.create(data.minValue, data.maxValue);
  }

  public get minValue(): number {
    return this._minValue;
  }

  public get maxValue(): number {
    return this._maxValue;
  }

  /**
   * Check if this is a single target (min = max)
   */
  public isSingleTarget(): boolean {
    return this._minValue === this._maxValue;
  }

  /**
   * Check if this is a range target (min < max)
   */
  public isRangeTarget(): boolean {
    return this._minValue < this._maxValue;
  }

  /**
   * Get the target range width
   */
  public getRangeWidth(): number {
    return this._maxValue - this._minValue;
  }

  /**
   * Get the target midpoint
   */
  public getMidpoint(): number {
    return (this._minValue + this._maxValue) / 2;
  }

  /**
   * Check if a value is within this target range
   */
  public isValueInRange(value: number): boolean {
    return value >= this._minValue && value <= this._maxValue;
  }

  /**
   * Convert to API format
   */
  public toApiFormat(): { minValue: number; maxValue: number } {
    return {
      minValue: this._minValue,
      maxValue: this._maxValue,
    };
  }

  /**
   * Check equality with another WorkoutTarget
   */
  public equals(other: WorkoutTarget): boolean {
    return (
      this._minValue === other._minValue && this._maxValue === other._maxValue
    );
  }

  /**
   * String representation
   */
  public toString(): string {
    if (this.isSingleTarget()) {
      return `${this._minValue}`;
    }
    return `${this._minValue}-${this._maxValue}`;
  }

  /**
   * Create a new target with adjusted values
   */
  public adjust(minAdjustment: number, maxAdjustment: number): WorkoutTarget {
    return WorkoutTarget.create(
      this._minValue + minAdjustment,
      this._maxValue + maxAdjustment
    );
  }

  /**
   * Create a new target with scaled values
   */
  public scale(factor: number): WorkoutTarget {
    return WorkoutTarget.create(
      this._minValue * factor,
      this._maxValue * factor
    );
  }

  private validateValues(): void {
    if (!Number.isFinite(this._minValue)) {
      throw new Error('Workout target minValue must be a finite number');
    }

    if (!Number.isFinite(this._maxValue)) {
      throw new Error('Workout target maxValue must be a finite number');
    }

    if (this._minValue < 0) {
      throw new Error('Workout target minValue must be non-negative');
    }

    if (this._maxValue < 0) {
      throw new Error('Workout target maxValue must be non-negative');
    }

    if (this._minValue > this._maxValue) {
      throw new Error(
        'Workout target minValue cannot be greater than maxValue'
      );
    }
  }
}
