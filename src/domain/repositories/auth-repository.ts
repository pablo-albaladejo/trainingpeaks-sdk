import { AuthToken, Credentials, User } from '@/domain';

export type AuthRepositoryLogin = (
  credentials: Credentials
) => Promise<{ token: AuthToken; user: User }>;

export type AuthRepositoryLogout = () => Promise<void>;

export type AuthRepository = {
  login: AuthRepositoryLogin;
  logout: AuthRepositoryLogout;
};
