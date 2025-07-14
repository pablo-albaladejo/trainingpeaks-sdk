/**
 * Workout Management Service Contract
 * Defines the interface for workout management operations
 */

/**
 * Contract for workout management operations
 * Defines what management capabilities the system needs
 */
export type WorkoutManagementService = {
  /**
   * Delete workout with business logic validation
   * @param workoutId - The ID of the workout to delete
   * @returns Promise resolving to boolean indicating success
   * @throws WorkoutNotFoundError if workout doesn't exist
   * @throws InvalidWorkoutFiltersError if deletion is not allowed
   */
  deleteWorkout: (workoutId: string) => Promise<boolean>;
};

/**
 * Factory function signature for creating workout management service
 * This defines the contract for how the service should be instantiated
 */
export type WorkoutManagementServiceFactory = (
  workoutRepository: unknown,
  validationService: unknown
) => WorkoutManagementService;
