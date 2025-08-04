import type { Credentials } from '@/domain';
import type { Session } from '@/application/ports/session-storage';

export type AuthenticateUserResult = Session;

export type AuthenticateUser = (credentials: Credentials) => Promise<AuthenticateUserResult>; 