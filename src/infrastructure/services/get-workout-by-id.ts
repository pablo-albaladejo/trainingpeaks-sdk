import type { WorkoutRepository } from '@/application/repositories';
import type { GetWorkoutById } from '@/application/services/get-workout-by-id';
import type { AuthToken, WorkoutResponse } from '@/domain/schemas';

export const getWorkoutById =
  (workoutRepository: WorkoutRepository): GetWorkoutById =>
  async (token: AuthToken, id: string): Promise<WorkoutResponse> => {
    return await workoutRepository.getWorkoutById(token, id);
  };
