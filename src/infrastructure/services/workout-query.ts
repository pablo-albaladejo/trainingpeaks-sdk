/**
 * Workout Query Service Implementation
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import { WORKOUT_DEFAULTS } from '@/application/services/workout-constants';
import type { WorkoutListFilters } from '@/application/services/workout-query';
import { Workout } from '@/domain/entities/workout';
import { WorkoutNotFoundError } from '@/domain/errors/workout-errors';

/**
 * IMPLEMENTATION of WorkoutQueryService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createWorkoutQueryService = (
  workoutRepository: WorkoutRepository,
  validationService: any // Simplified type for now
) => {
  return {
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
      validationService.validateListWorkoutsFilters(filters);

      const sanitizedFilters = {
        ...WORKOUT_DEFAULTS,
        ...filters,
      };

      return await workoutRepository.listWorkouts(sanitizedFilters);
    },
  };
};
