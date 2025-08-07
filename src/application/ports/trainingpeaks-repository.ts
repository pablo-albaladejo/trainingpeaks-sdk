import { AuthRepository, WorkoutRepository } from '@/domain';

export type TrainingPeaksRepository = {
  login: AuthRepository['login'];
  logout: AuthRepository['logout'];
  getWorkoutsList: WorkoutRepository['getWorkoutsList'];
};
