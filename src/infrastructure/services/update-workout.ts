import type {
  UpdateWorkoutRequest,
  WorkoutRepository,
  WorkoutResponse,
} from '@/application/repositories';
import type { UpdateWorkout } from '@/application/services/update-workout';
import type { AuthToken } from '@/domain';

export const updateWorkout =
  (workoutRepository: WorkoutRepository): UpdateWorkout =>
  async (
    token: AuthToken,
    workout: UpdateWorkoutRequest
  ): Promise<WorkoutResponse> => {
    return await workoutRepository.updateWorkout(token, workout);
  };
