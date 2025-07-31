import type {
  WorkoutRepository,
  WorkoutResponse,
} from '@/application/repositories';
import type { GetWorkoutById } from '@/application/services/get-workout-by-id';
import type { AuthToken } from '@/domain';

export const getWorkoutById =
  (workoutRepository: WorkoutRepository): GetWorkoutById =>
  async (token: AuthToken, id: string): Promise<WorkoutResponse> => {
    return await workoutRepository.getWorkoutById(token, id);
  };
