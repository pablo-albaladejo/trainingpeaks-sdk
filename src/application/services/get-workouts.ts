import type {
  AuthToken,
  WorkoutFilters,
  WorkoutsListResponse,
} from '@/domain/schemas';

export type GetWorkouts = (
  token: AuthToken,
  filters?: WorkoutFilters
) => Promise<WorkoutsListResponse>;
