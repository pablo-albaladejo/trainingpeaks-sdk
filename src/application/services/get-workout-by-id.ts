import type { AuthToken, WorkoutResponse } from '@/domain/schemas';

export type GetWorkoutById = (
  token: AuthToken,
  id: string
) => Promise<WorkoutResponse>;
