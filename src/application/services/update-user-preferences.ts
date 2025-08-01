import type { AuthToken, UserPreferences } from '@/domain/schemas';

export type UpdateUserPreferences = (
  token: AuthToken,
  preferences: UserPreferences
) => Promise<void>;
