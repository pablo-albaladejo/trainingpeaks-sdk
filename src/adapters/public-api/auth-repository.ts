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
import { Session, SessionStorage } from '@/application';
import {
  AuthRepository,
  AuthRepositoryLogin,
  AuthRepositoryLogout,
  Credentials,
  isTokenExpired,
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

const createLogin = (deps: AuthRepositoryDependencies): AuthRepositoryLogin => {
  return async (credentials: Credentials) => {
    // Validate credentials using domain logic
    if (!validateCredentials(credentials)) {
      const errorContext: ErrorRequestContext = {
        url: API_ENDPOINTS.LOGIN_PAGE,
        method: 'POST',
        requestData: { username: credentials.username },
      };
      throwValidationError('Invalid credentials provided', errorContext);
    }

    // Get login page to extract request verification token
    const response = await getLoginPage(deps.httpClient);

    if (!response.success) {
      const errorContext: ErrorRequestContext = {
        url: API_ENDPOINTS.LOGIN_PAGE,
        method: 'GET',
      };
      throwHttpErrorFromResponse(response, 'Get request verification token', errorContext);
    }

    if (!response.data) {
      const errorContext: ErrorRequestContext = {
        url: API_ENDPOINTS.LOGIN_PAGE,
        method: 'GET',
      };
      throwMissingDataError('No response data received from login page', errorContext);
    }

    const requestVerificationToken = getRequestVerificationToken(response.data);

    if (!requestVerificationToken) {
      const errorContext: ErrorRequestContext = {
        url: API_ENDPOINTS.LOGIN_PAGE,
        method: 'GET',
      };
      throwValidationError('Request verification token not found', errorContext);
    }

    // Submit login form
    const submitLoginResponse = await submitLogin(
      deps.httpClient,
      requestVerificationToken,
      credentials
    );

    if (!submitLoginResponse.success) {
      const errorContext: ErrorRequestContext = {
        url: API_ENDPOINTS.LOGIN_PAGE,
        method: 'POST',
        requestData: { username: credentials.username },
      };
      throwHttpErrorFromResponse(submitLoginResponse, 'Submit login', errorContext);
    }

    const tpAuthCookie = submitLoginResponse.cookies?.find((cookie) =>
      cookie.includes('Production_tpAuth')
    );

    if (!tpAuthCookie) {
      const errorContext: ErrorRequestContext = {
        url: API_ENDPOINTS.LOGIN_PAGE,
        method: 'POST',
        requestData: { username: credentials.username },
      };
      throwCookieNotFoundError('Production_tpAuth', errorContext);
    }

    // Get the auth token using the cookies
    const authTokenResponse = await getAuthToken(deps.httpClient, tpAuthCookie);

    if (!authTokenResponse.success) {
      const errorContext: ErrorRequestContext = {
        url: API_ENDPOINTS.TOKEN,
        method: 'GET',
      };
      throwHttpErrorFromResponse(authTokenResponse, 'Get auth token', errorContext);
    }

    if (!authTokenResponse.data) {
      const errorContext: ErrorRequestContext = {
        url: API_ENDPOINTS.TOKEN,
        method: 'GET',
      };
      throwMissingDataError('No auth token data received', errorContext);
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
      const errorContext: ErrorRequestContext = {
        url: API_ENDPOINTS.USER_PROFILE,
        method: 'GET',
      };
      throwHttpErrorFromResponse(userResponse, 'Get user information', errorContext);
    }

    if (!userResponse.data) {
      const errorContext: ErrorRequestContext = {
        url: API_ENDPOINTS.USER_PROFILE,
        method: 'GET',
      };
      throwMissingDataError('No user data received', errorContext);
    }

    const userData = userResponse.data as UserProfileEndpointResponse;

    // Map TrainingPeaks API responses to domain entities using mappers
    const user = mapTPUserToUser(userData.user);
    const token = mapTPTokenToAuthToken(authToken);

    // Validate token expiration using domain logic
    if (isTokenExpired(token)) {
      const errorContext: ErrorRequestContext = {
        url: API_ENDPOINTS.TOKEN,
        method: 'GET',
      };
      throwTokenExpiredError(errorContext);
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
        error: error instanceof Error ? error.message : String(error),
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
