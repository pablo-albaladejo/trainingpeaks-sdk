import type { AuthToken } from '@/domain';

export type GetUserSettingsResult = Record<string, unknown>;

export type GetUserSettings = (token: AuthToken) => Promise<GetUserSettingsResult>; 