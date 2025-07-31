import type {
  CreateWorkoutRequest,
  WorkoutResponse,
} from '@/application/repositories';
import type { AuthToken } from '@/domain';

export type CreateWorkoutResult = WorkoutResponse;

export type CreateWorkout = (
  token: AuthToken,
  workout: CreateWorkoutRequest
) => Promise<CreateWorkoutResult>;
