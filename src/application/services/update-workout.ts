import type {
  AuthToken,
  UpdateWorkoutRequest,
  WorkoutResponse,
} from '@/domain/schemas';

export type UpdateWorkout = (
  token: AuthToken,
  workout: UpdateWorkoutRequest
) => Promise<WorkoutResponse>;
