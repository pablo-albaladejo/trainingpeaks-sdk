import type {
  WorkoutFilters,
  WorkoutRepository,
  WorkoutStats,
} from '@/application/repositories';
import type { GetWorkoutStats } from '@/application/services/get-workout-stats';
import type { AuthToken } from '@/domain';

export const getWorkoutStats =
  (workoutRepository: WorkoutRepository): GetWorkoutStats =>
  async (token: AuthToken, filters?: WorkoutFilters): Promise<WorkoutStats> => {
    return await workoutRepository.getWorkoutStats(token, filters);
  };
