/**
 * Workout Domain Entity
 * Represents a workout in the domain
 */

import { WorkoutStructure } from '@/domain/value-objects/workout-structure';

export class Workout {
  private constructor(
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
  ) {
    this.validateId();
    this.validateName();
    this.validateDate();
    this.validateDuration();
    this.validateDistance();
    this.validateStructure();
  }

  public static create(
    id: string,
    name: string,
    description: string,
    date: Date,
    duration: number,
    distance?: number,
    activityType?: string,
    tags?: string[],
    fileContent?: string,
    fileName?: string,
    createdAt?: Date,
    updatedAt?: Date,
    structure?: WorkoutStructure
  ): Workout {
    return new Workout(
      id,
      name,
      description,
      date,
      duration,
      distance,
      activityType,
      tags,
      fileContent,
      fileName,
      createdAt || new Date(),
      updatedAt || new Date(),
      structure
    );
  }

  public static fromFile(
    id: string,
    fileName: string,
    fileContent: string,
    metadata?: {
      name?: string;
      description?: string;
      date?: Date;
      duration?: number;
      distance?: number;
      activityType?: string;
      tags?: string[];
    }
  ): Workout {
    return new Workout(
      id,
      metadata?.name || fileName.replace(/\.[^/.]+$/, ''), // Remove extension
      metadata?.description || '',
      metadata?.date || new Date(),
      metadata?.duration || 0,
      metadata?.distance,
      metadata?.activityType,
      metadata?.tags,
      fileContent,
      fileName,
      new Date(),
      new Date()
    );
  }

  /**
   * Create a structured workout
   */
  public static createStructured(
    id: string,
    name: string,
    description: string,
    date: Date,
    structure: WorkoutStructure,
    activityType?: string,
    tags?: string[],
    createdAt?: Date,
    updatedAt?: Date
  ): Workout {
    // Calculate duration from structure
    const duration = structure.getTotalDuration();

    return new Workout(
      id,
      name,
      description,
      date,
      duration,
      undefined, // Distance calculated from structure if needed
      activityType,
      tags,
      undefined, // No file content for structured workouts
      undefined, // No file name for structured workouts
      createdAt || new Date(),
      updatedAt || new Date(),
      structure
    );
  }

  // Getters
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

  // Business logic methods
  public hasFile(): boolean {
    return !!(this._fileContent && this._fileName);
  }

  public hasStructure(): boolean {
    return !!this._structure;
  }

  public isStructured(): boolean {
    return this.hasStructure();
  }

  public isFileBasedWorkout(): boolean {
    return this.hasFile() && !this.hasStructure();
  }

  public isRecent(): boolean {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this._date >= oneDayAgo;
  }

  public getFormattedDuration(): string {
    const hours = Math.floor(this._duration / 3600);
    const minutes = Math.floor((this._duration % 3600) / 60);
    const seconds = this._duration % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  public getFormattedDistance(): string | undefined {
    if (!this._distance) return undefined;

    if (this._distance >= 1000) {
      return `${(this._distance / 1000).toFixed(2)} km`;
    }
    return `${this._distance} m`;
  }

  /**
   * Get the workout type (structured or file-based)
   */
  public getWorkoutType(): 'structured' | 'file-based' | 'simple' {
    if (this.hasStructure()) {
      return 'structured';
    }
    if (this.hasFile()) {
      return 'file-based';
    }
    return 'simple';
  }

  /**
   * Get structure steps count
   */
  public getStructureStepsCount(): number {
    return this._structure ? this._structure.getAllSteps().length : 0;
  }

  /**
   * Get structure active steps count
   */
  public getStructureActiveStepsCount(): number {
    return this._structure ? this._structure.getActiveSteps().length : 0;
  }

  /**
   * Get structure repetitions count
   */
  public getStructureRepetitionsCount(): number {
    return this._structure ? this._structure.getRepetitions().length : 0;
  }

  /**
   * Check if workout is time-based (from structure)
   */
  public isTimeBased(): boolean {
    return this._structure ? this._structure.isTimeBased() : true; // Default to time-based
  }

  /**
   * Check if workout is distance-based (from structure)
   */
  public isDistanceBased(): boolean {
    return this._structure ? this._structure.isDistanceBased() : false;
  }

  public equals(other: Workout): boolean {
    return this._id === other._id;
  }

  public withUpdatedMetadata(updates: {
    name?: string;
    description?: string;
    activityType?: string;
    tags?: string[];
  }): Workout {
    return new Workout(
      this._id,
      updates.name || this._name,
      updates.description || this._description,
      this._date,
      this._duration,
      this._distance,
      updates.activityType || this._activityType,
      updates.tags || this._tags,
      this._fileContent,
      this._fileName,
      this._createdAt,
      new Date(), // Update timestamp
      this._structure
    );
  }

  /**
   * Create a new workout with updated structure
   */
  public withStructure(structure: WorkoutStructure): Workout {
    // Update duration based on new structure
    const newDuration = structure.getTotalDuration();

    return new Workout(
      this._id,
      this._name,
      this._description,
      this._date,
      newDuration,
      this._distance,
      this._activityType,
      this._tags,
      this._fileContent,
      this._fileName,
      this._createdAt,
      new Date(), // Update timestamp
      structure
    );
  }

  /**
   * Create a new workout without structure (convert to simple workout)
   */
  public withoutStructure(): Workout {
    return new Workout(
      this._id,
      this._name,
      this._description,
      this._date,
      this._duration,
      this._distance,
      this._activityType,
      this._tags,
      this._fileContent,
      this._fileName,
      this._createdAt,
      new Date(), // Update timestamp
      undefined // Remove structure
    );
  }

  // Validation methods
  private validateId(): void {
    if (!this._id || this._id.trim().length === 0) {
      throw new Error('Workout ID cannot be empty');
    }
  }

  private validateName(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('Workout name cannot be empty');
    }
    if (this._name.length > 255) {
      throw new Error('Workout name cannot exceed 255 characters');
    }
  }

  private validateDate(): void {
    if (!this._date || isNaN(this._date.getTime())) {
      throw new Error('Workout date must be a valid date');
    }
  }

  private validateDuration(): void {
    if (this._duration < 0) {
      throw new Error('Workout duration cannot be negative');
    }
    if (this._duration > 86400) {
      // More than 24 hours
      throw new Error('Workout duration cannot exceed 24 hours');
    }
  }

  private validateDistance(): void {
    if (this._distance !== undefined && this._distance < 0) {
      throw new Error('Workout distance cannot be negative');
    }
    if (this._distance !== undefined && this._distance > 1000000) {
      // More than 1000km
      throw new Error('Workout distance cannot exceed 1000km');
    }
  }

  private validateStructure(): void {
    if (this._structure) {
      // If structure is provided, validate consistency
      const structureDuration = this._structure.getTotalDuration();

      // Allow some tolerance for floating point differences
      const tolerance = 1; // 1 second tolerance
      if (Math.abs(this._duration - structureDuration) > tolerance) {
        console.warn(
          `Workout duration (${this._duration}s) doesn't match structure duration (${structureDuration}s)`
        );
      }
    }
  }
}
