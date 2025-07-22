/**
 * Workout Target Value Object
 * Represents an intensity target with minimum and maximum values - pure data container
 */

export class WorkoutTarget {
  constructor(
    private readonly _minValue: number,
    private readonly _maxValue: number
  ) {}

  // Getters only - no business logic
  public get minValue(): number {
    return this._minValue;
  }

  public get maxValue(): number {
    return this._maxValue;
  }
}
