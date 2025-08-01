import type { AuthToken, WorkoutFilters, WorkoutStats } from '@/domain/schemas';

export type GetWorkoutStats = (
  token: AuthToken,
  filters?: WorkoutFilters
) => Promise<WorkoutStats>;
