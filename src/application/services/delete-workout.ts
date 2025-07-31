import type { AuthToken } from '@/domain';

export type DeleteWorkout = (id: string, token: AuthToken) => Promise<void>;
