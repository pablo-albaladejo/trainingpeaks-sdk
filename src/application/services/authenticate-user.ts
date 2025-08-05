import type { Session } from '@/application/ports/session-storage';
import type { Credentials } from '@/domain';

export type AuthenticateUserResult = Session;

export type AuthenticateUser = (
  credentials: Credentials
) => Promise<AuthenticateUserResult>;
