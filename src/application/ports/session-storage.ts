import type { Session } from '@/domain';

export type SessionStorage = {
  get: () => Promise<Session | null>;
  set: (session: Session) => Promise<void>;
  clear: () => Promise<void>;
};
