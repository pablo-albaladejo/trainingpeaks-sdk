/**
 * Session Entity
 * Represents an authenticated user session
 */

import type { AuthToken } from './auth-token';
import type { User } from './user';

/**
 * User session containing authentication token and user data
 */
export type Session = {
  token: AuthToken;
  user: User;
};
