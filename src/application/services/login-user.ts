import type { AuthToken, Credentials } from '@/domain';

export type LoginUserResult = AuthToken | null;

export type LoginUser = (credentials: Credentials) => Promise<LoginUserResult>;
