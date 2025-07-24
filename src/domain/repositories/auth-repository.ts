import { AuthToken, Credentials } from '../schemas';

export type AuthRepository = {
  authenticate: (credentials: Credentials) => Promise<AuthToken>;
};
