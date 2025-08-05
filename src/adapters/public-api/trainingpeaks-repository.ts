import type { TrainingPeaksRepository } from '@/application';
import type { AuthRepository, WorkoutRepository } from '@/domain';

type TrainingPeaksRepositoryDependencies = {
  authRepository: AuthRepository;
  workoutRepository: WorkoutRepository;
};

export const createTrainingPeaksRepository = (
  deps: TrainingPeaksRepositoryDependencies
): TrainingPeaksRepository => {
  return {
    login: deps.authRepository.login,
    logout: deps.authRepository.logout,
    getWorkoutsList: deps.workoutRepository.getWorkoutsList,
  };
};
