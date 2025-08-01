import type { UserRepository } from '@/application/repositories';
import type { GetCurrentUser } from '@/application/services';
import { createUser } from '@/domain/entities/user';
import type { AuthToken, User } from '@/domain/schemas';

/**
 * Get current user information using authentication token
 */
export const getCurrentUser =
  (userRepository: UserRepository): GetCurrentUser =>
  async (token: AuthToken): Promise<User> => {
    // Get raw data from repository
    const rawData = await userRepository.getUserInfo(token);

    // Create domain object with business logic
    const user = createUser(
      String(rawData.id),
      rawData.name,
      rawData.avatar,
      rawData.preferences
    );

    return user;
  };
