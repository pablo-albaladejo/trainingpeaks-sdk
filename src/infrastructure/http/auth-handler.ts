/**
 * HTTP Auth Handler
 * Handles HTTP authentication requests
 */

import type { AuthRepository } from '@/application/ports/auth';
import type { StoragePort } from '@/application/ports/storage';
import {
  getCurrentToken,
  getCurrentUser,
  getUserId,
  isAuthenticated,
  login,
  logout,
} from '@/infrastructure/services/auth-application';
import {
  getTimeUntilExpiration,
  getTimeUntilRefresh,
  isTokenExpired,
  isTokenValid,
  shouldRefreshToken,
} from '@/infrastructure/services/auth-validation';

export const createAuthHandler = (
  authRepository: AuthRepository,
  storagePort: StoragePort
) => {
  // Create service functions with dependencies
  const authApplicationService = {
    login: login(authRepository),
    logout: logout(authRepository),
    getCurrentUser: getCurrentUser(authRepository),
    isAuthenticated: isAuthenticated(authRepository),
    getCurrentToken: getCurrentToken(authRepository),
    getUserId: getUserId(authRepository),
  };

  const authValidationService = {
    shouldRefreshToken: shouldRefreshToken,
    isTokenValid: isTokenValid,
    isTokenExpired: isTokenExpired,
    getTimeUntilExpiration: getTimeUntilExpiration,
    getTimeUntilRefresh: getTimeUntilRefresh,
  };

  return {
    authApplicationService,
    authValidationService,
  };
};

/**
 * Example of how to use the handler in a real application
 */
export const exampleUsage = () => {
  // This would be called at the application bootstrap/main entry point
  // Create infrastructure dependencies (repositories, logger, etc.)
  // const authRepository = createAuthRepository();
  // const logger = createLogger();
  // Create handler with dependencies
  // const authHandler = createAuthHandler({
  //   authRepository,
  //   logger,
  // });
  // Use handler in HTTP framework (Express, Koa, etc.)
  // app.post('/auth/login', authHandler.login);
  // app.post('/auth/logout', authHandler.logout);
  // app.get('/auth/me', authHandler.getCurrentUser);
  // app.get('/auth/status', authHandler.getAuthStatus);
};
