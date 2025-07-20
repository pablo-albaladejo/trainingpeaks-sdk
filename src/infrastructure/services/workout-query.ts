/**
 * Workout Query Service Implementation
 * Individual function implementations that receive dependencies as parameters
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import type {
  GetWorkout,
  ListWorkouts,
  ListWorkoutsParams,
  ListWorkoutsResponse,
} from '@/application/services/workout-query';
import type { Workout } from '@/domain/entities/workout';
import type { WorkoutData, WorkoutType } from '@/types';

// Helper function to map Workout entity to WorkoutData
const mapWorkoutToWorkoutData = (workout: Workout): WorkoutData => ({
  name: workout.name,
  description: workout.description,
  date: workout.date.toISOString(),
  duration: workout.duration,
  distance: workout.distance,
  type: workout.activityType as WorkoutType,
  fileData: workout.fileName
    ? {
        filename: workout.fileName,
        content: workout.fileContent || '',
        mimeType: 'application/octet-stream',
      }
    : undefined,
});

export const getWorkout =
  (workoutRepository: WorkoutRepository): GetWorkout =>
  async (workoutId: string) => {
    const workout = await workoutRepository.getWorkout(workoutId);
    return workout ? mapWorkoutToWorkoutData(workout) : null;
  };

export const listWorkouts =
  (workoutRepository: WorkoutRepository): ListWorkouts =>
  async (params: ListWorkoutsParams): Promise<ListWorkoutsResponse> => {
    const workouts = await workoutRepository.listWorkouts(params);
    const mappedWorkouts = workouts
      ? workouts.map(mapWorkoutToWorkoutData)
      : [];
    return {
      workouts: mappedWorkouts,
      total: mappedWorkouts.length,
      page: Math.floor((params.offset || 0) / (params.limit || 10)) + 1,
      limit: params.limit || 10,
      hasMore: mappedWorkouts.length >= (params.limit || 10),
    };
  };
