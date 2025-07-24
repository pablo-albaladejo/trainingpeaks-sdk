import type { User } from '@/domain';

export type GetCurrentUserResult = User | null;

export type GetCurrentUser = () => Promise<GetCurrentUserResult>;
