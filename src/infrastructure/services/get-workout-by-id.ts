import type {
  WorkoutRepository,
  WorkoutResponse,
} from '@/application/repositories';
import type { GetWorkoutById } from '@/application/services/get-workout-by-id';
import type { AuthToken } from '@/domain';

export const getWorkoutById =
  (workoutRepository: WorkoutRepository): GetWorkoutById =>
  async (id: string, token: AuthToken): Promise<WorkoutResponse> => {
    return await workoutRepository.getWorkoutById(id, token);
  };
