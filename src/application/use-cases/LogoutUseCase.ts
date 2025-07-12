/**
 * Logout Use Case
 * Handles user logout process
 */

import { AuthRepository } from '../../domain/index.js';

export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  public async execute(): Promise<void> {
    // Clear all authentication data
    await this.authRepository.clearAuth();
  }
}
