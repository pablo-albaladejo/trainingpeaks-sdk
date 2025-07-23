/**
 * Workout Query Service Contract
 * Defines the interface for workout query operations
 */

import type { WorkoutData } from '@/types';
import { SortOption } from '@/types';

/**
 * Parameters for listing workouts
 */
export type ListWorkoutsParams = {
  limit?: number;
  offset?: number;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  activityType?: string;
  difficulty?: string;
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
};

/**
 * Response from listing workouts
 */
export type ListWorkoutsResponse = {
  workouts: WorkoutData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

/**
 * Contract for workout query operations
 * Defines what query capabilities the system needs
 */

/**
 * Get a workout by ID
 * @param workoutId - The ID of the workout to retrieve
 * @returns Promise resolving to workout data or null if not found
 */
export type GetWorkout = (workoutId: string) => Promise<WorkoutData | null>;

/**
 * List workouts with filters and pagination
 * @param params - The query parameters for listing workouts
 * @returns Promise resolving to list of workouts with pagination info
 */
export type ListWorkouts = (
  params: ListWorkoutsParams
) => Promise<ListWorkoutsResponse>;
