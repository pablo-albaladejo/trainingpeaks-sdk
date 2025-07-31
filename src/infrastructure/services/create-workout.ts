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
    workout: CreateWorkoutRequest,
    token: AuthToken
  ): Promise<WorkoutResponse> => {
    return await workoutRepository.createWorkout(workout, token);
  };
