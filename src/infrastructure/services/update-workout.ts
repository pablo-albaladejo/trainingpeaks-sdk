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
    workout: UpdateWorkoutRequest,
    token: AuthToken
  ): Promise<WorkoutResponse> => {
    return await workoutRepository.updateWorkout(workout, token);
  };
