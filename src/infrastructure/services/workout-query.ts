/**
 * Workout Query Service Implementation
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import type { ListWorkoutsParams } from '@/application/services/workout-query';

/**
 * IMPLEMENTATION of WorkoutQueryService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createWorkoutQueryService = (
  workoutRepository: WorkoutRepository
) => {
  return {
    getWorkout: async (workoutId: string) => {
      return await workoutRepository.getWorkout(workoutId);
    },

    listWorkouts: async (params: ListWorkoutsParams) => {
      const workouts = await workoutRepository.listWorkouts(params);
      return {
        workouts: workouts || [],
        total: workouts?.length || 0,
        page: Math.floor((params.offset || 0) / (params.limit || 10)) + 1,
        limit: params.limit || 10,
        hasMore: (workouts?.length || 0) >= (params.limit || 10),
      };
    },
  };
};
