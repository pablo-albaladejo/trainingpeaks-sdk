import type { AuthToken, UserPreferences } from '@/domain/schemas';

export type GetUserSettings = (token: AuthToken) => Promise<UserPreferences>;
