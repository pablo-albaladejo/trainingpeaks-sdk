import type { User } from '@/domain';

export type GetUser = () => Promise<User | null>;
