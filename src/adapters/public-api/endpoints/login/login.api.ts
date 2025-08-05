/**
 * Login Endpoint API
 * HTTP client functions for login-related operations
 */

import type { HttpClient } from '@/adapters/http';
import type { HttpResponse } from '@/application';
import type { Credentials } from '@/domain';

import { API_BASE_URLS, API_ENDPOINTS } from '../../constants/api-urls';

// Login-specific API constants
export const LOGIN_API_BASE_URL = API_BASE_URLS.LOGIN;

export const LOGIN_FORM_HEADERS = {
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
} as const;

/**
 * GET /login - Get login page (to extract request verification token)
 */
export const getLoginPage = async (
  httpClient: HttpClient
): Promise<HttpResponse<string>> => {
  return await httpClient.get<string>(API_ENDPOINTS.LOGIN_PAGE, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
};

/**
 * POST /login - Submit login form
 */
export const submitLogin = async (
  httpClient: HttpClient,
  requestVerificationToken: string,
  credentials: Credentials
): Promise<HttpResponse<string>> => {
  const formData = new URLSearchParams({
    Username: credentials.username,
    __RequestVerificationToken: requestVerificationToken,
    Password: credentials.password,
  });

  return await httpClient.post<string>(
    API_ENDPOINTS.LOGIN_PAGE,
    formData.toString(),
    {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        ...LOGIN_FORM_HEADERS,
      },
    }
  );
};

/**
 * Extract request verification token from HTML content
 */
export const getRequestVerificationToken = (html: string): string | null => {
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
