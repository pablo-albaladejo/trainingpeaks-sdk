import type {
  UpdateWorkoutRequest,
  WorkoutResponse,
} from '@/application/repositories';
import type { AuthToken } from '@/domain';

export type UpdateWorkoutResult = WorkoutResponse;

export type UpdateWorkout = (
  token: AuthToken,
  workout: UpdateWorkoutRequest
) => Promise<UpdateWorkoutResult>;
