import { Credentials, Session } from '@/domain';

export type AuthRepositoryLogin = (
  credentials: Credentials
) => Promise<Session>;

export type AuthRepositoryLogout = () => Promise<void>;

export type AuthRepository = {
  login: AuthRepositoryLogin;
  logout: AuthRepositoryLogout;
};
