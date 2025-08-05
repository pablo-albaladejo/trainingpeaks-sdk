/**
 * Workouts API Types
 * Type definitions for fitness/v6/workouts endpoints
 */

/**
 * Raw workout item from TrainingPeaks API
 */
export type ApiWorkoutItem = {
  workoutId: number;
  athleteId: number;
  title: string;
  workoutTypeValueId: number;
  code: string | null;
  workoutDay: string; // ISO date string
  startTime: string | null; // ISO date string
  startTimePlanned: string | null; // ISO date string
  isItAnOr: boolean;
};

/**
 * Request parameters for getting workouts list
 */
export type GetWorkoutsListParams = {
  athleteId: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
};

/**
 * API Response for workouts list
 */
export type GetWorkoutsListApiResponse = readonly ApiWorkoutItem[];
