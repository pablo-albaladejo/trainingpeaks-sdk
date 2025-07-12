/**
 * Get Current User Use Case
 * Retrieves current authenticated user information
 */

import { AuthDomainService, AuthRepository, User } from '../../domain';

export class GetCurrentUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  public async execute(): Promise<User> {
    // Verify authentication is active
    const currentToken = this.authRepository.getCurrentToken();

    if (!AuthDomainService.isSessionActive(currentToken)) {
      throw new Error('No active authentication session');
    }

    // Get current user
    const user = await this.authRepository.getCurrentUser();

    if (!user) {
      throw new Error('No authenticated user found');
    }

    return user;
  }
}
