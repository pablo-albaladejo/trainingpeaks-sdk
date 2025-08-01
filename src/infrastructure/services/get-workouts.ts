import type { WorkoutRepository } from '@/application/repositories';
import type { GetWorkouts } from '@/application/services/get-workouts';
import type {
  AuthToken,
  WorkoutFilters,
  WorkoutsListResponse,
} from '@/domain/schemas';

export const getWorkouts =
  (workoutRepository: WorkoutRepository): GetWorkouts =>
  async (
    token: AuthToken,
    filters?: WorkoutFilters
  ): Promise<WorkoutsListResponse> => {
    return await workoutRepository.getWorkouts(token, filters);
  };
