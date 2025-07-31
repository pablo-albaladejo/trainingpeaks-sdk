import type { UserRepository } from '@/application/repositories';
import type { GetUserSettings } from '@/application/services';
import type { AuthToken } from '@/domain';

/**
 * Get user settings
 */
export const getUserSettings =
  (userRepository: UserRepository): GetUserSettings =>
  async (token: AuthToken): Promise<Record<string, unknown>> => {
    // Delegate to repository (no business logic needed)
    return await userRepository.getUserSettings(token);
  };
