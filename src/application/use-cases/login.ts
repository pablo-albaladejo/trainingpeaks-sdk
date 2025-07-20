/**
 * Login Use Case
 * Handles user authentication and session establishment
 */

import { AuthRepository } from '@/application/ports/auth';
import { AuthToken } from '@/domain/entities/auth-token';
import { User } from '@/domain/entities/user';
import { Credentials } from '@/domain/value-objects/credentials';

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: AuthToken;
  user: User;
};

/**
 * Login Use Case Factory
 * Creates a login use case with dependency injection
 */
export const createLoginUseCase = (authRepository: AuthRepository) => {
  /**
   * Execute login process
   */
  const execute = async (request: LoginRequest): Promise<LoginResponse> => {
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

  return { execute };
};

// Export the type for dependency injection
export type LoginUseCase = ReturnType<typeof createLoginUseCase>;
