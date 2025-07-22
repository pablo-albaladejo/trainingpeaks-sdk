/**
 * Workout Structure Element Value Object
 * Represents an element in a workout structure - pure data container
 */

import type { WorkoutLength } from './workout-length';
import type { WorkoutStep } from './workout-step';

export class WorkoutStructureElement {
  constructor(
    private readonly _type: 'step' | 'repetition',
    private readonly _length: WorkoutLength,
    private readonly _steps: WorkoutStep[],
    private readonly _begin: number,
    private readonly _end: number
  ) {}

  // Getters only - no business logic
  public get type(): 'step' | 'repetition' {
    return this._type;
  }

  public get length(): WorkoutLength {
    return this._length;
  }

  public get steps(): WorkoutStep[] {
    return this._steps;
  }

  public get begin(): number {
    return this._begin;
  }

  public get end(): number {
    return this._end;
  }
}
