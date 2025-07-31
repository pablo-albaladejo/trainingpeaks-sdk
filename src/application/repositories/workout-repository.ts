import type { AuthToken } from '@/domain';
import type {
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  WorkoutFilters,
  WorkoutResponse,
  WorkoutStats,
  WorkoutsListResponse,
} from './';

/**
 * Repository types for workout-related operations
 */
export type WorkoutRepository = {
  /**
   * Get list of workouts with optional filters
   */
  getWorkouts(
    token: AuthToken,
    filters?: WorkoutFilters
  ): Promise<WorkoutsListResponse>;

  /**
   * Get workout by ID
   */
  getWorkoutById(id: string, token: AuthToken): Promise<WorkoutResponse>;

  /**
   * Create new workout
   */
  createWorkout(
    workout: CreateWorkoutRequest,
    token: AuthToken
  ): Promise<WorkoutResponse>;

  /**
   * Update existing workout
   */
  updateWorkout(
    workout: UpdateWorkoutRequest,
    token: AuthToken
  ): Promise<WorkoutResponse>;

  /**
   * Delete workout
   */
  deleteWorkout(id: string, token: AuthToken): Promise<void>;

  /**
   * Get workout statistics
   */
  getWorkoutStats(
    token: AuthToken,
    filters?: WorkoutFilters
  ): Promise<WorkoutStats>;
};
