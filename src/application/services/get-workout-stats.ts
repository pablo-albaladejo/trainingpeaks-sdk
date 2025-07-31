import type { WorkoutFilters, WorkoutStats } from '@/application/repositories';
import type { AuthToken } from '@/domain';

export type GetWorkoutStatsResult = WorkoutStats;

export type GetWorkoutStats = (
  token: AuthToken,
  filters?: WorkoutFilters
) => Promise<GetWorkoutStatsResult>;
