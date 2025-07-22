/**
 * Login Use Case
 * Handles user authentication and session establishment
 */

import type { AuthRepository } from '@/application/ports/auth';
import type { AuthToken } from '@/domain/entities/auth-token';
import type { User } from '@/domain/entities/user';
import { Credentials } from '@/domain/value-objects/credentials';

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: AuthToken;
  user: User;
};

export type ExecuteLoginUseCase = (
  request: LoginRequest
) => Promise<LoginResponse>;

/**
 * Login Use Case Implementation
 * Individual function that receives dependencies as parameters
 */
export const executeLoginUseCase =
  (authRepository: AuthRepository): ExecuteLoginUseCase =>
  async (request: LoginRequest): Promise<LoginResponse> => {
    // Create credentials from request
    const credentials = Credentials.create(request.username, request.password);

    // Authenticate user
    const authToken = await authRepository.authenticate(credentials);

    if (!authToken) {
      throw new Error('Authentication failed');
    }

    // Get the authenticated user
    const user = await authRepository.getCurrentUser();

    if (!user) {
      throw new Error('Failed to retrieve user information');
    }

    return {
      token: authToken,
      user: user,
    };
  };

// Keep the existing grouped function for backward compatibility
export const createLoginUseCase = (authRepository: AuthRepository) => {
  return {
    execute: executeLoginUseCase(authRepository),
  };
};

// Export the type for dependency injection
export type LoginUseCase = ReturnType<typeof createLoginUseCase>;
