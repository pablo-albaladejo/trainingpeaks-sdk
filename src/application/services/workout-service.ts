/**
 * Workout Service Contract
 * Defines the interface for coordinated workout operations
 */

import { WorkoutCreationService } from './workout-creation';
import { WorkoutManagementService } from './workout-management';
import { WorkoutQueryService } from './workout-query';

/**
 * Contract for unified workout operations
 * Coordinates all workout-related services and provides a unified interface
 */
export type WorkoutService = WorkoutCreationService &
  WorkoutQueryService &
  WorkoutManagementService;

/**
 * Factory function signature for creating workout service
 * This defines the contract for how the service should be instantiated
 */
export type WorkoutServiceFactory = (
  workoutRepository: unknown
) => WorkoutService;
