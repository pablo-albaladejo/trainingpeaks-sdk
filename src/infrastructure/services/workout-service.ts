/**
 * Workout Service Implementation
 * Implements the WorkoutService contract by coordinating all workout-related services
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import type { WorkoutService } from '@/application/services/workout-service';
import { createWorkoutCreationService } from './workout-creation';
import { createWorkoutManagementService } from './workout-management';
import { createWorkoutQueryService } from './workout-query';
import { createWorkoutUtilityService } from './workout-utility';
import { createWorkoutValidationService } from './workout-validation';

/**
 * IMPLEMENTATION of WorkoutService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createWorkoutService = (
  workoutRepository: WorkoutRepository
): WorkoutService => {
  // Create all sub-services
  const validationService = createWorkoutValidationService();
  const utilityService = createWorkoutUtilityService();
  const creationService = createWorkoutCreationService(
    workoutRepository,
    validationService,
    utilityService
  );
  const queryService = createWorkoutQueryService(
    workoutRepository,
    validationService
  );
  const managementService = createWorkoutManagementService(
    workoutRepository,
    validationService
  );

  // Return the unified service interface
  return {
    // Creation operations
    createStructuredWorkout: creationService.createStructuredWorkout,
    createStructuredWorkoutFromSimpleStructure:
      creationService.createStructuredWorkoutFromSimpleStructure,
    uploadWorkout: creationService.uploadWorkout,

    // Query operations
    getWorkout: queryService.getWorkout,
    listWorkouts: queryService.listWorkouts,

    // Management operations
    deleteWorkout: managementService.deleteWorkout,
  };
};
