import type { UserRepository } from '@/application/repositories';
import type { UpdateUserPreferences } from '@/application/services';
import type { AuthToken, UserPreferences } from '@/domain/schemas';

/**
 * Update user preferences
 */
export const updateUserPreferences =
  (userRepository: UserRepository): UpdateUserPreferences =>
  async (token: AuthToken, preferences: UserPreferences): Promise<void> => {
    await userRepository.updatePreferences(token, preferences);
  };
