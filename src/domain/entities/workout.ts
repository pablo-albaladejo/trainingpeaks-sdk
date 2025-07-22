/**
 * Workout Domain Entity
 * Represents a workout in the domain - pure data container
 */

import type { WorkoutStructure } from '@/domain/value-objects/workout-structure-simple';

export class Workout {
  constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _description: string,
    private readonly _date: Date,
    private readonly _duration: number,
    private readonly _distance?: number,
    private readonly _activityType?: string,
    private readonly _tags?: string[],
    private readonly _fileContent?: string,
    private readonly _fileName?: string,
    private readonly _createdAt?: Date,
    private readonly _updatedAt?: Date,
    private readonly _structure?: WorkoutStructure
  ) {}

  // Getters only - no business logic
  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string {
    return this._description;
  }

  public get date(): Date {
    return this._date;
  }

  public get duration(): number {
    return this._duration;
  }

  public get distance(): number | undefined {
    return this._distance;
  }

  public get activityType(): string | undefined {
    return this._activityType;
  }

  public get tags(): string[] | undefined {
    return this._tags;
  }

  public get fileContent(): string | undefined {
    return this._fileContent;
  }

  public get fileName(): string | undefined {
    return this._fileName;
  }

  public get createdAt(): Date | undefined {
    return this._createdAt;
  }

  public get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  public get structure(): WorkoutStructure | undefined {
    return this._structure;
  }
}
