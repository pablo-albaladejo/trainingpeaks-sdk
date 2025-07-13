/**
 * Login Use Case
 * Handles user authentication and session establishment
 */

import { AuthToken } from '../../domain/entities/auth-token';
import { User } from '../../domain/entities/user';
import { AuthRepository } from '../../domain/repositories/auth';
import { AuthDomainService } from '../../domain/services/auth-domain';
import { Credentials } from '../../domain/value-objects/credentials';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: AuthToken;
  user: User;
}

export class LoginUseCase {
  private readonly authDomainService = new AuthDomainService();

  constructor(private readonly authRepository: AuthRepository) {}

  public async execute(request: LoginRequest): Promise<LoginResponse> {
    // Create credentials from request
    const credentials = Credentials.create(request.username, request.password);

    // Authenticate user
    const authToken = await this.authRepository.authenticate(credentials);

    if (!authToken) {
      throw new Error('Authentication failed');
    }

    // Get the authenticated user
    const user = await this.authRepository.getCurrentUser();

    if (!user) {
      throw new Error('Failed to retrieve user information');
    }

    return {
      token: authToken,
      user: user,
    };
  }
}
