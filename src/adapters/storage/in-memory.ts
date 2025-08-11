import type { SessionStorage } from '@/application/ports/session-storage';
import type { Session } from '@/domain';

export const createInMemorySessionStorage = (): SessionStorage => {
  let session: Session | null = null;
  return {
    get: () => Promise.resolve(session),
    set: (s: Session) => {
      session = s;
      return Promise.resolve();
    },
    clear: async () => {
      session = null;
      return Promise.resolve();
    },
  };
};
