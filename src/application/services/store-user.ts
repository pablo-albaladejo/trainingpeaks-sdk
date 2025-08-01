import type { User } from '@/domain';

export type StoreUser = (user: User) => Promise<void>;
