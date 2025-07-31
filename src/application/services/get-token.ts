import type { AuthToken } from '@/domain';

export type GetToken = () => Promise<AuthToken | null>;
