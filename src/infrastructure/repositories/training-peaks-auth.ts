/**
 * TrainingPeaks Authentication Repository
 * Handles authentication operations with TrainingPeaks API
 */

import { type AuthRepository } from '@/application';
import { AuthToken } from '@/domain/entities/auth-token';
import { User } from '@/domain/entities/user';
import { Credentials } from '@/domain/value-objects/credentials';

/**
 * Current authentication state
 */
let currentUser: User | null = null;
let currentToken: AuthToken | null = null;

/**
 * TrainingPeaks Authentication Repository
 * Implements the AuthRepository interface for TrainingPeaks authentication
 */
export const createTrainingPeaksAuthRepository = (): AuthRepository => {
  // Helper methods
  const setCurrentUser = (user: User | null): void => {
    currentUser = user;
  };

  const setCurrentToken = (token: AuthToken | null): void => {
    currentToken = token;
  };

  const clearCurrentState = (): void => {
    currentUser = null;
    currentToken = null;
  };

  // Repository implementation
  const authenticate = async (credentials: Credentials): Promise<AuthToken> => {
    // For now, create a mock token
    const token = AuthToken.create(
      'mock-access-token',
      'Bearer',
      new Date(Date.now() + 3600000),
      'mock-refresh-token'
    );
    setCurrentToken(token);

    // Create a mock user
    const user = User.create('mock-user-id', credentials.username, undefined, {
      email: credentials.username,
    });
    setCurrentUser(user);

    return token;
  };

  const getCurrentUser = async (): Promise<User | null> => {
    return currentUser;
  };

  const clearAuth = async (): Promise<void> => {
    clearCurrentState();
  };

  const refreshToken = async (refreshToken: string): Promise<AuthToken> => {
    // For now, create a new mock token
    const newToken = AuthToken.create(
      'new-mock-access-token',
      'Bearer',
      new Date(Date.now() + 3600000),
      refreshToken
    );
    setCurrentToken(newToken);
    return newToken;
  };

  const isAuthenticated = (): boolean => {
    return currentToken !== null;
  };

  const getCurrentToken = (): AuthToken | null => {
    return currentToken;
  };

  const getUserId = (): string | null => {
    return currentUser?.id || null;
  };

  const storeToken = async (token: AuthToken): Promise<void> => {
    setCurrentToken(token);
  };

  const storeUser = async (user: User): Promise<void> => {
    setCurrentUser(user);
  };

  const repository: AuthRepository = {
    authenticate,
    getCurrentUser,
    clearAuth,
    refreshToken,
    isAuthenticated,
    getCurrentToken,
    getUserId,
    storeToken,
    storeUser,
  };

  return repository;
};
