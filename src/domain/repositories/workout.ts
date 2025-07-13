/**
 * Workout Repository Interface
 * Defines the contract for workout operations
 */

import { Workout } from '../entities/workout';
import { WorkoutFile } from '../value-objects/workout-file';

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
