import type { WorkoutResponse } from '@/application/repositories';
import type { AuthToken } from '@/domain';

export type GetWorkoutByIdResult = WorkoutResponse;

export type GetWorkoutById = (
  id: string,
  token: AuthToken
) => Promise<GetWorkoutByIdResult>;
