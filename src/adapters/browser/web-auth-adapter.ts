/**
 * Web Browser Authentication Adapter
 * Implements authentication using Playwright browser automation
 */

import { createLogger, LoggerType } from '@/adapters/logging/logger';

import { getSDKConfig } from '@/config';
import type { AuthToken, Credentials } from '@/domain';
import { AuthRepository } from '@/domain/repositories/auth-repository';
import { createAuthToken } from '@/domain/value-objects/auth-token';
import { generateCurlCommand, generateRandomUserAgent } from '@/shared';
import { Browser, chromium, Page, Request, Response } from 'playwright-core';

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
 * Log intercepted request with curl command
 */
const logInterceptedRequest = (
  logger: LoggerType,
  request: Request,
  operation: string
): void => {
  const curlCommand = generateCurlCommand({
    method: request.method(),
    url: request.url(),
    headers: request.headers(),
    data: request.postData() || undefined,
  });

  logger.info(`🌐 Web Browser Adapter: Intercepted ${operation} request`, {
    method: request.method(),
    url: request.url(),
    headers: request.headers(),
    postData: request.postData(),
  });

  logger.info(`🌐 Web Browser Adapter: cURL command for ${operation}`, {
    curl: curlCommand,
  });
};

/**
 * Log intercepted response
 */
const logInterceptedResponse = (
  logger: ReturnType<typeof createLogger>,
  response: Response,
  operation: string
): void => {
  logger.info(`🌐 Web Browser Adapter: Intercepted ${operation} response`, {
    status: response.status(),
    statusText: response.statusText(),
    url: response.url(),
    headers: response.headers(),
  });
};

type WebAuthConfig = {
  timeout?: number;
  headless?: boolean;
  executablePath?: string;
};

export const createWebAuthAdapter = (config: WebAuthConfig): AuthRepository => {
  return {
    authenticate: authenticateUser(config),
  };
};

/**
 * Authenticate user using web browser automation
 */
const authenticateUser = (
  config: WebAuthConfig
): ((credentials: Credentials) => Promise<AuthToken>) => {
  return async (credentials: Credentials): Promise<AuthToken> => {
    const logger = createLogger({
      level: sdkConfig.debug.enabled ? 'debug' : 'info',
      enabled: sdkConfig.debug.enabled && sdkConfig.debug.logBrowser,
    });

    logger.info('🌐 Web Browser Adapter: Starting web authentication', {
      username: credentials.username,
      loginUrl: sdkConfig.urls.loginUrl,
      timeout: config.timeout || sdkConfig.timeouts.webAuth,
    });

    let browser: Browser | null = null;

    try {
      logger.debug('🌐 Web Browser Adapter: Launching browser');
      browser = await launchBrowser(config);

      logger.debug('🌐 Web Browser Adapter: Setting up page');
      const page = await setupPage(browser, logger);

      logger.debug('🌐 Web Browser Adapter: Performing login flow');
      const interceptedData = await performLogin(
        page,
        credentials,
        config,
        logger
      );

      if (!interceptedData.token || !interceptedData.userId) {
        logger.error(
          '🌐 Web Browser Adapter: Failed to retrieve authentication data'
        );
        throw new Error(
          'Failed to retrieve authentication data from login flow'
        );
      }

      logger.debug(
        '🌐 Web Browser Adapter: Creating user from intercepted data'
      );

      // Create user from intercepted data
      /*const user = createUser(
      String(interceptedData.userId),
      credentials.username,
      credentials.username, // Use username as name for now
      undefined // No preferences data available in interceptedData
    );*/

      logger.info(
        '🌐 Web Browser Adapter: Web authentication completed successfully',
        {
          // userId: user.id,
          tokenType: interceptedData.token.tokenType,
          tokenExpiresAt: interceptedData.token.expiresAt,
        }
      );

      return interceptedData.token;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('🌐 Web Browser Adapter: Web authentication failed', {
        error: message,
      });
      throw new Error(`Web authentication failed: ${message}`);
    } finally {
      if (browser) {
        logger.debug('🌐 Web Browser Adapter: Closing browser');
        await browser.close();
      }
    }
  };
};

/**
 * Launch browser instance
 */
const launchBrowser = async (config: WebAuthConfig): Promise<Browser> => {
  return await chromium.launch({
    headless: config.headless,
    executablePath: config.executablePath || undefined,
    timeout: sdkConfig.browser.launchTimeout,
  });
};

/**
 * Setup browser page with context
 */
const setupPage = async (
  browser: Browser,
  logger: LoggerType
): Promise<Page> => {
  const context = await browser.newContext({
    userAgent: generateRandomUserAgent(),
  });

  const page = await context.newPage();

  page.on('console', (msg) => {
    logger.debug('Browser console:', msg.text());
  });

  return page;
};

/**
 * Perform login flow
 */
const performLogin = async (
  page: Page,
  credentials: Credentials,
  config: WebAuthConfig,
  logger: LoggerType
): Promise<InterceptedData> => {
  const interceptedData: InterceptedData = {};

  // Set up response listeners
  setupAuthResponseListeners(page, interceptedData, logger);

  // Navigate to login page
  const loginUrl = sdkConfig.urls.loginUrl;

  logger.info('🌐 Web Browser Adapter: Navigating to login page', {
    url: loginUrl,
    timeout: config.timeout,
  });

  await page.goto(loginUrl, {
    waitUntil: 'networkidle',
    timeout: config.timeout,
  });

  // Handle cookies
  logger.debug('🌐 Web Browser Adapter: Handling cookies');
  await handleCookies(page, logger);

  // Fill credentials
  logger.debug('🌐 Web Browser Adapter: Filling credentials');
  await fillCredentials(page, credentials, config, logger);

  // Submit form
  logger.debug('🌐 Web Browser Adapter: Submitting login form');
  await submitLoginForm(page, config);

  // Wait for authentication
  logger.debug('🌐 Web Browser Adapter: Waiting for authentication');
  await waitForAuthentication(page, config);

  return interceptedData;
};

/**
 * Setup response listeners for authentication data
 */
const setupAuthResponseListeners = (
  page: Page,
  interceptedData: InterceptedData,
  logger: LoggerType
): void => {
  // Listen for requests to API endpoints
  page.on('request', (request) => {
    const url = request.url();

    if (url.includes('/users/v3/token')) {
      logInterceptedRequest(logger, request, 'token request');
    } else if (url.includes('/users/v3/user')) {
      logInterceptedRequest(logger, request, 'user request');
    } else if (url.includes('/api/') || url.includes('/users/')) {
      logInterceptedRequest(logger, request, 'API request');
    }
  });

  // Listen for responses from API endpoints
  page.on('response', async (response) => {
    const url = response.url();

    if (url.includes('/api/') || url.includes('/users/')) {
      console.debug('API Response:', { status: response.status(), url });
    }

    if (url.includes('/users/v3/token')) {
      logInterceptedResponse(logger, response, 'token response');
      await handleTokenResponse(response, interceptedData, logger);
    } else if (url.includes('/users/v3/user')) {
      logInterceptedResponse(logger, response, 'user response');
      await handleUserResponse(response, interceptedData, logger);
    }
  });
};

/**
 * Handle cookie consent
 */
const handleCookies = async (page: Page, logger: LoggerType): Promise<void> => {
  try {
    await page.waitForSelector('#onetrust-accept-btn-handler', {
      state: 'visible',
      timeout: sdkConfig.timeouts.elementWait,
    });
    await page.click('#onetrust-accept-btn-handler');

    logger.debug('Accepted cookies');
  } catch {
    logger.debug('No cookies banner found, continuing...');
  }
};

/**
 * Fill login credentials
 */
const fillCredentials = async (
  page: Page,
  credentials: Credentials,
  config: WebAuthConfig,
  logger: LoggerType
): Promise<void> => {
  logger.debug('Entering credentials');

  try {
    // Wait for username field with longer timeout and better error handling
    await page.waitForSelector('[data-cy="username"]', {
      state: 'visible',
      timeout: config.timeout,
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
  config: WebAuthConfig
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
      timeout: config.timeout,
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
  config: WebAuthConfig
): Promise<void> => {
  const appUrl = sdkConfig.urls.appUrl;
  const appUrlPattern = `${appUrl}/**`;

  console.debug('Waiting for app URL pattern:', appUrlPattern);

  await page.waitForURL(appUrlPattern, {
    timeout: config.timeout,
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
  logger: LoggerType
): Promise<void> => {
  try {
    if (!response.ok()) {
      logger.warn('🌐 Web Browser Adapter: Token response failed', {
        status: response.status(),
        url: response.url(),
      });
      return;
    }

    const json = await parseJsonResponse<TokenResponse>(response, logger);
    if (!json?.token?.access_token) {
      logger.debug('🌐 Web Browser Adapter: No access token in response');
      return;
    }

    logger.debug(
      '🌐 Web Browser Adapter: Creating AuthToken from intercepted data'
    );

    // Create AuthToken entity
    interceptedData.token = createAuthToken(
      json.token.access_token,
      'Bearer',
      new Date(Date.now() + sdkConfig.tokens.defaultExpiration),
      json.token.refresh_token
    );

    logger.info('🌐 Web Browser Adapter: Successfully intercepted auth token', {
      tokenType: interceptedData.token.tokenType,
      tokenExpiresAt: interceptedData.token.expiresAt,
    });
  } catch (error) {
    logger.error('🌐 Web Browser Adapter: Error processing token response', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Handle user response from API
 */
const handleUserResponse = async (
  response: Response,
  interceptedData: InterceptedData,
  logger: ReturnType<typeof createLogger>
): Promise<void> => {
  try {
    if (!response.ok()) {
      logger.warn('🌐 Web Browser Adapter: User response failed', {
        status: response.status(),
        url: response.url(),
      });
      return;
    }

    const json = await parseJsonResponse<UserResponse>(response, logger);
    if (!json?.user?.userId) {
      logger.debug('🌐 Web Browser Adapter: No user ID in response');
      return;
    }

    // Store user ID as string
    interceptedData.userId = String(json.user.userId);

    logger.info('🌐 Web Browser Adapter: Successfully intercepted user ID', {
      userId: interceptedData.userId,
    });
  } catch (error) {
    logger.error('🌐 Web Browser Adapter: Error processing user response', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Parse JSON response safely
 */
const parseJsonResponse = async <T = unknown>(
  response: Response,
  logger: LoggerType
): Promise<T | null> => {
  try {
    return await response.json();
  } catch (error) {
    logger.warn('Failed to parse response as JSON', {
      url: response.url(),
      status: response.status(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
  return null;
};
