/**
 * Workout Management Service Contract
 * Defines the interface for workout management operations
 */

/**
 * Contract for workout management operations
 * Defines what management capabilities the system needs
 */

/**
 * Delete a workout by ID
 * @param workoutId - The ID of the workout to delete
 * @returns Promise resolving to boolean indicating success
 */
export type DeleteWorkout = (workoutId: string) => Promise<boolean>;
