import type { AuthToken } from '@/domain';

export type StoreToken = (token: AuthToken) => Promise<void>;
