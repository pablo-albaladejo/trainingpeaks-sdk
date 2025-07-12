/**
 * Web-based Authentication Service for TrainingPeaks
 * Uses Playwright to simulate browser login and intercept tokens
 */

import { Browser, chromium, Page, Response } from 'playwright-core';
import { AuthenticationError, NetworkError } from '../errors';
import { AuthToken, LoginCredentials } from '../types';

export interface WebAuthConfig {
  /** Whether to run browser in headless mode */
  headless?: boolean;
  /** Browser timeout in milliseconds */
  timeout?: number;
  /** Whether to enable debug logging */
  debug?: boolean;
  /** Custom browser executable path */
  executablePath?: string;
  /** Login URL */
  loginUrl?: string;
  /** App URL pattern for success verification */
  appUrl?: string;
}

export class WebAuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private userId: string | null = null;
  private config: Required<WebAuthConfig>;

  constructor(config: WebAuthConfig = {}) {
    this.config = {
      headless: true,
      timeout: 30000,
      debug: false,
      executablePath: '',
      loginUrl:
        process.env.TRAININGPEAKS_LOGIN_URL ||
        'https://home.trainingpeaks.com/login',
      appUrl:
        process.env.TRAININGPEAKS_APP_URL || 'https://app.trainingpeaks.com',
      ...config,
    };
  }

  /**
   * Authenticate using web browser simulation
   */
  public async login(credentials: LoginCredentials): Promise<AuthToken> {
    if (!credentials.username || !credentials.password) {
      throw new AuthenticationError('Username and password are required');
    }

    // Return existing token if still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      if (this.config.debug) {
        console.log('Using existing valid token');
      }
      return this.getAuthToken();
    }

    let browser: Browser | null = null;

    try {
      // Launch browser
      browser = await chromium.launch({
        headless: this.config.headless,
        executablePath: this.config.executablePath || undefined,
      });

      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });

      const page = await context.newPage();

      // Set up console logging if debug is enabled
      if (this.config.debug) {
        page.on('console', msg => console.log('Browser:', msg.text()));
      }

      // Set up response listeners to intercept auth tokens
      this.setupAuthResponseListeners(page);

      // Navigate to login page
      if (this.config.debug) {
        console.log(
          `Navigating to TrainingPeaks login page: ${this.config.loginUrl}`
        );
      }

      await page.goto(this.config.loginUrl, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout,
      });

      // Accept cookies if present
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', {
          state: 'visible',
          timeout: 5000,
        });
        await page.click('#onetrust-accept-btn-handler');
        if (this.config.debug) {
          console.log('Accepted cookies');
        }
      } catch {
        // Cookies banner might not be present
        if (this.config.debug) {
          console.log('No cookies banner found, continuing...');
        }
      }

      // Fill in credentials
      if (this.config.debug) {
        console.log('Entering credentials...');
      }

      await page.waitForSelector('[data-cy="username"]', {
        state: 'visible',
        timeout: this.config.timeout,
      });
      await page.fill('[data-cy="username"]', credentials.username);

      await page.waitForSelector('[data-cy="password"]', {
        state: 'visible',
        timeout: this.config.timeout,
      });
      await page.fill('[data-cy="password"]', credentials.password);

      // Submit the form
      if (this.config.debug) {
        console.log('Submitting login form...');
      }

      await page.click('#btnSubmit');

      // Wait for navigation
      await page.waitForLoadState('networkidle', {
        timeout: this.config.timeout,
      });

      // Check for error messages
      try {
        const errorSelector =
          '[data-cy="invalid_credentials_message"], .error-message, .alert-danger';
        const errorElement = await page.waitForSelector(errorSelector, {
          state: 'visible',
          timeout: 5000,
        });

        if (errorElement) {
          const errorText = await errorElement.textContent();
          throw new AuthenticationError(
            `Login failed: ${errorText || 'Invalid credentials'}`
          );
        }
      } catch {
        // No error message found, continue
      }

      // Verify successful navigation
      const currentUrl = page.url();
      if (!currentUrl.includes(this.config.appUrl.replace('https://', ''))) {
        throw new AuthenticationError(
          `Login failed: did not navigate to expected page. Current: ${currentUrl}, Expected: ${this.config.appUrl}`
        );
      }

      // Wait for the app to load and tokens to be intercepted
      const appUrlPattern = this.config.appUrl + '/**';
      if (this.config.debug) {
        console.log(`Waiting for app URL pattern: ${appUrlPattern}`);
      }

      await page.waitForURL(appUrlPattern, {
        timeout: this.config.timeout,
      });

      // Give a bit more time for API calls to complete
      await page.waitForTimeout(2000);

      if (!this.accessToken || !this.userId) {
        throw new AuthenticationError(
          'Failed to retrieve authentication data from login flow'
        );
      }

      // Set token expiry (TrainingPeaks tokens typically last 24 hours)
      this.tokenExpiry = new Date(Date.now() + 23 * 60 * 60 * 1000);

      if (this.config.debug) {
        console.log('Successfully authenticated with TrainingPeaks');
      }

      return this.getAuthToken();
    } catch (error: unknown) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new NetworkError(`Web authentication failed: ${message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Get current authentication token
   */
  public getAuthToken(): AuthToken {
    if (
      !this.accessToken ||
      !this.tokenExpiry ||
      this.tokenExpiry < new Date()
    ) {
      throw new AuthenticationError('No valid authentication token available');
    }

    return {
      accessToken: this.accessToken,
      tokenType: 'Bearer',
      expiresAt: this.tokenExpiry.getTime(),
      refreshToken: this.refreshToken || undefined,
    };
  }

  /**
   * Get current user ID
   */
  public getUserId(): string | null {
    return this.userId;
  }

  /**
   * Check if currently authenticated
   */
  public isAuthenticated(): boolean {
    return (
      this.accessToken !== null &&
      this.tokenExpiry !== null &&
      this.tokenExpiry > new Date()
    );
  }

  /**
   * Clear authentication data
   */
  public logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.userId = null;
  }

  /**
   * Set up listeners to intercept authentication responses
   */
  private setupAuthResponseListeners(page: Page): void {
    page.on('response', async response => {
      const url = response.url();

      if (url.includes('/users/v3/token')) {
        await this.handleTokenResponse(response);
      } else if (url.includes('/users/v3/user')) {
        await this.handleUserResponse(response);
      }
    });
  }

  /**
   * Handle token response from TrainingPeaks API
   */
  private async handleTokenResponse(response: Response): Promise<void> {
    try {
      if (!response.ok()) {
        if (this.config.debug) {
          console.warn(
            `Token response failed with status ${response.status()}`
          );
        }
        return;
      }

      const json = await this.parseJsonResponse(response);
      if (!json?.token?.access_token) {
        return;
      }

      this.accessToken = json.token.access_token;
      this.refreshToken = json.token.refresh_token || null;

      if (this.config.debug) {
        console.log('Successfully intercepted auth token');
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('Error processing token response:', error);
      }
    }
  }

  /**
   * Handle user response from TrainingPeaks API
   */
  private async handleUserResponse(response: Response): Promise<void> {
    try {
      if (!response.ok()) {
        if (this.config.debug) {
          console.warn(`User response failed with status ${response.status()}`);
        }
        return;
      }

      const json = await this.parseJsonResponse(response);
      if (!json?.user?.userId) {
        return;
      }

      // Convert userId to string (API returns it as number)
      this.userId = String(json.user.userId);

      if (this.config.debug) {
        console.log('Successfully intercepted user ID');
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('Error processing user response:', error);
      }
    }
  }

  /**
   * Parse JSON response safely
   */
  private async parseJsonResponse(response: Response): Promise<any | null> {
    try {
      return await response.json();
    } catch (error) {
      if (this.config.debug) {
        const text = await response.text().catch(() => '');
        console.warn('Failed to parse response as JSON:', {
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
