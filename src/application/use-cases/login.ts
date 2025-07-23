/**
 * Login Use Case
 * Handles user authentication workflow
 */

import type {
  GetCurrentUserService,
  LoginService,
} from '@/application/services/auth-service';
import type { Credentials, User } from '@/domain';

export type LoginRequest = {
  credentials: Credentials;
};

export type LoginResponse = {
  success: boolean;
  user?: User;
  error?: string;
};

export type ExecuteLoginUseCase = (
  loginService: LoginService,
  getCurrentUserService: GetCurrentUserService
) => (request: LoginRequest) => Promise<LoginResponse>;

/**
 * Login use case implementation
 * Pure orchestration using contracts only
 */
export const executeLoginUseCase: ExecuteLoginUseCase =
  (loginService: LoginService, getCurrentUserService: GetCurrentUserService) =>
  async (request: LoginRequest): Promise<LoginResponse> => {
    try {
      // Authenticate user using login service
      const authResult = await loginService(request.credentials);

      // Get current user information
      const user = await getCurrentUserService();

      if (!user) {
        return {
          success: false,
          error: 'Failed to retrieve user information',
        };
      }

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  };
