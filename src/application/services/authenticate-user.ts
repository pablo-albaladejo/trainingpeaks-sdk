import type { Credentials, Session } from '@/domain';

export type AuthenticateUserResult = Session;

export type AuthenticateUser = (
  credentials: Credentials
) => Promise<AuthenticateUserResult>;
