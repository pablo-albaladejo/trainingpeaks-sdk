/**
 * Workout Length Value Object
 * Represents the duration or length of a workout step - pure data container
 */

export type WorkoutLengthUnit =
  | 'second'
  | 'minute'
  | 'hour'
  | 'repetition'
  | 'meter'
  | 'kilometer'
  | 'mile';

export class WorkoutLength {
  constructor(
    private readonly _value: number,
    private readonly _unit: WorkoutLengthUnit
  ) {}

  // Getters only - no business logic
  public get value(): number {
    return this._value;
  }

  public get unit(): WorkoutLengthUnit {
    return this._unit;
  }
}
