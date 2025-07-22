/**
 * Workout Step Value Object
 * Represents an individual step in a workout structure - pure data container
 */

import type { WorkoutLength } from '@/domain/value-objects/workout-length';
import type { WorkoutTarget } from '@/domain/value-objects/workout-target';

export type WorkoutIntensityClass = 'active' | 'rest' | 'warmUp' | 'coolDown';

export class WorkoutStep {
  constructor(
    private readonly _name: string,
    private readonly _length: WorkoutLength,
    private readonly _targets: WorkoutTarget[],
    private readonly _intensityClass: WorkoutIntensityClass,
    private readonly _openDuration: boolean = false
  ) {}

  // Getters only - no business logic
  public get name(): string {
    return this._name;
  }

  public get length(): WorkoutLength {
    return this._length;
  }

  public get targets(): WorkoutTarget[] {
    return [...this._targets]; // Return a copy to prevent mutations
  }

  public get intensityClass(): WorkoutIntensityClass {
    return this._intensityClass;
  }

  public get openDuration(): boolean {
    return this._openDuration;
  }
}
