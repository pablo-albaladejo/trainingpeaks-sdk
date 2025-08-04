import { AuthRepository } from '@/domain';

export type TrainingPeaksRepository = {
  login: AuthRepository['login'];
  logout: AuthRepository['logout'];
};
