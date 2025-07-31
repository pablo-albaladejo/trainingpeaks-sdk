import { AuthToken, Credentials, User } from '../schemas';

export type AuthRepository = {
  authenticate: (credentials: Credentials) => Promise<AuthToken>;
  getUserInfo: (token: AuthToken) => Promise<User>;
};
