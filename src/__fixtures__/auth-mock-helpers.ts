/**
 * Shared mock helpers for authentication tests
 */

import type { HttpResponse } from '@/application/ports/http-client';

import { notFoundErrorBuilder } from './http-errors.fixture';

/**
 * Deep merge utility for safely combining nested objects
 */
function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    if (sourceValue !== undefined) {
      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue)
      ) {
        result[key] = deepMerge(result[key] || ({} as any), sourceValue);
      } else {
        result[key] = sourceValue;
      }
    }
  }

  return result;
}

/**
 * Extracts the pathname from a URL string
 */
function getUrlPath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    // Fallback for relative URLs
    return url.split('?')[0] || '';
  }
}

/**
 * Default mock responses for auth tests
 */
export const defaultMockResponses = {
  loginPage: `<input name="__RequestVerificationToken" value="test-token" />`,
  token: {
    token: {
      access_token: 'access-token-123',
      token_type: 'Bearer',
      expires_in: 3600,
      expires: new Date(Date.now() + 3_600_000).toISOString(),
      refresh_token: 'refresh-token-123',
      scope: 'read write',
    },
  },
  user: {
    user: {
      userId: '123',
      userName: 'testuser',
      fullName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      personPhotoUrl: 'https://example.com/photo.jpg',
      preferences: { theme: 'light' },
    },
  },
};

/**
 * Creates a mock GET implementation for authentication flows with proper typing
 */
export function createMockAuthGet(
  customResponses: {
    loginPage?: string;
    token?: typeof defaultMockResponses.token;
    user?: typeof defaultMockResponses.user;
  } = {}
) {
  const responses = deepMerge(defaultMockResponses, customResponses);

  return function mockAuthGet<T>(url: string): Promise<HttpResponse<T>> {
    const path = getUrlPath(url);

    if (path.endsWith('/login') || path.includes('/login/')) {
      const loginResponse: HttpResponse<string> = {
        success: true,
        data: responses.loginPage,
      };
      return Promise.resolve(loginResponse as HttpResponse<T>);
    }

    if (path.endsWith('/token') || path.includes('/oauth/token')) {
      const tokenResponse: HttpResponse<typeof responses.token> = {
        success: true,
        data: responses.token,
      };
      return Promise.resolve(tokenResponse as HttpResponse<T>);
    }

    if (path.endsWith('/user') || path.startsWith('/api/user')) {
      const userResponse: HttpResponse<typeof responses.user> = {
        success: true,
        data: responses.user,
      };
      return Promise.resolve(userResponse as HttpResponse<T>);
    }

    const notFoundResponse: HttpResponse<null> = {
      success: false,
      data: null,
      error: notFoundErrorBuilder.build(),
    };
    return Promise.resolve(notFoundResponse as HttpResponse<T>);
  };
}

/**
 * Creates a mock POST response for authentication
 */
export function createMockAuthPost(): Promise<HttpResponse<void>> {
  return Promise.resolve({
    success: true,
    data: undefined,
    cookies: ['Production_tpAuth=test-cookie-value; Path=/'],
  });
}

/**
 * Creates a mock POST implementation handler for authentication flows
 */
export function createMockAuthPostHandler(): (
  url: string,
  data?: any
) => Promise<HttpResponse<void>> {
  return function mockAuthPost(url: string): Promise<HttpResponse<void>> {
    const path = getUrlPath(url);

    if (path.endsWith('/login') || path.includes('/authenticate')) {
      return Promise.resolve({
        success: true,
        data: undefined,
        cookies: ['Production_tpAuth=test-cookie-value; Path=/'],
      });
    }

    return Promise.resolve({
      success: false,
      data: undefined,
      error: notFoundErrorBuilder.build(),
    });
  };
}
