/**
 * Request data for creating a workout
 */
export type CreateWorkoutRequest = {
  name: string;
  date: string;
  duration: number;
  type: string;
  description?: string;
};
