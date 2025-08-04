import { Logger } from '@/adapters';
import { type HttpClient } from '@/adapters/http';
import { HttpResponse, Session, SessionStorage } from '@/application';
import {
  AuthRepository,
  AuthRepositoryLogin,
  AuthRepositoryLogout,
  type AuthToken,
  Credentials,
} from '@/domain';
import type {
  TrainingPeaksTokenResponse,
  TrainingPeaksUserResponse,
} from '@/adapters/schemas/http-responses.schema';
import { 
  mapTPUserToUser,
  mapTPTokenToAuthToken 
} from '@/adapters/mappers';

/**
 * Common browser headers used for TrainingPeaks API requests
 */
const BROWSER_HEADERS = {
  'sec-ch-ua':
    '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
} as const;

/**
 * Helper function to extract detailed error information from HttpResponse
 */
const getDetailedErrorMessage = <T>(
  response: HttpResponse<T>,
  operation: string
): string => {
  if (response.error) {
    const error = response.error;
    if ('status' in error && 'statusText' in error) {
      const status = error.status as number;
      const statusText = error.statusText as string;
      return `${operation} failed: HTTP ${status} ${statusText} - ${error.message}`;
    }
    return `${operation} failed: ${error.message}`;
  }
  return `${operation} failed: Unknown error`;
};

type AuthRepositoryDependencies = {
  httpClient: HttpClient;
  sessionStorage: SessionStorage;
  logger: Logger;
};

const submitLogin = async (
  httpClient: HttpClient,
  requestVerificationToken: string,
  credentials: Credentials
) => {
  const formData = new URLSearchParams({
    Username: credentials.username,
    __RequestVerificationToken: requestVerificationToken,
    Password: credentials.password,
  });

  return await httpClient.post<string>(
    'https://home.trainingpeaks.com/login',
    formData.toString(),
    {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'max-age=0',
        'content-type': 'application/x-www-form-urlencoded',
        origin: 'null',
        priority: 'u=0, i',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        ...BROWSER_HEADERS,
      },
    }
  );
};

const getAuthToken = async (
  httpClient: HttpClient,
  cookies: string
): Promise<HttpResponse<TrainingPeaksTokenResponse>> => {
  return await httpClient.get<TrainingPeaksTokenResponse>(
    'https://tpapi.trainingpeaks.com/users/v3/token',
    {
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        origin: 'https://app.trainingpeaks.com',
        priority: 'u=1, i',
        referer: 'https://app.trainingpeaks.com/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        Cookie: cookies,
        ...BROWSER_HEADERS,
      },
    }
  );
};

const getUser = async (
  httpClient: HttpClient,
  authToken: AuthToken
): Promise<HttpResponse<TrainingPeaksUserResponse>> => {
  return await httpClient.get<TrainingPeaksUserResponse>(
    'https://tpapi.trainingpeaks.com/users/v3/user',
    {
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'en-GB,en;q=0.9,es-ES;q=0.8,es;q=0.7,en-US;q=0.6',
        authorization: `Bearer ${authToken.accessToken}`,
        'content-type': 'application/json',
        origin: 'https://app.trainingpeaks.com',
        priority: 'u=1, i',
        referer: 'https://app.trainingpeaks.com/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        ...BROWSER_HEADERS,
      },
    }
  );
};

const getRequestVerificationToken = (html: string): string | null => {
  // Extract all input elements from the form
  const inputMatches = html.match(/<input[^>]+>/g) || [];

  for (const input of inputMatches) {
    // Look for the __RequestVerificationToken input
    const nameMatch = input.match(/name="__RequestVerificationToken"/);
    if (nameMatch) {
      // Extract the value
      const valueMatch = input.match(/value="([^"]*)"/);
      return valueMatch?.[1] || null;
    }
  }

  return null;
};

const createLogin = (deps: AuthRepositoryDependencies): AuthRepositoryLogin => {
  return async (credentials: Credentials) => {
    const response = await deps.httpClient.get<string>(
      'https://home.trainingpeaks.com/login',
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    if (!response.success) {
      throw new Error(
        getDetailedErrorMessage(response, 'Get request verification token')
      );
    }

    if (!response.data) {
      throw new Error('No response data received from login page');
    }

    const requestVerificationToken = getRequestVerificationToken(response.data);

    if (!requestVerificationToken) {
      throw new Error('Request verification token not found');
    }

    const submitLoginResponse = await submitLogin(
      deps.httpClient,
      requestVerificationToken,
      credentials
    );

    if (!submitLoginResponse.success) {
      throw new Error(
        getDetailedErrorMessage(submitLoginResponse, 'Submit login')
      );
    }

    const tpAuthCookie = submitLoginResponse.cookies?.find((cookie) =>
      cookie.includes('Production_tpAuth')
    );

    if (!tpAuthCookie) {
      throw new Error('TP Auth cookie not found');
    }

    // Get the auth token using the cookies
    const authTokenResponse = await getAuthToken(deps.httpClient, tpAuthCookie);

    if (!authTokenResponse.success) {
      throw new Error(
        getDetailedErrorMessage(authTokenResponse, 'Get auth token')
      );
    }

    if (!authTokenResponse.data) {
      throw new Error('No auth token data received');
    }

    const authTokenData = authTokenResponse.data;
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
      throw new Error(
        getDetailedErrorMessage(userResponse, 'Get user information')
      );
    }

    if (!userResponse.data) {
      throw new Error('No user data received');
    }

    const userData = userResponse.data;

    // Map TrainingPeaks API responses to domain entities using mappers
    const user = mapTPUserToUser(userData.user);
    const token = mapTPTokenToAuthToken(authToken);

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
