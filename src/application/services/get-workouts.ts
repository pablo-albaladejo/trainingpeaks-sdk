import type {
  WorkoutFilters,
  WorkoutsListResponse,
} from '@/application/repositories';
import type { AuthToken } from '@/domain';

export type GetWorkoutsResult = WorkoutsListResponse;

export type GetWorkouts = (
  token: AuthToken,
  filters?: WorkoutFilters
) => Promise<GetWorkoutsResult>;
