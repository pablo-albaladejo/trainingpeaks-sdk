import type {
  CreateWorkoutRequest,
  WorkoutResponse,
} from '@/application/repositories';
import type { AuthToken } from '@/domain';

export type CreateWorkoutResult = WorkoutResponse;

export type CreateWorkout = (
  workout: CreateWorkoutRequest,
  token: AuthToken
) => Promise<CreateWorkoutResult>;
