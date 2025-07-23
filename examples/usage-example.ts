/**
 * Usage Example
 * Demonstrates how ports are used in practice
 */

import { executeGetUserUseCase } from '@/application/use-cases/get-user';
import { executeLoginUseCase } from '@/application/use-cases/login';
import { createCredentials } from '@/domain/value-objects/credentials';
import { createAuthService } from '@/adapters/services/auth-service';
import { createAuthRepository } from '@/adapters/repositories/auth-repository';
import { createWorkoutRepository } from '@/adapters/repositories/workout-repository';
import { 
  authenticateUser as apiAuthUser,
  canHandleAuthConfig as apiCanHandle,
  refreshAuthToken as apiRefreshToken
} from '@/adapters/http/auth-adapter';
import {
  authenticateUser as webAuthUser,
  canHandleAuthConfig as webCanHandle,
} from '@/adapters/http/browser-auth-adapter';
import {
  storeToken,
  getToken,
  storeUser,
  getUser,
  getUserId,
  hasValidAuth,
  clearStorage,
} from '@/adapters/storage/memory-storage-adapter';

/**
 * Example: How to use the login use case
 */
export const exampleLogin = async () => {
  // 1. Create credentials
  const credentials = createCredentials('username', 'password');

  // 2. Create auth service with adapters
  const authService = createAuthService({
    authAdapters: [
      {
        canHandle: apiCanHandle,
        authenticate: apiAuthUser,
        refresh: apiRefreshToken,
      },
      {
        canHandle: webCanHandle,
        authenticate: webAuthUser,
      },
    ],
    storage: {
      storeToken,
      getToken,
      storeUser,
      getUser,
      getUserId,
      hasValidAuth,
      clearStorage,
    },
  });

  // 3. Create wrapper functions that match the expected service types
  const loginServiceWrapper = async (credentials: any) => {
    return await authService.login(credentials, {
      baseUrl: 'https://api.trainingpeaks.com',
      timeout: 30000,
    });
  };

  // 4. Execute login use case with injected services
  const loginUseCase = executeLoginUseCase(
    loginServiceWrapper,
    authService.getCurrentUser
  );
  const loginResult = await loginUseCase({ credentials });

  if (loginResult.success) {
    console.log('Login successful:', loginResult.user);
  } else {
    console.error('Login failed:', loginResult.error);
  }
};

/**
 * Example: How to use the get user use case
 */
export const exampleGetUser = async () => {
  // Create auth service
  const authService = createAuthService({
    authAdapters: [
      {
        canHandle: apiCanHandle,
        authenticate: apiAuthUser,
        refresh: apiRefreshToken,
      },
      {
        canHandle: webCanHandle,
        authenticate: webAuthUser,
      },
    ],
    storage: {
      storeToken,
      getToken,
      storeUser,
      getUser,
      getUserId,
      hasValidAuth,
      clearStorage,
    },
  });

  // Execute get user use case with injected service
  const getUserUseCase = executeGetUserUseCase(authService.getCurrentUser);
  const userResult = await getUserUseCase();

  if (userResult.success) {
    console.log('Current user:', userResult.user);
  } else {
    console.error('Failed to get user:', userResult.error);
  }
};

/**
 * Example: Direct usage of ports (for advanced scenarios)
 */
export const exampleDirectPortUsage = async () => {
  // Import ports directly
  const { authenticateUser } = await import(
    '@/adapters/http/auth-adapter'
  );
  const { storeToken, getUser } = await import(
    '@/adapters/storage/memory-storage-adapter'
  );

  // Use ports directly
  const credentials = createCredentials('username', 'password');

  // Authenticate using auth port
  const authResult = await authenticateUser(credentials, {
    baseUrl: 'https://api.trainingpeaks.com',
    timeout: 30000,
  });

  // Store token using storage port
  await storeToken(authResult.token);

  // Get user using storage port
  const user = await getUser();

  console.log('Direct port usage result:', { authResult, user });
};

/**
 * Example: How ports enable easy testing
 */
export const exampleTestingWithPorts = () => {
  // Mock implementations of services for testing
  const mockLoginService = async (credentials: any) => ({
    token: {
      accessToken: 'mock-token',
      tokenType: 'Bearer',
      expiresAt: new Date(),
    },
    user: { id: '1', name: 'Test User' },
  });

  const mockGetCurrentUserService = async () => ({
    id: '1',
    name: 'Test User',
  });

  // Use the same use case with mock implementations
  const loginUseCase = executeLoginUseCase(
    mockLoginService,
    mockGetCurrentUserService
  );

  // The use case works exactly the same with mocks!
  return loginUseCase({ credentials: createCredentials('test', 'test') });
};

/**
 * Example: How ports enable different implementations
 */
export const exampleDifferentImplementations = async () => {
  // You can easily swap implementations
  const implementations = {
    // API-based authentication
    api: {
      authenticateUser: (await import('@/adapters/http/auth-adapter'))
        .authenticateUser,
      storeToken: (await import('@/adapters/storage/memory-storage-adapter'))
        .storeToken,
    },

    // Web-based authentication (if implemented)
    web: {
      authenticateUser: (
        await import('@/adapters/http/browser-auth-adapter')
      ).authenticateUser,
      storeToken: (await import('@/adapters/storage/memory-storage-adapter'))
        .storeToken,
    },

    // File-based storage (if implemented)
    file: {
      authenticateUser: (await import('@/adapters/http/auth-adapter'))
        .authenticateUser,
      storeToken: (await import('@/adapters/storage/memory-storage-adapter'))
        .storeToken,
    },
  };

  // Choose implementation based on configuration
  const config = { storage: 'memory', auth: 'api' };
  const authImpl = implementations[config.auth as keyof typeof implementations];
  const storageImpl =
    implementations[config.storage as keyof typeof implementations];

  // Create service functions that use the port implementations
  const loginService = async (credentials: any) => {
    const authResult = await authImpl.authenticateUser(credentials, {
      baseUrl: 'https://api.trainingpeaks.com',
      timeout: 30000,
    });
    await storageImpl.storeToken(authResult.token);
    return authResult;
  };

  const getCurrentUserService = async () => {
    // This would typically get user from storage
    return { id: '1', name: 'User' };
  };

  // Use the same use case with different implementations
  const loginUseCase = executeLoginUseCase(loginService, getCurrentUserService);

  return loginUseCase({ credentials: createCredentials('user', 'pass') });
};
