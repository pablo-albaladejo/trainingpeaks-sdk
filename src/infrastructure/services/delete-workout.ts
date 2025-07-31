import type { WorkoutRepository } from '@/application/repositories';
import type { DeleteWorkout } from '@/application/services/delete-workout';
import type { AuthToken } from '@/domain';

export const deleteWorkout =
  (workoutRepository: WorkoutRepository): DeleteWorkout =>
  async (token: AuthToken, id: string): Promise<void> => {
    await workoutRepository.deleteWorkout(token, id);
  };
