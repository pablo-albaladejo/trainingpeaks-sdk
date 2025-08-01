import type {
  AuthToken,
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  WorkoutFilters,
  WorkoutResponse,
  WorkoutStats,
  WorkoutsListResponse,
} from '@/domain/schemas';

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
  getWorkoutById(token: AuthToken, id: string): Promise<WorkoutResponse>;

  /**
   * Create new workout
   */
  createWorkout(
    token: AuthToken,
    workout: CreateWorkoutRequest
  ): Promise<WorkoutResponse>;

  /**
   * Update existing workout
   */
  updateWorkout(
    token: AuthToken,
    workout: UpdateWorkoutRequest
  ): Promise<WorkoutResponse>;

  /**
   * Delete workout
   */
  deleteWorkout(token: AuthToken, id: string): Promise<void>;

  /**
   * Get workout statistics
   */
  getWorkoutStats(
    token: AuthToken,
    filters?: WorkoutFilters
  ): Promise<WorkoutStats>;
};
