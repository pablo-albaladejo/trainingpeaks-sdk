/**
 * Web Browser Authentication Adapter
 * Implements authentication using Playwright browser automation
 */

import {
  AuthenticationConfig,
  AuthenticationPort,
} from '@/application/ports/authentication';
import { getSDKConfig } from '@/config';
import type { AuthToken, Credentials, User } from '@/domain';
import { authLogger, browserLogger } from '@/infrastructure/logging/logger';
import {
  createAuthToken,
  createUser,
} from '@/infrastructure/services/domain-factories';
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

export class WebBrowserAuthAdapter implements AuthenticationPort {
  private readonly sdkConfig = getSDKConfig();

  public canHandle(config: AuthenticationConfig): boolean {
    // This adapter handles web-based authentication
    return !!config.webAuth;
  }

  public async authenticate(
    credentials: Credentials,
    config: Required<AuthenticationConfig>
  ): Promise<{ token: AuthToken; user: User }> {
    let browser: Browser | null = null;

    try {
      browser = await this.launchBrowser(config);
      const page = await this.setupPage(browser, config);

      const interceptedData = await this.performLogin(
        page,
        credentials,
        config
      );

      if (!interceptedData.token || !interceptedData.userId) {
        throw new Error(
          'Failed to retrieve authentication data from login flow'
        );
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
  }

  public async refreshToken(
    refreshToken: string,
    config: AuthenticationConfig
  ): Promise<AuthToken> {
    void refreshToken;
    void config;
    // Web-based refresh is not supported with current TrainingPeaks implementation
    throw new Error('Token refresh not supported for web authentication');
  }

  private async launchBrowser(
    config: Required<AuthenticationConfig>
  ): Promise<Browser> {
    return await chromium.launch({
      headless: config.webAuth.headless,
      executablePath: config.webAuth.executablePath || undefined,
      timeout: this.sdkConfig.browser.launchTimeout,
    });
  }

  private async setupPage(
    browser: Browser,
    config: Required<AuthenticationConfig>
  ): Promise<Page> {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    page.on('console', (msg) =>
      browserLogger.debug('Browser console', { message: msg.text() })
    );

    return page;
  }

  private async performLogin(
    page: Page,
    credentials: Credentials,
    config: Required<AuthenticationConfig>
  ): Promise<InterceptedData> {
    const interceptedData: InterceptedData = {};

    // Set up response listeners
    this.setupAuthResponseListeners(page, interceptedData, config);

    // Navigate to login page
    const loginUrl = this.sdkConfig.urls.loginUrl;

    authLogger.info('Navigating to TrainingPeaks login page', { loginUrl });

    await page.goto(loginUrl, {
      waitUntil: 'networkidle',
      timeout: config.webAuth.timeout,
    });

    // Handle cookies
    await this.handleCookies(page, config);

    // Fill credentials
    await this.fillCredentials(page, credentials, config);

    // Submit form
    await this.submitLoginForm(page, config);

    // Wait for authentication
    await this.waitForAuthentication(page, config);

    return interceptedData;
  }

  private setupAuthResponseListeners(
    page: Page,
    interceptedData: InterceptedData,
    config: Required<AuthenticationConfig>
  ): void {
    page.on('response', async (response) => {
      const url = response.url();

      if (url.includes('/api/') || url.includes('/users/')) {
        authLogger.debug('API Response', { status: response.status(), url });
      }

      if (url.includes('/users/v3/token')) {
        await this.handleTokenResponse(response, interceptedData, config);
      } else if (url.includes('/users/v3/user')) {
        await this.handleUserResponse(response, interceptedData, config);
      }
    });
  }

  private async handleCookies(
    page: Page,
    config: Required<AuthenticationConfig>
  ): Promise<void> {
    try {
      await page.waitForSelector('#onetrust-accept-btn-handler', {
        state: 'visible',
        timeout: this.sdkConfig.timeouts.elementWait,
      });
      await page.click('#onetrust-accept-btn-handler');

      browserLogger.debug('Accepted cookies');
    } catch {
      browserLogger.debug('No cookies banner found, continuing...');
    }
  }

  private async fillCredentials(
    page: Page,
    credentials: Credentials,
    config: Required<AuthenticationConfig>
  ): Promise<void> {
    authLogger.debug('Entering credentials');

    await page.waitForSelector('[data-cy="username"]', {
      state: 'visible',
      timeout: config.webAuth.timeout,
    });
    await page.fill('[data-cy="username"]', credentials.username);

    await page.waitForSelector('[data-cy="password"]', {
      state: 'visible',
      timeout: config.webAuth.timeout,
    });
    await page.fill('[data-cy="password"]', credentials.password);
  }

  private async submitLoginForm(
    page: Page,
    config: Required<AuthenticationConfig>
  ): Promise<void> {
    authLogger.debug('Submitting login form');

    await page.click('#btnSubmit');

    await page.waitForLoadState('networkidle', {
      timeout: config.webAuth.timeout,
    });

    // Check for error messages
    await this.checkForLoginErrors(page);
  }

  private async checkForLoginErrors(page: Page): Promise<void> {
    try {
      const errorSelector =
        '[data-cy="invalid_credentials_message"], .error-message, .alert-danger';
      const errorElement = await page.waitForSelector(errorSelector, {
        state: 'visible',
        timeout: this.sdkConfig.timeouts.elementWait,
      });

      if (errorElement) {
        const errorText = await errorElement.textContent();
        throw new Error(`Login failed: ${errorText || 'Invalid credentials'}`);
      }
    } catch {
      // No error message found, continue
    }
  }

  private async waitForAuthentication(
    page: Page,
    config: Required<AuthenticationConfig>
  ): Promise<void> {
    const appUrl = this.sdkConfig.urls.appUrl;
    const appUrlPattern = appUrl + '/**';

    authLogger.debug('Waiting for app URL pattern', { appUrlPattern });

    await page.waitForURL(appUrlPattern, {
      timeout: config.webAuth.timeout,
    });

    // Give time for API calls to complete
    await page.waitForTimeout(this.sdkConfig.browser.pageWaitTimeout);

    authLogger.info('Successfully authenticated with TrainingPeaks');
  }

  private async handleTokenResponse(
    response: Response,
    interceptedData: InterceptedData,
    config: Required<AuthenticationConfig>
  ): Promise<void> {
    try {
      if (!response.ok()) {
        if (config.debug) {
          authLogger.warn('Token response failed', {
            status: response.status(),
            url: response.url(),
          });
        }
        return;
      }

      const json = await this.parseJsonResponse<TokenResponse>(
        response,
        config
      );
      if (!json?.token?.access_token) {
        return;
      }

      // Create AuthToken entity
      interceptedData.token = createAuthToken(
        json.token.access_token,
        'Bearer',
        new Date(Date.now() + this.sdkConfig.tokens.defaultExpiration),
        json.token.refresh_token
      );

      authLogger.info('Successfully intercepted auth token');
    } catch (error) {
      authLogger.error('Error processing token response', { error });
    }
  }

  private async handleUserResponse(
    response: Response,
    interceptedData: InterceptedData,
    config: Required<AuthenticationConfig>
  ): Promise<void> {
    try {
      if (!response.ok()) {
        if (config.debug) {
          authLogger.warn('User response failed', {
            status: response.status(),
            url: response.url(),
          });
        }
        return;
      }

      const json = await this.parseJsonResponse<UserResponse>(response, config);
      if (!json?.user?.userId) {
        return;
      }

      // Store user ID as string
      interceptedData.userId = String(json.user.userId);

      authLogger.info('Successfully intercepted user ID');
    } catch (error) {
      authLogger.error('Error processing user response', { error });
    }
  }

  private async parseJsonResponse<T = unknown>(
    response: Response,
    config: Required<AuthenticationConfig>
  ): Promise<T | null> {
    try {
      return await response.json();
    } catch (error) {
      if (config.debug) {
        const text = await response.text().catch(() => '');
        authLogger.warn('Failed to parse response as JSON', {
          url: response.url(),
          status: response.status(),
          text: text.substring(0, 200),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      return null;
    }
  }
}
