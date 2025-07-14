/**
 * Workout Repository Interface
 * Defines the contract for workout repository implementations
 */

import { Workout } from '@/domain/entities/workout';
import { WorkoutFile } from '@/domain/value-objects/workout-file';
import {
  CreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse,
} from '@/types';

export interface UploadResult {
  success: boolean;
  workoutId?: string;
  message: string;
  errors?: string[];
}

export interface WorkoutRepository {
  /**
   * Upload a workout to the repository
   */
  uploadWorkout(workout: Workout): Promise<UploadResult>;

  /**
   * Upload a workout from file
   */
  uploadWorkoutFromFile(
    workoutFile: WorkoutFile,
    metadata?: {
      name?: string;
      description?: string;
      activityType?: string;
      tags?: string[];
    }
  ): Promise<UploadResult>;

  /**
   * Create a structured workout
   */
  createStructuredWorkout(
    request: CreateStructuredWorkoutRequest
  ): Promise<CreateStructuredWorkoutResponse>;

  /**
   * Get a workout by ID
   */
  getWorkout(workoutId: string): Promise<Workout | null>;

  /**
   * List user's workouts
   */
  listWorkouts(filters?: {
    startDate?: Date;
    endDate?: Date;
    activityType?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<Workout[]>;

  /**
   * Update workout metadata
   */
  updateWorkout(
    workoutId: string,
    updates: {
      name?: string;
      description?: string;
      activityType?: string;
      tags?: string[];
    }
  ): Promise<Workout>;

  /**
   * Delete a workout
   */
  deleteWorkout(workoutId: string): Promise<boolean>;

  /**
   * Search workouts by criteria
   */
  searchWorkouts(query: {
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
  }): Promise<Workout[]>;

  /**
   * Get workout statistics
   */
  getWorkoutStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    activityType?: string;
  }): Promise<{
    totalWorkouts: number;
    totalDuration: number;
    totalDistance: number;
    averageDuration: number;
    averageDistance: number;
  }>;
}

export interface FileSystemPort {
  /**
   * Read file content
   */
  readFile(filePath: string): Promise<string>;

  /**
   * Check if file exists
   */
  fileExists(filePath: string): Promise<boolean>;

  /**
   * Write file content
   */
  writeFile(filePath: string, content: string): Promise<void>;
}

export interface WorkoutServiceConfig {
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
  headers?: Record<string, string>;
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
   * Create structured workout in external service
   */
  createStructuredWorkout(
    request: CreateStructuredWorkoutRequest,
    config: Required<WorkoutServiceConfig>
  ): Promise<CreateStructuredWorkoutResponse>;

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
