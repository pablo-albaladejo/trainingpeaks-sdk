import type { UserRepository } from '@/application/repositories';
import type { GetCurrentUser } from '@/application/services';
import type { AuthToken, User } from '@/domain';
import { createUser } from '@/domain/entities/user';

/**
 * Get current user information using authentication token
 */
export const getCurrentUser =
  (userRepository: UserRepository): GetCurrentUser =>
  async (token: AuthToken): Promise<User> => {
    // Get raw data from repository
    const rawUser = await userRepository.getUserInfo(token);

    // Create domain object with business logic
    const user = createUser(
      String(rawUser.id),
      rawUser.name,
      rawUser.avatar,
      rawUser.preferences
    );

    return user;
  };
