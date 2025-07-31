/**
 * Workout filters for querying workouts
 */
export type WorkoutFilters = {
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  limit?: number;
  offset?: number;
};
