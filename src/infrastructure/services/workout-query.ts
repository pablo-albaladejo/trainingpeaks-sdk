/**
 * Workout Query Service Implementation
 * Implements the WorkoutQueryService contract with business logic for workout queries
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import { WORKOUT_DEFAULTS } from '@/application/services/workout-constants';
import type {
  WorkoutListFilters,
  WorkoutQueryService,
} from '@/application/services/workout-query';
import type { WorkoutValidationService } from '@/application/services/workout-validation';
import { Workout } from '@/domain/entities/workout';
import { WorkoutNotFoundError } from '@/domain/errors/workout-errors';

/**
 * IMPLEMENTATION of WorkoutQueryService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createWorkoutQueryService = (
  workoutRepository: WorkoutRepository,
  validationService: WorkoutValidationService
): WorkoutQueryService => ({
  getWorkout: async (workoutId: string): Promise<Workout> => {
    validationService.validateWorkoutId(workoutId);

    const workout = await workoutRepository.getWorkout(workoutId);

    if (!workout) {
      throw new WorkoutNotFoundError(workoutId);
    }

    return workout;
  },

  listWorkouts: async (
    filters: WorkoutListFilters = {}
  ): Promise<Workout[]> => {
    // Validate business rules for listing
    validationService.validateListWorkoutsFilters(filters);

    // Apply default pagination
    const normalizedFilters = {
      ...filters,
      limit: filters.limit || WORKOUT_DEFAULTS.PAGINATION_LIMIT,
      offset: filters.offset || WORKOUT_DEFAULTS.PAGINATION_OFFSET,
    };

    return await workoutRepository.listWorkouts(normalizedFilters);
  },
});
