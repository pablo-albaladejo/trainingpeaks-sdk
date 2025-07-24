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

  // Set up response listeners with promise-based completion
  const authPromise = setupAuthResponseListeners(page, interceptedData, logger);

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
  await submitLoginForm(page, config, logger);

  // Wait for authentication data to be intercepted
  logger.debug('🌐 Web Browser Adapter: Waiting for authentication data');
  await authPromise;

  return interceptedData;
};

/**
 * Setup response listeners for authentication data
 */
const setupAuthResponseListeners = (
  page: Page,
  interceptedData: InterceptedData,
  logger: LoggerType
): Promise<void> => {
  return new Promise((resolve, reject) => {
    let tokenReceived = false;
    let userReceived = false;
    let authErrorDetected = false;

    let formSubmitted = false;

    // Check for error messages in the DOM periodically
    const checkForErrorMessages = async () => {
      // Only check for errors after form has been submitted
      if (!formSubmitted) {
        return;
      }

      try {
        const errorSelectors = [
          '[data-cy="invalid_credentials_message"]',
          '.error-message',
          '.alert-danger',
          '.alert-error',
          '.login-error',
          '[role="alert"]',
          '.error',
        ];

        for (const selector of errorSelectors) {
          try {
            const errorElement = await page.$(selector);
            if (errorElement) {
              const errorText = await errorElement.textContent();
              if (errorText && errorText.trim()) {
                // Only handle specific login errors, ignore validation errors
                if (
                  errorText.includes('username or password') ||
                  errorText.includes('incorrect') ||
                  errorText.includes('invalid')
                ) {
                  logger.warn(
                    '🌐 Web Browser Adapter: Login error detected in DOM',
                    {
                      selector,
                      errorText: errorText.trim(),
                    }
                  );
                  handleAuthError(
                    new Error(`Login failed: ${errorText.trim()}`)
                  );
                  return;
                }
              }
            }
          } catch (error) {
            // Continue checking other selectors
            continue;
          }
        }
      } catch (error) {
        // Ignore errors in error checking
      }
    };

    // Check for errors more frequently (every 1 second) and also after form submission
    const errorCheckInterval = setInterval(checkForErrorMessages, 1000);

    const timeoutId = setTimeout(() => {
      clearInterval(errorCheckInterval);
      reject(
        new Error(
          'Authentication timeout: Failed to receive required data within expected time'
        )
      );
    }, sdkConfig.timeouts.webAuth);

    const checkCompletion = () => {
      if (tokenReceived && userReceived) {
        clearTimeout(timeoutId);
        clearInterval(errorCheckInterval);
        logger.info(
          '🌐 Web Browser Adapter: All required authentication data received'
        );
        resolve();
      }
    };

    const handleAuthError = (error: Error) => {
      if (!authErrorDetected) {
        authErrorDetected = true;
        clearTimeout(timeoutId);
        clearInterval(errorCheckInterval);
        logger.warn('🌐 Web Browser Adapter: Authentication error detected', {
          error: error.message,
        });
        reject(error);
      }
    };

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
      const status = response.status();

      if (url.includes('/api/') || url.includes('/users/')) {
        logger.debug('API Response:', { status, url });
      }

      // Detect authentication errors (401 Unauthorized) only from TrainingPeaks APIs
      if (
        status === 401 &&
        (url.includes('trainingpeaks.com') || url.includes('/users/'))
      ) {
        logger.warn(
          '🌐 Web Browser Adapter: 401 Unauthorized detected from TrainingPeaks API',
          { url }
        );
        handleAuthError(new Error('Invalid credentials: 401 Unauthorized'));
        return;
      }

      // Detect other authentication-related errors from TrainingPeaks APIs
      if (
        status >= 400 &&
        status < 500 &&
        (url.includes('trainingpeaks.com') || url.includes('/users/'))
      ) {
        logger.warn(
          '🌐 Web Browser Adapter: Client error detected from TrainingPeaks API',
          { status, url }
        );
        handleAuthError(
          new Error(`Authentication failed: ${status} ${response.statusText()}`)
        );
        return;
      }

      if (url.includes('/users/v3/token')) {
        logInterceptedResponse(logger, response, 'token response');
        try {
          await handleTokenResponse(response, interceptedData, logger);
          if (interceptedData.token) {
            tokenReceived = true;
            checkCompletion();
          }
        } catch (error) {
          handleAuthError(
            error instanceof Error ? error : new Error('Unknown token error')
          );
        }
      } else if (url.includes('/users/v3/user')) {
        logInterceptedResponse(logger, response, 'user response');
        try {
          await handleUserResponse(response, interceptedData, logger);
          if (interceptedData.userId) {
            userReceived = true;
            checkCompletion();
          }
        } catch (error) {
          handleAuthError(
            error instanceof Error ? error : new Error('Unknown user error')
          );
        }
      }
    });

    // Listen for page errors and authentication failures
    page.on('pageerror', (error) => {
      logger.warn('🌐 Web Browser Adapter: Page error detected', {
        error: error.message,
      });
      if (
        error.message.includes('authentication') ||
        error.message.includes('unauthorized')
      ) {
        handleAuthError(new Error(`Page error: ${error.message}`));
      }
    });

    // Also check for errors after form submission
    page.on('load', () => {
      setTimeout(checkForErrorMessages, 1000);
    });

    // Mark form as submitted when submit button is clicked
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('login')) {
        formSubmitted = true;
      }
    });
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
    logger.debug('Username filled successfully');

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
          logger.debug(
            `Password filled successfully using selector: ${selector}`
          );
          break;
        }
      } catch (error) {
        logger.debug(`Password selector ${selector} not found, trying next...`);
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
    logger.error('Failed to fill credentials', {
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
  config: WebAuthConfig,
  logger: LoggerType
): Promise<void> => {
  logger.debug('Submitting login form');

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
          logger.debug(`Submit button clicked using selector: ${selector}`);
          break;
        }
      } catch (error) {
        logger.debug(`Submit selector ${selector} not found, trying next...`);
        continue;
      }
    }

    if (!submitButton) {
      throw new Error(
        'Submit button not found. Tried selectors: ' +
          submitSelectors.join(', ')
      );
    }

    // Wait for the page to load after form submission
    await page.waitForLoadState('domcontentloaded', {
      timeout: config.timeout,
    });

    // Give a moment for any error messages to appear
    await page.waitForTimeout(2000);

    // Check for error messages immediately after form submission
    await checkForLoginErrors(page, logger);
  } catch (error) {
    logger.error('Failed to submit login form', {
      error: (error as Error).message,
    });
    throw new Error(`Failed to submit login form: ${(error as Error).message}`);
  }
};

/**
 * Check for login error messages
 */
const checkForLoginErrors = async (
  page: Page,
  logger: LoggerType
): Promise<void> => {
  try {
    const errorSelectors = [
      '[data-cy="invalid_credentials_message"]',
      '.error-message',
      '.alert-danger',
      '.error',
      '.login-error',
      '[role="alert"]',
    ];

    for (const selector of errorSelectors) {
      try {
        const errorElement = await page.$(selector);
        if (errorElement) {
          const errorText = await errorElement.textContent();
          if (errorText && errorText.trim()) {
            logger.warn(
              '🌐 Web Browser Adapter: Login error detected in form submission',
              {
                selector,
                errorText: errorText.trim(),
              }
            );
            throw new Error(`Login failed: ${errorText.trim()}`);
          }
        }
      } catch (error) {
        // Continue checking other selectors
        continue;
      }
    }
  } catch (error) {
    // Re-throw the error if it's a login error
    if (error instanceof Error && error.message.includes('Login failed:')) {
      throw error;
    }
    // No error message found, continue
  }
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
      const status = response.status();
      logger.warn('🌐 Web Browser Adapter: Token response failed', {
        status,
        url: response.url(),
      });

      // If it's an authentication error, throw it to be handled by the listener
      if (status === 401) {
        throw new Error(
          'Invalid credentials: Token request returned 401 Unauthorized'
        );
      }
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
