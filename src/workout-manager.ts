/**
 * Workout Manager
 * Simplified workout management functionality
 */

import { createWorkoutManagerService } from '@/infrastructure/services/workout-manager';

/**
 * Create workout manager with default configuration
 */
export const createWorkoutManager = () => {
  return createWorkoutManagerService();
};

/**
 * Type alias for backward compatibility
 */
export type WorkoutManager = unknown;

/**
 * Legacy compatibility - export the same interface as before
 * @deprecated Use createWorkoutManager instead
 */
export { createWorkoutManager as default };
