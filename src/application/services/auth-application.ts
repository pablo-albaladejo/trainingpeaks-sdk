/**
 * Authentication Application Service
 * Orchestrates authentication use cases and provides a unified interface
 */

import { AuthRepository, AuthToken, User } from '../../domain';
import { GetCurrentUserUseCase } from '../use-cases/get-current-user';
import { LoginRequest, LoginResponse, LoginUseCase } from '../use-cases/login';
import { LogoutUseCase } from '../use-cases/logout';

export class AuthApplicationService {
  private readonly loginUseCase: LoginUseCase;
  private readonly logoutUseCase: LogoutUseCase;
  private readonly getCurrentUserUseCase: GetCurrentUserUseCase;

  constructor(private readonly authRepository: AuthRepository) {
    this.loginUseCase = new LoginUseCase(authRepository);
    this.logoutUseCase = new LogoutUseCase(authRepository);
    this.getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);
  }

  /**
   * Authenticate user with credentials
   */
  public async login(request: LoginRequest): Promise<LoginResponse> {
    return await this.loginUseCase.execute(request);
  }

  /**
   * Logout current user
   */
  public async logout(): Promise<void> {
    await this.logoutUseCase.execute();
  }

  /**
   * Get current authenticated user
   */
  public async getCurrentUser(): Promise<User> {
    return await this.getCurrentUserUseCase.execute();
  }

  /**
   * Check if user is currently authenticated
   */
  public isAuthenticated(): boolean {
    return this.authRepository.isAuthenticated();
  }

  /**
   * Get current authentication token
   */
  public getCurrentToken(): AuthToken | null {
    return this.authRepository.getCurrentToken();
  }

  /**
   * Get current user ID
   */
  public getUserId(): string | null {
    return this.authRepository.getUserId();
  }
}
