import { Logger } from '@/adapters';
import {
  type ErrorRequestContext,
  throwCookieNotFoundError,
  throwHttpErrorFromResponse,
  throwMissingDataError,
  throwTokenExpiredError,
  throwValidationError,
} from '@/adapters/errors/http-errors';
import { type HttpClient } from '@/adapters/http';
import { mapTPTokenToAuthToken, mapTPUserToUser } from '@/adapters/mappers';
import { type HttpMethod, type SessionStorage } from '@/application';
import {
  AuthRepository,
  AuthRepositoryLogin,
  AuthRepositoryLogout,
  Credentials,
  isTokenExpired,
  Session,
  validateCredentials,
} from '@/domain';

import { API_ENDPOINTS } from './constants/api-urls';
import {
  getAuthToken,
  getLoginPage,
  getRequestVerificationToken,
  getUser,
  submitLogin,
} from './endpoints';
import type { TokenEndpointResponse } from './endpoints/users/v3/token';
import type { UserProfileEndpointResponse } from './endpoints/users/v3/user';

type AuthRepositoryDependencies = {
  httpClient: HttpClient;
  sessionStorage: SessionStorage;
  logger: Logger;
};

const createErrorContext = (
  url: string,
  method: HttpMethod,
  requestData?: Record<string, unknown>
): ErrorRequestContext => ({
  url,
  method,
  ...(requestData && { requestData }),
});

const createLogin = (deps: AuthRepositoryDependencies): AuthRepositoryLogin => {
  return async (credentials: Credentials) => {
    // Validate credentials using domain logic
    if (!validateCredentials(credentials)) {
      throwValidationError(
        'Invalid credentials provided',
        createErrorContext(API_ENDPOINTS.LOGIN_PAGE, 'POST', {
          username: credentials.username,
        })
      );
    }

    // Get login page to extract request verification token
    const response = await getLoginPage(deps.httpClient);

    if (!response.success) {
      throwHttpErrorFromResponse(
        response,
        'Get request verification token',
        createErrorContext(API_ENDPOINTS.LOGIN_PAGE, 'GET')
      );
    }

    if (!response.data) {
      throwMissingDataError(
        'No response data received from login page',
        createErrorContext(API_ENDPOINTS.LOGIN_PAGE, 'GET')
      );
    }

    const requestVerificationToken = getRequestVerificationToken(response.data);

    if (!requestVerificationToken) {
      throwValidationError(
        'Request verification token not found',
        createErrorContext(API_ENDPOINTS.LOGIN_PAGE, 'GET')
      );
    }

    // Submit login form
    const submitLoginResponse = await submitLogin(
      deps.httpClient,
      requestVerificationToken,
      credentials
    );

    if (!submitLoginResponse.success) {
      throwHttpErrorFromResponse(
        submitLoginResponse,
        'Submit login',
        createErrorContext(API_ENDPOINTS.LOGIN_PAGE, 'POST', {
          username: credentials.username,
        })
      );
    }

    const tpAuthCookie = submitLoginResponse.cookies?.find((cookie) =>
      cookie.includes('Production_tpAuth')
    );

    if (!tpAuthCookie) {
      throwCookieNotFoundError(
        'Production_tpAuth',
        createErrorContext(API_ENDPOINTS.LOGIN_PAGE, 'POST', {
          username: credentials.username,
        })
      );
    }

    // Get the auth token using all cookies from the login response
    const authTokenResponse = await getAuthToken(
      deps.httpClient,
      submitLoginResponse.cookies || []
    );

    if (!authTokenResponse.success) {
      throwHttpErrorFromResponse(
        authTokenResponse,
        'Get auth token',
        createErrorContext(API_ENDPOINTS.TOKEN, 'GET')
      );
    }

    if (!authTokenResponse.data) {
      throwMissingDataError(
        'No auth token data received',
        createErrorContext(API_ENDPOINTS.TOKEN, 'GET')
      );
    }

    const authTokenData = authTokenResponse.data as TokenEndpointResponse;
    const authToken = authTokenData.token;

    // Get user information using the auth token
    const userResponse = await getUser(deps.httpClient, {
      accessToken: authToken.access_token,
      tokenType: authToken.token_type,
      expiresIn: authToken.expires_in,
      expires: new Date(authToken.expires),
      refreshToken: authToken.refresh_token,
      scope: authToken.scope,
    });

    if (!userResponse.success) {
      throwHttpErrorFromResponse(
        userResponse,
        'Get user information',
        createErrorContext(API_ENDPOINTS.USER_PROFILE, 'GET')
      );
    }

    if (!userResponse.data) {
      throwMissingDataError(
        'No user data received',
        createErrorContext(API_ENDPOINTS.USER_PROFILE, 'GET')
      );
    }

    const userData = userResponse.data as UserProfileEndpointResponse;

    // Map TrainingPeaks API responses to domain entities using mappers
    const user = mapTPUserToUser(userData.user);
    const token = mapTPTokenToAuthToken(authToken);

    // Validate token expiration using domain logic
    if (isTokenExpired(token)) {
      throwTokenExpiredError(createErrorContext(API_ENDPOINTS.TOKEN, 'GET'));
    }

    const session: Session = {
      token,
      user,
    };

    await deps.sessionStorage.set(session);

    return session;
  };
};

const createLogout = (
  deps: AuthRepositoryDependencies
): AuthRepositoryLogout => {
  return async () => {
    try {
      await deps.sessionStorage.clear();
    } catch (error) {
      // Log the error but don't throw - logout should always succeed
      deps.logger.warn('Failed to clear session storage during logout', {
        error,
      });
    }
  };
};

export const createAuthRepository = (
  deps: AuthRepositoryDependencies
): AuthRepository => {
  return {
    login: createLogin(deps),
    logout: createLogout(deps),
  };
};
