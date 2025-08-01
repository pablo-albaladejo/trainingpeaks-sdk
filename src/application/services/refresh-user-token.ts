import type { AuthToken } from '@/domain';

export type RefreshUserTokenResult = AuthToken;

export type RefreshUserToken = (refreshToken: string) => Promise<RefreshUserTokenResult>; 