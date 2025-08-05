import { Logger } from '@/adapters';
import {
  createHttpError,
  type HttpErrorResponse,
  isHttpError,
} from '@/adapters/errors/http-errors';
import { type HttpClient } from '@/adapters/http';
import { mapTPTokenToAuthToken, mapTPUserToUser } from '@/adapters/mappers';
import { HttpResponse, Session, SessionStorage } from '@/application';
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

/**
 * Helper function to throw structured HttpError based on HttpResponse
 */
const throwHttpError = <T>(
  response: HttpResponse<T>,
  operation: string
): never => {
  if (response.error && isHttpError(response.error)) {
    // Re-throw the existing HttpError
    throw response.error;
  }

  // Create structured HttpError for non-HTTP errors
  const errorMessage = response.error
    ? String(response.error)
    : `${operation} failed`;
  const httpErrorResponse: HttpErrorResponse = {
    status: 0,
    statusText: 'Unknown Error',
    data: { message: errorMessage },
  };

  throw createHttpError(httpErrorResponse, {
    url: 'unknown',
    method: 'GET',
  });
};

type AuthRepositoryDependencies = {
  httpClient: HttpClient;
  sessionStorage: SessionStorage;
  logger: Logger;
};

const createLogin = (deps: AuthRepositoryDependencies): AuthRepositoryLogin => {
  return async (credentials: Credentials) => {
    // Validate credentials using domain logic
    if (!validateCredentials(credentials)) {
      const httpErrorResponse: HttpErrorResponse = {
        status: 400,
        statusText: 'Bad Request',
        data: { message: 'Invalid credentials provided' },
      };
      throw createHttpError(httpErrorResponse, {
        url: API_ENDPOINTS.LOGIN_PAGE,
        method: 'POST',
        requestData: { username: credentials.username },
      });
    }

    // Get login page to extract request verification token
    const response = await getLoginPage(deps.httpClient);

    if (!response.success) {
      throwHttpError(response, 'Get request verification token');
    }

    if (!response.data) {
      const httpErrorResponse: HttpErrorResponse = {
        status: 502,
        statusText: 'Bad Gateway',
        data: { message: 'No response data received from login page' },
      };
      throw createHttpError(httpErrorResponse, {
        url: API_ENDPOINTS.LOGIN_PAGE,
        method: 'GET',
      });
    }

    const requestVerificationToken = getRequestVerificationToken(response.data);

    if (!requestVerificationToken) {
      const httpErrorResponse: HttpErrorResponse = {
        status: 400,
        statusText: 'Bad Request',
        data: { message: 'Request verification token not found' },
      };
      throw createHttpError(httpErrorResponse, {
        url: API_ENDPOINTS.LOGIN_PAGE,
        method: 'GET',
      });
    }

    // Submit login form
    const submitLoginResponse = await submitLogin(
      deps.httpClient,
      requestVerificationToken,
      credentials
    );

    if (!submitLoginResponse.success) {
      throwHttpError(submitLoginResponse, 'Submit login');
    }

    const tpAuthCookie = submitLoginResponse.cookies?.find((cookie) =>
      cookie.includes('Production_tpAuth')
    );

    if (!tpAuthCookie) {
      const httpErrorResponse: HttpErrorResponse = {
        status: 401,
        statusText: 'Unauthorized',
        data: { message: 'TP Auth cookie not found' },
      };
      throw createHttpError(httpErrorResponse, {
        url: API_ENDPOINTS.LOGIN_PAGE,
        method: 'POST',
        requestData: { username: credentials.username },
      });
    }

    // Get the auth token using the cookies
    const authTokenResponse = await getAuthToken(deps.httpClient, tpAuthCookie);

    if (!authTokenResponse.success) {
      throwHttpError(authTokenResponse, 'Get auth token');
    }

    if (!authTokenResponse.data) {
      const httpErrorResponse: HttpErrorResponse = {
        status: 502,
        statusText: 'Bad Gateway',
        data: { message: 'No auth token data received' },
      };
      throw createHttpError(httpErrorResponse, {
        url: API_ENDPOINTS.TOKEN,
        method: 'GET',
      });
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
      throwHttpError(userResponse, 'Get user information');
    }

    if (!userResponse.data) {
      const httpErrorResponse: HttpErrorResponse = {
        status: 502,
        statusText: 'Bad Gateway',
        data: { message: 'No user data received' },
      };
      throw createHttpError(httpErrorResponse, {
        url: API_ENDPOINTS.USER_PROFILE,
        method: 'GET',
      });
    }

    const userData = userResponse.data as UserProfileEndpointResponse;

    // Map TrainingPeaks API responses to domain entities using mappers
    const user = mapTPUserToUser(userData.user);
    const token = mapTPTokenToAuthToken(authToken);

    // Validate token expiration using domain logic
    if (isTokenExpired(token)) {
      const httpErrorResponse: HttpErrorResponse = {
        status: 401,
        statusText: 'Unauthorized',
        data: { message: 'Received expired token from TrainingPeaks API' },
      };
      throw createHttpError(httpErrorResponse, {
        url: API_ENDPOINTS.TOKEN,
        method: 'GET',
      });
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
    await deps.sessionStorage.clear();
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
