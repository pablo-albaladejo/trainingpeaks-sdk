import { AuthRepository, WorkoutRepository } from '@/domain';

export type TrainingPeaksRepository = Pick<AuthRepository, 'login' | 'logout'> &
  Pick<WorkoutRepository, 'getWorkoutsList'>;
