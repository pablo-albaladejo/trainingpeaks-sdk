import type { AuthToken } from '@/domain';

export type UpdateUserPreferencesResult = void;

export type UpdateUserPreferences = (
  token: AuthToken,
  preferences: Record<string, unknown>
) => Promise<UpdateUserPreferencesResult>; 