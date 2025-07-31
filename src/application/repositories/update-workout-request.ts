/**
 * Request data for updating a workout
 */
export type UpdateWorkoutRequest = {
  id: string;
  name?: string;
  date?: string;
  duration?: number;
  type?: string;
  description?: string;
};
