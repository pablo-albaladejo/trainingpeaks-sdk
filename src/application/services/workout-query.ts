/**
 * Workout Query Service Contract
 * Defines the interface for workout query operations
 */

import { Workout } from '@/domain/entities/workout';

/**
 * Filters for listing workouts
 */
export type WorkoutListFilters = {
  startDate?: Date;
  endDate?: Date;
  activityType?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
};

/**
 * Contract for workout query operations
 * Defines what query capabilities the system needs
 */

/**
 * Get workout by ID with business logic validation
 * @param workoutId - The ID of the workout to retrieve
 * @returns Promise resolving to the workout
 * @throws WorkoutNotFoundError if workout doesn't exist
 */
export type getWorkout = (workoutId: string) => Promise<Workout>;

/**
 * List workouts with business logic validation
 * @param filters - Optional filters for the workout list
 * @returns Promise resolving to array of workouts
 */
export type listWorkouts = (filters?: WorkoutListFilters) => Promise<Workout[]>;

/**
 * Factory function signature for creating workout query service
 * This defines the contract for how the service should be instantiated
 */
export type WorkoutQueryServiceFactory = (
  workoutRepository: unknown,
  validationService: unknown
) => {
  getWorkout: getWorkout;
  listWorkouts: listWorkouts;
};
