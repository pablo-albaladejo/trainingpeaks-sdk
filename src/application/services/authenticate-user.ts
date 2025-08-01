import type { AuthToken, Credentials, User } from '@/domain';

export type AuthenticateUserResult = { token: AuthToken; user: User };

export type AuthenticateUser = (credentials: Credentials) => Promise<AuthenticateUserResult>; 