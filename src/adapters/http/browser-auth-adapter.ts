/**
 * Browser Authentication Adapter
 * Implements authentication using Playwright browser automation
 */

import type {
  AuthenticateUser,
  AuthenticationConfig,
  CanHandleAuthConfig,
  RefreshAuthToken,
} from '@/application/services/auth-service';
import { getSDKConfig } from '@/config';
import type { AuthToken, Credentials, User } from '@/domain';
import { createUser } from '@/domain/entities/user';
import { createAuthToken } from '@/domain/value-objects/auth-token';
import { Browser, chromium, Page, Response } from 'playwright-core';

type InterceptedData = {
  token?: AuthToken;
  userId?: string;
};

type TokenResponse = {
  token?: {
    access_token: string;
    refresh_token?: string;
  };
};

type UserResponse = {
  user?: {
    userId: string | number;
  };
};

const sdkConfig = getSDKConfig();

/**
 * Check if this adapter can handle the given configuration
 */
export const canHandleAuthConfig: CanHandleAuthConfig = (
  config: AuthenticationConfig
): boolean => {
  // This adapter handles web-based authentication
  return !!config.webAuth;
};

/**
 * Authenticate user using web browser automation
 */
export const authenticateUser: AuthenticateUser = async (
  credentials: Credentials,
  config: AuthenticationConfig
): Promise<{ token: AuthToken; user: User }> => {
  let browser: Browser | null = null;

  try {
    browser = await launchBrowser(config);
    const page = await setupPage(browser, config);

    const interceptedData = await performLogin(page, credentials, config);

    if (!interceptedData.token || !interceptedData.userId) {
      throw new Error('Failed to retrieve authentication data from login flow');
    }

    // Create user from intercepted data
    const user = createUser(
      String(interceptedData.userId),
      credentials.username,
      credentials.username, // Use username as name for now
      undefined // No preferences data available in interceptedData
    );

    return {
      token: interceptedData.token,
      user,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Web authentication failed: ${message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * Refresh authentication token (not supported for web authentication)
 */
export const refreshAuthToken: RefreshAuthToken = async (
  refreshToken: string,
  config: AuthenticationConfig
): Promise<AuthToken> => {
  void refreshToken;
  void config;
  // Web-based refresh is not supported with current TrainingPeaks implementation
  throw new Error('Token refresh not supported for web authentication');
};

/**
 * Launch browser instance
 */
const launchBrowser = async (
  config: AuthenticationConfig
): Promise<Browser> => {
  return await chromium.launch({
    headless: config.webAuth?.headless,
    executablePath: config.webAuth?.executablePath || undefined,
    timeout: sdkConfig.browser.launchTimeout,
  });
};

/**
 * Setup browser page with context
 */
const setupPage = async (
  browser: Browser,
  config: AuthenticationConfig
): Promise<Page> => {
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  page.on('console', (msg) => {
    console.debug('Browser console:', msg.text());
  });

  return page;
};

/**
 * Perform login flow
 */
const performLogin = async (
  page: Page,
  credentials: Credentials,
  config: AuthenticationConfig
): Promise<InterceptedData> => {
  const interceptedData: InterceptedData = {};

  // Set up response listeners
  setupAuthResponseListeners(page, interceptedData, config);

  // Navigate to login page
  const loginUrl = sdkConfig.urls.loginUrl;

  console.info('Navigating to TrainingPeaks login page:', loginUrl);

  await page.goto(loginUrl, {
    waitUntil: 'networkidle',
    timeout: config.webAuth?.timeout,
  });

  // Handle cookies
  await handleCookies(page, config);

  // Fill credentials
  await fillCredentials(page, credentials, config);

  // Submit form
  await submitLoginForm(page, config);

  // Wait for authentication
  await waitForAuthentication(page, config);

  return interceptedData;
};

/**
 * Setup response listeners for authentication data
 */
const setupAuthResponseListeners = (
  page: Page,
  interceptedData: InterceptedData,
  config: AuthenticationConfig
): void => {
  page.on('response', async (response) => {
    const url = response.url();

    if (url.includes('/api/') || url.includes('/users/')) {
      console.debug('API Response:', { status: response.status(), url });
    }

    if (url.includes('/users/v3/token')) {
      await handleTokenResponse(response, interceptedData, config);
    } else if (url.includes('/users/v3/user')) {
      await handleUserResponse(response, interceptedData, config);
    }
  });
};

/**
 * Handle cookie consent
 */
const handleCookies = async (
  page: Page,
  config: AuthenticationConfig
): Promise<void> => {
  try {
    await page.waitForSelector('#onetrust-accept-btn-handler', {
      state: 'visible',
      timeout: sdkConfig.timeouts.elementWait,
    });
    await page.click('#onetrust-accept-btn-handler');

    console.debug('Accepted cookies');
  } catch {
    console.debug('No cookies banner found, continuing...');
  }
};

/**
 * Fill login credentials
 */
const fillCredentials = async (
  page: Page,
  credentials: Credentials,
  config: AuthenticationConfig
): Promise<void> => {
  console.debug('Entering credentials');

  try {
    // Wait for username field with longer timeout and better error handling
    await page.waitForSelector('[data-cy="username"]', {
      state: 'visible',
      timeout: config.webAuth?.timeout,
    });
    await page.fill('[data-cy="username"]', credentials.username);
    console.debug('Username filled successfully');

    // Wait for password field - try multiple selectors
    const passwordSelectors = [
      '[data-cy="password"]',
      '#Password',
      'input[name="Password"]',
      'input[type="password"]',
    ];

    let passwordField = null;
    for (const selector of passwordSelectors) {
      try {
        passwordField = await page.waitForSelector(selector, {
          state: 'visible',
          timeout: 5000, // Shorter timeout for each selector
        });
        if (passwordField) {
          await page.fill(selector, credentials.password);
          console.debug(
            `Password filled successfully using selector: ${selector}`
          );
          break;
        }
      } catch (error) {
        console.debug(
          `Password selector ${selector} not found, trying next...`
        );
        continue;
      }
    }

    if (!passwordField) {
      throw new Error(
        'Password field not found. Tried selectors: ' +
          passwordSelectors.join(', ')
      );
    }
  } catch (error) {
    console.error('Failed to fill credentials', {
      error: (error as Error).message,
    });
    throw new Error(`Failed to fill login form: ${(error as Error).message}`);
  }
};

/**
 * Submit login form
 */
const submitLoginForm = async (
  page: Page,
  config: AuthenticationConfig
): Promise<void> => {
  console.debug('Submitting login form');

  try {
    // Try multiple submit button selectors
    const submitSelectors = [
      '#btnSubmit',
      'button[type="submit"]',
      'input[type="submit"]',
      '[data-cy="submit"]',
      'button:has-text("Sign In")',
      'button:has-text("Login")',
    ];

    let submitButton = null;
    for (const selector of submitSelectors) {
      try {
        submitButton = await page.waitForSelector(selector, {
          state: 'visible',
          timeout: 5000,
        });
        if (submitButton) {
          await page.click(selector);
          console.debug(`Submit button clicked using selector: ${selector}`);
          break;
        }
      } catch (error) {
        console.debug(`Submit selector ${selector} not found, trying next...`);
        continue;
      }
    }

    if (!submitButton) {
      throw new Error(
        'Submit button not found. Tried selectors: ' +
          submitSelectors.join(', ')
      );
    }

    await page.waitForLoadState('networkidle', {
      timeout: config.webAuth?.timeout,
    });

    // Check for error messages
    await checkForLoginErrors(page);
  } catch (error) {
    console.error('Failed to submit login form', {
      error: (error as Error).message,
    });
    throw new Error(`Failed to submit login form: ${(error as Error).message}`);
  }
};

/**
 * Check for login error messages
 */
const checkForLoginErrors = async (page: Page): Promise<void> => {
  try {
    const errorSelector =
      '[data-cy="invalid_credentials_message"], .error-message, .alert-danger';
    const errorElement = await page.waitForSelector(errorSelector, {
      state: 'visible',
      timeout: sdkConfig.timeouts.elementWait,
    });

    if (errorElement) {
      const errorText = await errorElement.textContent();
      throw new Error(`Login failed: ${errorText || 'Invalid credentials'}`);
    }
  } catch {
    // No error message found, continue
  }
};

/**
 * Wait for authentication to complete
 */
const waitForAuthentication = async (
  page: Page,
  config: AuthenticationConfig
): Promise<void> => {
  const appUrl = sdkConfig.urls.appUrl;
  const appUrlPattern = appUrl + '/**';

  console.debug('Waiting for app URL pattern:', appUrlPattern);

  await page.waitForURL(appUrlPattern, {
    timeout: config.webAuth?.timeout,
  });

  // Give time for API calls to complete
  await page.waitForTimeout(sdkConfig.browser.pageWaitTimeout);

  console.info('Successfully authenticated with TrainingPeaks');
};

/**
 * Handle token response from API
 */
const handleTokenResponse = async (
  response: Response,
  interceptedData: InterceptedData,
  config: AuthenticationConfig
): Promise<void> => {
  try {
    if (!response.ok()) {
      if (config.debug) {
        console.warn('Token response failed', {
          status: response.status(),
          url: response.url(),
        });
      }
      return;
    }

    const json = await parseJsonResponse<TokenResponse>(response, config);
    if (!json?.token?.access_token) {
      return;
    }

    // Create AuthToken entity
    interceptedData.token = createAuthToken(
      json.token.access_token,
      'Bearer',
      new Date(Date.now() + sdkConfig.tokens.defaultExpiration),
      json.token.refresh_token
    );

    console.info('Successfully intercepted auth token');
  } catch (error) {
    console.error('Error processing token response', { error });
  }
};

/**
 * Handle user response from API
 */
const handleUserResponse = async (
  response: Response,
  interceptedData: InterceptedData,
  config: AuthenticationConfig
): Promise<void> => {
  try {
    if (!response.ok()) {
      if (config.debug) {
        console.warn('User response failed', {
          status: response.status(),
          url: response.url(),
        });
      }
      return;
    }

    const json = await parseJsonResponse<UserResponse>(response, config);
    if (!json?.user?.userId) {
      return;
    }

    // Store user ID as string
    interceptedData.userId = String(json.user.userId);

    console.info('Successfully intercepted user ID');
  } catch (error) {
    console.error('Error processing user response', { error });
  }
};

/**
 * Parse JSON response safely
 */
const parseJsonResponse = async <T = unknown>(
  response: Response,
  config: AuthenticationConfig
): Promise<T | null> => {
  try {
    return await response.json();
  } catch (error) {
    if (config.debug) {
      const text = await response.text().catch(() => '');
      console.warn('Failed to parse response as JSON', {
        url: response.url(),
        status: response.status(),
        text: text.substring(0, 200),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    return null;
  }
};
