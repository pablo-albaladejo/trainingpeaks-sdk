/**
 * Workout Repository Domain Interface
 * Defines the contract for workout data access operations
 */

export type GetWorkoutsListParams = {
  athleteId: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
};

export type WorkoutListItem = {
  workoutId: number;
  athleteId: number;
  title: string;
  workoutTypeValueId: number;
  code: string | null;
  workoutDay: string; // ISO date string
  startTime: string | null; // ISO date string
  startTimePlanned: string | null; // ISO date string
  isItAnOr: boolean;
};

export type WorkoutRepositoryGetWorkoutsList = (
  params: GetWorkoutsListParams
) => Promise<readonly WorkoutListItem[]>;

export type WorkoutRepository = {
  getWorkoutsList: WorkoutRepositoryGetWorkoutsList;
};
