import type { WorkoutResponse } from '@/application/repositories';
import type { AuthToken } from '@/domain';

export type GetWorkoutByIdResult = WorkoutResponse;

export type GetWorkoutById = (
  token: AuthToken,
  id: string
) => Promise<GetWorkoutByIdResult>;
