import type {
  AuthToken,
  CreateWorkoutRequest,
  WorkoutResponse,
} from '@/domain/schemas';

export type CreateWorkout = (
  token: AuthToken,
  workout: CreateWorkoutRequest
) => Promise<WorkoutResponse>;
