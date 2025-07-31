/**
 * Workout response from API
 */
export type WorkoutResponse = {
  workout: {
    id: string;
    name: string;
    date: string;
    duration: number;
    type: string;
    description?: string;
  };
};
