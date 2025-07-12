/**
 * Login Use Case
 * Handles user authentication process
 */

import {
  AuthDomainService,
  AuthRepository,
  AuthToken,
  Credentials,
  User,
} from '../../domain/index.js';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: AuthToken;
  user: User;
}

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  public async execute(request: LoginRequest): Promise<LoginResponse> {
    // Create credentials value object
    const credentials = Credentials.create(request.username, request.password);

    // Apply domain validation
    AuthDomainService.validateCredentialsForAuth(credentials);

    // Authenticate through repository
    const token = await this.authRepository.authenticate(credentials);

    // Store the token
    await this.authRepository.storeToken(token);

    // Get user information
    const user = await this.authRepository.getCurrentUser();
    if (!user) {
      throw new Error(
        'Failed to retrieve user information after authentication'
      );
    }

    // Store user information
    await this.authRepository.storeUser(user);

    return {
      token,
      user,
    };
  }
}
