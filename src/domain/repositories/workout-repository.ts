/**
 * Workout Repository Interface
 * Contract for workout operations
 */

import type { Workout } from '@/domain';
import type { WorkoutFile } from '@/domain/value-objects/workout-file';

export type UploadWorkoutRequest = {
  name: string;
  description?: string;
  date: Date;
  duration: number;
  distance?: number;
  activityType?: string;
  structure?: Workout['structure'];
  file?: WorkoutFile;
};

export type UploadWorkoutResponse = {
  success: boolean;
  workoutId: string;
  message: string;
  errors?: string[];
};

export type WorkoutRepository = {
  /**
   * Upload a workout (structured or with file)
   */
  uploadWorkout(request: UploadWorkoutRequest): Promise<UploadWorkoutResponse>;
};
