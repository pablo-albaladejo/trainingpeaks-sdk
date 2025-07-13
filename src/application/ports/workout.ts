/**
 * Workout Application Ports
 * Defines interfaces for external services
 */

import { Workout } from '../../domain/entities/workout';
import { WorkoutFile } from '../../domain/value-objects/workout-file';

export interface WorkoutServiceConfig {
  baseUrl: string;
  timeout: number;
  debug: boolean;
  headers: Record<string, string>;
}

export interface WorkoutServicePort {
  /**
   * Check if this service can handle workout operations
   */
  canHandle(config: WorkoutServiceConfig): boolean;

  /**
   * Upload workout to external service
   */
  uploadWorkout(
    workout: Workout,
    config: Required<WorkoutServiceConfig>
  ): Promise<{
    success: boolean;
    workoutId?: string;
    message: string;
    errors?: string[];
  }>;

  /**
   * Upload workout file to external service
   */
  uploadWorkoutFile(
    workoutFile: WorkoutFile,
    metadata: {
      name?: string;
      description?: string;
      activityType?: string;
      tags?: string[];
    },
    config: Required<WorkoutServiceConfig>
  ): Promise<{
    success: boolean;
    workoutId?: string;
    message: string;
    errors?: string[];
  }>;

  /**
   * Get workout from external service
   */
  getWorkout(
    workoutId: string,
    config: Required<WorkoutServiceConfig>
  ): Promise<Workout | null>;

  /**
   * List workouts from external service
   */
  listWorkouts(
    filters: {
      startDate?: Date;
      endDate?: Date;
      activityType?: string;
      tags?: string[];
      limit?: number;
      offset?: number;
    },
    config: Required<WorkoutServiceConfig>
  ): Promise<Workout[]>;

  /**
   * Delete workout from external service
   */
  deleteWorkout(
    workoutId: string,
    config: Required<WorkoutServiceConfig>
  ): Promise<boolean>;
}

export interface FileSystemPort {
  /**
   * Read file content from file system
   */
  readFile(filePath: string): Promise<string>;

  /**
   * Check if file exists
   */
  fileExists(filePath: string): Promise<boolean>;

  /**
   * Write file to file system
   */
  writeFile(filePath: string, content: string): Promise<void>;
}
