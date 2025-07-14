/**
 * Workout Domain Service Implementation (DEPRECATED)
 *
 * @deprecated Use WorkoutService instead for new code.
 * This service is maintained for backward compatibility.
 *
 * Contains business logic for workout operations
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import type { WorkoutDomainService } from '@/application/services/workout-domain';
import { createWorkoutService } from './workout-service';

/**
 * IMPLEMENTATION of WorkoutDomainService (DEPRECATED)
 * This is an ADAPTER - implements the port defined in application layer
 *
 * @deprecated Use createWorkoutService instead for new code.
 * This factory is maintained for backward compatibility.
 */
export const createWorkoutDomainService = (
  workoutRepository: WorkoutRepository
): WorkoutDomainService => {
  // Delegate to the new modular workout service
  const workoutService = createWorkoutService(workoutRepository);

  // Return the same interface for backward compatibility
  return {
    createStructuredWorkout: workoutService.createStructuredWorkout,
    createStructuredWorkoutFromSimpleStructure:
      workoutService.createStructuredWorkoutFromSimpleStructure,
    uploadWorkout: workoutService.uploadWorkout,
    getWorkout: workoutService.getWorkout,
    listWorkouts: workoutService.listWorkouts,
    deleteWorkout: workoutService.deleteWorkout,
  };
};
