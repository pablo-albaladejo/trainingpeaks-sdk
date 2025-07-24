/**
 * Credentials Value Object
 * Represents user authentication credentials
 */

import type { Credentials as CredentialsType } from '@/domain/schemas/value-objects.schema';

export type Credentials = CredentialsType;

/**
 * Create credentials value object
 */
export const createCredentials = (
  username: string,
  password: string
): Credentials => ({
  username: username.trim(),
  password,
});

/**
 * Validate credentials
 */
export const validateCredentials = (credentials: Credentials): boolean => {
  return credentials.username.length > 0 && credentials.password.length > 0;
};
