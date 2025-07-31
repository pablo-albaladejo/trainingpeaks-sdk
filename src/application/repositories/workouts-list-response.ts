/**
 * Workouts list response from API
 */
export type WorkoutsListResponse = {
  total: number;
  workouts: Array<{
    id: string;
    name: string;
    date: string;
    duration: number;
    type: string;
  }>;
};
