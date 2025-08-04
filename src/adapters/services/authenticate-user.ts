import {
  AuthenticateUser,
  AuthenticateUserResult,
  TrainingPeaksRepository,
} from '@/application';
import { Credentials } from '@/domain';

export const authenticateUserService = (
  tpRepository: TrainingPeaksRepository
): AuthenticateUser => {
  return async (credentials: Credentials): Promise<AuthenticateUserResult> => {
    return await tpRepository.login(credentials);
  };
};
