import type { AuthToken } from '@/domain';

export type DeleteWorkout = (token: AuthToken, id: string) => Promise<void>;
