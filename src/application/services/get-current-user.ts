import type { AuthToken, User } from '@/domain';

export type GetCurrentUserResult = User;

export type GetCurrentUser = (token: AuthToken) => Promise<GetCurrentUserResult>;
