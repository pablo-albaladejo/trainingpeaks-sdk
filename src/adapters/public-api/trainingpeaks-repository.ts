import type { TrainingPeaksRepository } from '@/application';
import type { AuthRepository } from '@/domain';

type TrainingPeaksRepositoryDependencies = {
  authRepository: AuthRepository;
};

export const createTrainingPeaksRepository = (
  deps: TrainingPeaksRepositoryDependencies
): TrainingPeaksRepository => {
  return {
    login: deps.authRepository.login,
    logout: deps.authRepository.logout,
  };
};
