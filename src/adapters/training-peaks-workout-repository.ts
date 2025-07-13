/**
 * TrainingPeaks Workout Repository Implementation
 * Connects domain workout operations to infrastructure adapters
 */

import {
  FileSystemPort,
  WorkoutServiceConfig,
  WorkoutServicePort,
} from '../application/ports/workout';
import { Workout } from '../domain/entities/workout';
import {
  UploadResult,
  WorkoutRepository,
} from '../domain/repositories/workout';
import { WorkoutFile } from '../domain/value-objects/workout-file';

export class TrainingPeaksWorkoutRepository implements WorkoutRepository {
  private readonly workoutServices: WorkoutServicePort[] = [];

  constructor(
    private readonly fileSystemAdapter: FileSystemPort,
    private readonly config: WorkoutServiceConfig
  ) {}

  /**
   * Register a workout service adapter
   */
  public registerWorkoutService(workoutService: WorkoutServicePort): void {
    this.workoutServices.push(workoutService);
  }

  /**
   * Get the appropriate workout service for the current configuration
   */
  private getWorkoutService(): WorkoutServicePort {
    const service = this.workoutServices.find(s => s.canHandle(this.config));

    if (!service) {
      throw new Error(
        'No suitable workout service found for the current configuration'
      );
    }

    return service;
  }

  private getFullConfig(): Required<WorkoutServiceConfig> {
    return {
      baseUrl: this.config.baseUrl,
      timeout: this.config.timeout,
      debug: this.config.debug,
      headers: this.config.headers,
    };
  }

  public async uploadWorkout(workout: Workout): Promise<UploadResult> {
    try {
      const workoutService = this.getWorkoutService();
      const fullConfig = this.getFullConfig();

      return await workoutService.uploadWorkout(workout, fullConfig);
    } catch (error) {
      return {
        success: false,
        message: 'Failed to upload workout',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  public async uploadWorkoutFromFile(
    workoutFile: WorkoutFile,
    metadata?: {
      name?: string;
      description?: string;
      activityType?: string;
      tags?: string[];
    }
  ): Promise<UploadResult> {
    try {
      const workoutService = this.getWorkoutService();
      const fullConfig = this.getFullConfig();

      return await workoutService.uploadWorkoutFile(
        workoutFile,
        metadata || {},
        fullConfig
      );
    } catch (error) {
      return {
        success: false,
        message: 'Failed to upload workout from file',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  public async getWorkout(workoutId: string): Promise<Workout | null> {
    try {
      const workoutService = this.getWorkoutService();
      const fullConfig = this.getFullConfig();

      return await workoutService.getWorkout(workoutId, fullConfig);
    } catch (error) {
      if (this.config.debug) {
        console.error('Failed to get workout:', error);
      }
      return null;
    }
  }

  public async listWorkouts(filters?: {
    startDate?: Date;
    endDate?: Date;
    activityType?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<Workout[]> {
    try {
      const workoutService = this.getWorkoutService();
      const fullConfig = this.getFullConfig();

      return await workoutService.listWorkouts(filters || {}, fullConfig);
    } catch (error) {
      if (this.config.debug) {
        console.error('Failed to list workouts:', error);
      }
      return [];
    }
  }

  public async updateWorkout(
    workoutId: string,
    updates: {
      name?: string;
      description?: string;
      activityType?: string;
      tags?: string[];
    }
  ): Promise<Workout> {
    // First get the existing workout
    const existingWorkout = await this.getWorkout(workoutId);
    if (!existingWorkout) {
      throw new Error(`Workout not found: ${workoutId}`);
    }

    // Update the workout using domain method
    const updatedWorkout = existingWorkout.withUpdatedMetadata(updates);

    // Upload the updated workout
    const uploadResult = await this.uploadWorkout(updatedWorkout);
    if (!uploadResult.success) {
      throw new Error(`Failed to update workout: ${uploadResult.message}`);
    }

    return updatedWorkout;
  }

  public async deleteWorkout(workoutId: string): Promise<boolean> {
    try {
      const workoutService = this.getWorkoutService();
      const fullConfig = this.getFullConfig();

      return await workoutService.deleteWorkout(workoutId, fullConfig);
    } catch (error) {
      if (this.config.debug) {
        console.error('Failed to delete workout:', error);
      }
      return false;
    }
  }

  public async searchWorkouts(query: {
    text?: string;
    activityType?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
    durationRange?: {
      min: number;
      max: number;
    };
    distanceRange?: {
      min: number;
      max: number;
    };
  }): Promise<Workout[]> {
    // For now, implement search as filtered list
    // In a real implementation, this might be a separate API endpoint
    const filters: {
      startDate?: Date;
      endDate?: Date;
      activityType?: string;
    } = {};

    if (query.dateRange) {
      filters.startDate = query.dateRange.start;
      filters.endDate = query.dateRange.end;
    }

    if (query.activityType) {
      filters.activityType = query.activityType;
    }

    const workouts = await this.listWorkouts(filters);

    // Apply additional filtering
    return workouts.filter(workout => {
      // Text search
      if (query.text) {
        const searchText = query.text.toLowerCase();
        const matchesText =
          workout.name.toLowerCase().includes(searchText) ||
          workout.description.toLowerCase().includes(searchText) ||
          workout.tags?.some(tag => tag.toLowerCase().includes(searchText));

        if (!matchesText) return false;
      }

      // Duration range
      if (query.durationRange) {
        if (
          workout.duration < query.durationRange.min ||
          workout.duration > query.durationRange.max
        ) {
          return false;
        }
      }

      // Distance range
      if (query.distanceRange && workout.distance) {
        if (
          workout.distance < query.distanceRange.min ||
          workout.distance > query.distanceRange.max
        ) {
          return false;
        }
      }

      return true;
    });
  }

  public async getWorkoutStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    activityType?: string;
  }): Promise<{
    totalWorkouts: number;
    totalDuration: number;
    totalDistance: number;
    averageDuration: number;
    averageDistance: number;
  }> {
    const workouts = await this.listWorkouts(filters);

    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
    const totalDistance = workouts.reduce(
      (sum, w) => sum + (w.distance || 0),
      0
    );

    return {
      totalWorkouts,
      totalDuration,
      totalDistance,
      averageDuration: totalWorkouts > 0 ? totalDuration / totalWorkouts : 0,
      averageDistance: totalWorkouts > 0 ? totalDistance / totalWorkouts : 0,
    };
  }

  /**
   * Read workout file from file system
   */
  public async readWorkoutFile(filePath: string): Promise<WorkoutFile> {
    const exists = await this.fileSystemAdapter.fileExists(filePath);
    if (!exists) {
      throw new Error(`Workout file not found: ${filePath}`);
    }

    const content = await this.fileSystemAdapter.readFile(filePath);
    const fileName = filePath.split('/').pop() || 'workout.tcx';

    // Determine MIME type from extension
    const extension = fileName.toLowerCase().split('.').pop();
    let mimeType = 'application/octet-stream';

    switch (extension) {
      case 'tcx':
        mimeType = 'application/tcx+xml';
        break;
      case 'gpx':
        mimeType = 'application/gpx+xml';
        break;
      case 'fit':
        mimeType = 'application/fit';
        break;
      case 'xml':
        mimeType = 'application/xml';
        break;
    }

    return WorkoutFile.create(fileName, content, mimeType);
  }
}
