import type { AuthToken, User } from '@/domain';

export type Session = {
  token: AuthToken;
  user: User;
};

export type SessionStorage = {
  get: () => Promise<Session | null>;
  set: (session: Session) => Promise<void>;
  clear: () => Promise<void>;
};
