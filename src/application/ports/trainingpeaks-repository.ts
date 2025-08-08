import type { AuthRepository, WorkoutRepository } from '@/domain';

export interface TrainingPeaksRepository extends Pick<AuthRepository, 'login' | 'logout'>, Pick<WorkoutRepository, 'getWorkoutsList'> {}
