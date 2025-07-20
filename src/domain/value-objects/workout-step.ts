/**
 * Workout Step Value Object
 * Represents an individual step in a workout structure
 */

import { ValidationError } from '@/domain/errors';
import {
  WorkoutLength,
  WorkoutLengthUnit,
} from '@/domain/value-objects/workout-length';
import { WorkoutTarget } from '@/domain/value-objects/workout-target';

export type WorkoutIntensityClass = 'active' | 'rest' | 'warmUp' | 'coolDown';

export class WorkoutStep {
  private constructor(
    private readonly _name: string,
    private readonly _length: WorkoutLength,
    private readonly _targets: WorkoutTarget[],
    private readonly _intensityClass: WorkoutIntensityClass,
    private readonly _openDuration: boolean = false
  ) {
    this.validateName();
    this.validateTargets();
    this.validateIntensityClass();
  }

  public static create(
    name: string,
    length: WorkoutLength,
    targets: WorkoutTarget[],
    intensityClass: WorkoutIntensityClass,
    openDuration: boolean = false
  ): WorkoutStep {
    return new WorkoutStep(name, length, targets, intensityClass, openDuration);
  }

  /**
   * Create from API format
   */
  public static fromApiFormat(data: {
    name: string;
    length: { value: number; unit: string };
    targets: { minValue: number; maxValue: number }[];
    intensityClass: WorkoutIntensityClass;
    openDuration: boolean;
  }): WorkoutStep {
    const length = WorkoutLength.fromApiFormat(
      data.length as { value: number; unit: WorkoutLengthUnit }
    );
    const targets = data.targets.map((target) =>
      WorkoutTarget.fromApiFormat(target)
    );

    return WorkoutStep.create(
      data.name,
      length,
      targets,
      data.intensityClass,
      data.openDuration
    );
  }

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

  /**
   * Check if this is a rest step
   */
  public isRest(): boolean {
    return this._intensityClass === 'rest';
  }

  /**
   * Check if this is an active step
   */
  public isActive(): boolean {
    return this._intensityClass === 'active';
  }

  /**
   * Check if this is a warm-up step
   */
  public isWarmUp(): boolean {
    return this._intensityClass === 'warmUp';
  }

  /**
   * Check if this is a cool-down step
   */
  public isCoolDown(): boolean {
    return this._intensityClass === 'coolDown';
  }

  /**
   * Get the primary target (first target if multiple)
   */
  public getPrimaryTarget(): WorkoutTarget | null {
    return this._targets.length > 0 ? this._targets[0] || null : null;
  }

  /**
   * Get the duration in seconds (if applicable)
   */
  public getDurationInSeconds(): number | null {
    return this._length.toSeconds();
  }

  /**
   * Get the distance in meters (if applicable)
   */
  public getDistanceInMeters(): number | null {
    return this._length.toMeters();
  }

  /**
   * Convert to API format
   */
  public toApiFormat(): {
    name: string;
    length: { value: number; unit: string };
    targets: { minValue: number; maxValue: number }[];
    intensityClass: WorkoutIntensityClass;
    openDuration: boolean;
  } {
    return {
      name: this._name,
      length: this._length.toApiFormat(),
      targets: this._targets.map((target) => target.toApiFormat()),
      intensityClass: this._intensityClass,
      openDuration: this._openDuration,
    };
  }

  /**
   * Check equality with another WorkoutStep
   */
  public equals(other: WorkoutStep): boolean {
    return (
      this._name === other._name &&
      this._length.equals(other._length) &&
      this._intensityClass === other._intensityClass &&
      this._openDuration === other._openDuration &&
      this._targets.length === other._targets.length &&
      this._targets.every((target, index) => {
        const otherTarget = other._targets[index];
        return otherTarget && target.equals(otherTarget);
      })
    );
  }

  /**
   * String representation
   */
  public toString(): string {
    const duration = this.getDurationInSeconds();
    const distance = this.getDistanceInMeters();

    let description = `${this._name} (${this._intensityClass})`;

    if (duration !== null) {
      description += ` - ${duration}s`;
    } else if (distance !== null) {
      description += ` - ${distance}m`;
    } else {
      description += ` - ${this._length.toString()}`;
    }

    if (this._targets.length > 0) {
      description += ` @ ${this._targets.map((t) => t.toString()).join(', ')}`;
    }

    return description;
  }

  /**
   * Create a new step with updated name
   */
  public withName(name: string): WorkoutStep {
    return new WorkoutStep(
      name,
      this._length,
      this._targets,
      this._intensityClass,
      this._openDuration
    );
  }

  /**
   * Create a new step with updated length
   */
  public withLength(length: WorkoutLength): WorkoutStep {
    return new WorkoutStep(
      this._name,
      length,
      this._targets,
      this._intensityClass,
      this._openDuration
    );
  }

  /**
   * Create a new step with updated targets
   */
  public withTargets(targets: WorkoutTarget[]): WorkoutStep {
    return new WorkoutStep(
      this._name,
      this._length,
      targets,
      this._intensityClass,
      this._openDuration
    );
  }

  /**
   * Create a new step with updated intensity class
   */
  public withIntensityClass(
    intensityClass: WorkoutIntensityClass
  ): WorkoutStep {
    return new WorkoutStep(
      this._name,
      this._length,
      this._targets,
      intensityClass,
      this._openDuration
    );
  }

  private validateName(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new ValidationError('Workout step name cannot be empty');
    }

    if (this._name.length > 100) {
      throw new ValidationError(
        'Workout step name cannot exceed 100 characters'
      );
    }
  }

  private validateTargets(): void {
    if (!Array.isArray(this._targets)) {
      throw new ValidationError('Workout step targets must be an array');
    }

    // Allow empty targets for rest steps
    if (this._targets.length === 0 && this._intensityClass !== 'rest') {
      throw new ValidationError(
        `Workout step '${this._name}' has no targets but is not a rest step`
      );
    }
  }

  private validateIntensityClass(): void {
    const validClasses: WorkoutIntensityClass[] = [
      'active',
      'rest',
      'warmUp',
      'coolDown',
    ];

    if (!validClasses.includes(this._intensityClass)) {
      throw new ValidationError(
        `Invalid workout step intensity class: ${this._intensityClass}`
      );
    }
  }
}
