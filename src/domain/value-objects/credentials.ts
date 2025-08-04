/**
 * Credentials Value Object
 * Represents user authentication credentials
 */

import { ValidationError } from '@/domain/errors/domain-errors';
import type { Credentials as CredentialsType } from '@/domain/schemas/value-objects.schema';

export type Credentials = CredentialsType;

/**
 * Create immutable credentials value object
 */
export const createCredentials = (
  username: string,
  password: string
): Credentials => {
  const trimmedUsername = username.trim();
  
  // Validate invariants
  if (!trimmedUsername) {
    throw new ValidationError('Username cannot be empty', 'username');
  }
  
  if (!password) {
    throw new ValidationError('Password cannot be empty', 'password');
  }
  
  if (trimmedUsername.length > 100) {
    throw new ValidationError('Username cannot exceed 100 characters', 'username');
  }
  
  // Create immutable object
  const credentials = {
    username: trimmedUsername,
    password,
  };
  
  return Object.freeze(credentials);
};

/**
 * Validate credentials
 */
export const validateCredentials = (credentials: Credentials): boolean => {
  return credentials.username.length > 0 && credentials.password.length > 0;
};

/**
 * Create credentials with masked password for logging
 */
export const createMaskedCredentials = (credentials: Credentials): Credentials => {
  return createCredentials(credentials.username, '***');
};

/**
 * Check if credentials are equal (without exposing password)
 */
export const areCredentialsEqual = (
  cred1: Credentials,
  cred2: Credentials
): boolean => {
  return cred1.username === cred2.username && cred1.password === cred2.password;
};
