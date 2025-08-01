import type { WorkoutRepository } from '@/application/repositories';
import type { GetWorkoutStats } from '@/application/services/get-workout-stats';
import type { AuthToken, WorkoutFilters, WorkoutStats } from '@/domain/schemas';

export const getWorkoutStats =
  (workoutRepository: WorkoutRepository): GetWorkoutStats =>
  async (token: AuthToken, filters?: WorkoutFilters): Promise<WorkoutStats> => {
    return await workoutRepository.getWorkoutStats(token, filters);
  };
