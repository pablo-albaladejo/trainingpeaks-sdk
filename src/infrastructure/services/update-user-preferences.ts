import type { UserRepository } from '@/application/repositories';
import type { UpdateUserPreferences } from '@/application/services';
import type { AuthToken } from '@/domain';

/**
 * Update user preferences
 */
export const updateUserPreferences =
  (userRepository: UserRepository): UpdateUserPreferences =>
  async (
    token: AuthToken,
    preferences: Record<string, unknown>
  ): Promise<void> => {
    // Delegate to repository (no business logic needed)
    await userRepository.updatePreferences(token, preferences);
  };
