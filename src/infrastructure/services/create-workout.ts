import type {
  CreateWorkoutRequest,
  WorkoutRepository,
  WorkoutResponse,
} from '@/application/repositories';
import type { CreateWorkout } from '@/application/services/create-workout';
import type { AuthToken } from '@/domain';

export const createWorkout =
  (workoutRepository: WorkoutRepository): CreateWorkout =>
  async (
    token: AuthToken,
    workout: CreateWorkoutRequest
  ): Promise<WorkoutResponse> => {
    return await workoutRepository.createWorkout(token, workout);
  };
