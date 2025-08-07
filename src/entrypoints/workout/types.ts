import { Logger } from '@/adapters';
import { SessionStorage, TrainingPeaksRepository } from '@/application';
import type { WorkoutListItem } from '@/domain';

/**
 * Workout Entrypoint Dependencies
 */
export type WorkoutEntrypointDependencies = {
  tpRepository: TrainingPeaksRepository;
  sessionStorage: SessionStorage;
  logger: Logger;
};

/**
 * Get Workout Response
 * Returns the workout data directly or throws an error
 */
export type GetWorkoutResponse = {
  id: string;
  name: string;
  description: string;
  date: string; // ISO date string
  duration: number; // seconds
  distance?: number; // meters
  activityType?: string;
  tags?: readonly string[];
};

/**
 * Get Workouts List Command
 */
export type GetWorkoutsListCommand = {
  athleteId?: string; // Optional - will use current user's ID if not provided
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
};

/**
 * Get Workouts List Response
 * Returns the workout list directly or throws an error
 */
export type GetWorkoutsListResponse = readonly WorkoutListItem[];

/**
 * Legacy Get Workouts List Response (keeping for backwards compatibility)
 * Returns the workout data directly or throws an error
 */
export type GetWorkoutsResponse = {
  workouts: readonly {
    id: string;
    name: string;
    description: string;
    date: string;
    duration: number;
    distance?: number;
    activityType?: string;
    tags?: readonly string[];
  }[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
};

/**
 * Create Workout Command
 */
export type CreateWorkoutCommand = {
  name: string;
  description: string;
  date: string; // ISO date string
  duration: number;
  distance?: number;
  activityType?: string;
  tags?: readonly string[];
  fileContent?: string;
  fileName?: string;
};

/**
 * Create Workout Response
 * Returns the created workout data directly or throws an error
 */
export type CreateWorkoutResponse = {
  id: string;
  name: string;
  description: string;
  date: string;
  duration: number;
  distance?: number;
  activityType?: string;
  tags?: readonly string[];
};

/**
 * Update Workout Command
 */
export type UpdateWorkoutCommand = {
  id: string;
  name?: string;
  description?: string;
  date?: string;
  duration?: number;
  distance?: number;
  activityType?: string;
  tags?: readonly string[];
};

/**
 * Update Workout Response
 */
export type UpdateWorkoutResponse = CreateWorkoutResponse;

/**
 * Delete Workout Response
 * Returns void on success or throws an error
 */
export type DeleteWorkoutResponse = void;
