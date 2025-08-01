import type { UserRepository } from '@/application/repositories';
import type { GetUserSettings } from '@/application/services';
import type { AuthToken, UserPreferences } from '@/domain/schemas';

/**
 * Get user settings
 */
export const getUserSettings =
  (userRepository: UserRepository): GetUserSettings =>
  async (token: AuthToken): Promise<UserPreferences> => {
    return await userRepository.getUserSettings(token);
  };
