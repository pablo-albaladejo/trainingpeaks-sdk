/**
 * Get Current User Use Case
 * Retrieves the currently authenticated user
 */

import { User } from '@/domain/entities/user';
import { AuthRepository } from '@/domain/repositories/auth';
import { AuthDomainService } from '@/domain/services/auth-domain';

export class GetCurrentUserUseCase {
  private readonly authDomainService = new AuthDomainService();

  constructor(private readonly authRepository: AuthRepository) {}

  public async execute(): Promise<User> {
    const currentToken = this.authRepository.getCurrentToken();

    if (!currentToken || this.authDomainService.isTokenExpired(currentToken)) {
      throw new Error('No valid authentication token available');
    }

    const currentUser = await this.authRepository.getCurrentUser();
    if (!currentUser) {
      throw new Error('No current user found');
    }

    return currentUser;
  }
}
