/**
 * Workout Structure Value Object
 * Represents a workout structure - pure data container
 */

import type {
  WorkoutIntensityMetric,
  WorkoutIntensityTargetType,
  WorkoutLengthMetric,
} from '@/domain/schemas/workout-structure.schema';
import type { WorkoutStructureElement } from '@/domain/value-objects/workout-structure-element';

export class WorkoutStructure {
  constructor(
    private readonly _structure: WorkoutStructureElement[],
    private readonly _polyline: number[][],
    private readonly _primaryLengthMetric: WorkoutLengthMetric,
    private readonly _primaryIntensityMetric: WorkoutIntensityMetric,
    private readonly _primaryIntensityTargetOrRange: WorkoutIntensityTargetType
  ) {}

  // Getters only - no business logic
  public get structure(): WorkoutStructureElement[] {
    return this._structure;
  }

  public get polyline(): number[][] {
    return [...this._polyline];
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
}
