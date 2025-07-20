/**
 * TrainingPeaks SDK Configuration
 *
 * Centralized configuration for all SDK components, eliminating hardcoded values.
 * All values can be overridden through environment variables or client configuration.
 */

export type TrainingPeaksSDKConfig = {
  /** URL configurations */
  urls: {
    /** Base URL for TrainingPeaks main site */
    baseUrl: string;
    /** API base URL for TrainingPeaks API */
    apiBaseUrl: string;
    /** Login page URL */
    loginUrl: string;
    /** Application URL after login */
    appUrl: string;
  };

  /** Timeout configurations (in milliseconds) */
  timeouts: {
    /** General request timeout */
    default: number;
    /** Browser authentication timeout */
    webAuth: number;
    /** API authentication timeout */
    apiAuth: number;
    /** Element wait timeout */
    elementWait: number;
    /** Page load timeout */
    pageLoad: number;
    /** Error detection timeout */
    errorDetection: number;
    /** Test execution timeout */
    testExecution: number;
  };

  /** Authentication token configurations */
  tokens: {
    /** Token refresh window (before expiration) */
    refreshWindow: number;
    /** Token validation window */
    validationWindow: number;
    /** Default token expiration (for web auth) */
    defaultExpiration: number;
  };

  /** Browser configurations */
  browser: {
    /** Run browser in headless mode */
    headless: boolean;
    /** Custom browser executable path */
    executablePath: string;
    /** Browser launch timeout */
    launchTimeout: number;
    /** Page wait timeout */
    pageWaitTimeout: number;
  };

  /** Debug and logging configurations */
  debug: {
    /** Enable debug logging */
    enabled: boolean;
    /** Log authentication events */
    logAuth: boolean;
    /** Log network requests */
    logNetwork: boolean;
    /** Log browser events */
    logBrowser: boolean;
  };

  /** Request configurations */
  requests: {
    /** Default request headers */
    defaultHeaders: Record<string, string>;
    /** Request retry attempts */
    retryAttempts: number;
    /** Retry delay (in milliseconds) */
    retryDelay: number;
  };
};

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: TrainingPeaksSDKConfig = {
  urls: {
    baseUrl:
      process.env.TRAININGPEAKS_BASE_URL || 'https://www.trainingpeaks.com',
    apiBaseUrl:
      process.env.TRAININGPEAKS_API_BASE_URL || 'https://api.trainingpeaks.com',
    loginUrl:
      process.env.TRAININGPEAKS_LOGIN_URL ||
      'https://home.trainingpeaks.com/login',
    appUrl:
      process.env.TRAININGPEAKS_APP_URL || 'https://app.trainingpeaks.com',
  },

  timeouts: {
    default: parseInt(process.env.TRAININGPEAKS_TIMEOUT || '30000', 10),
    webAuth: parseInt(
      process.env.TRAININGPEAKS_WEB_AUTH_TIMEOUT || '30000',
      10
    ),
    apiAuth: parseInt(
      process.env.TRAININGPEAKS_API_AUTH_TIMEOUT || '30000',
      10
    ),
    elementWait: parseInt(
      process.env.TRAININGPEAKS_ELEMENT_WAIT_TIMEOUT || '5000',
      10
    ),
    pageLoad: parseInt(
      process.env.TRAININGPEAKS_PAGE_LOAD_TIMEOUT || '2000',
      10
    ),
    errorDetection: parseInt(
      process.env.TRAININGPEAKS_ERROR_DETECTION_TIMEOUT || '15000',
      10
    ),
    testExecution: parseInt(
      process.env.TRAININGPEAKS_TEST_EXECUTION_TIMEOUT || '60000',
      10
    ),
  },

  tokens: {
    // 5 minutes before expiration
    refreshWindow: parseInt(
      process.env.TRAININGPEAKS_TOKEN_REFRESH_WINDOW || '300000',
      10
    ),
    // 1 minute validation window
    validationWindow: parseInt(
      process.env.TRAININGPEAKS_TOKEN_VALIDATION_WINDOW || '60000',
      10
    ),
    // 23 hours default expiration
    defaultExpiration: parseInt(
      process.env.TRAININGPEAKS_TOKEN_DEFAULT_EXPIRATION || '82800000',
      10
    ),
  },

  browser: {
    headless: process.env.TRAININGPEAKS_BROWSER_HEADLESS !== 'false',
    executablePath: process.env.TRAININGPEAKS_BROWSER_EXECUTABLE_PATH || '',
    launchTimeout: parseInt(
      process.env.TRAININGPEAKS_BROWSER_LAUNCH_TIMEOUT || '30000',
      10
    ),
    pageWaitTimeout: parseInt(
      process.env.TRAININGPEAKS_BROWSER_PAGE_WAIT_TIMEOUT || '2000',
      10
    ),
  },

  debug: {
    enabled: process.env.TRAININGPEAKS_DEBUG === 'true',
    logAuth: process.env.TRAININGPEAKS_DEBUG_AUTH === 'true',
    logNetwork: process.env.TRAININGPEAKS_DEBUG_NETWORK === 'true',
    logBrowser: process.env.TRAININGPEAKS_DEBUG_BROWSER === 'true',
  },

  requests: {
    defaultHeaders: {
      'User-Agent': 'TrainingPeaks-SDK/1.0.0',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    retryAttempts: parseInt(
      process.env.TRAININGPEAKS_RETRY_ATTEMPTS || '3',
      10
    ),
    retryDelay: parseInt(process.env.TRAININGPEAKS_RETRY_DELAY || '1000', 10),
  },
};

/**
 * Merge user configuration with defaults
 */
export function mergeWithDefaultConfig(
  userConfig: Partial<TrainingPeaksSDKConfig> = {}
): TrainingPeaksSDKConfig {
  return {
    urls: { ...DEFAULT_CONFIG.urls, ...userConfig.urls },
    timeouts: { ...DEFAULT_CONFIG.timeouts, ...userConfig.timeouts },
    tokens: { ...DEFAULT_CONFIG.tokens, ...userConfig.tokens },
    browser: { ...DEFAULT_CONFIG.browser, ...userConfig.browser },
    debug: { ...DEFAULT_CONFIG.debug, ...userConfig.debug },
    requests: { ...DEFAULT_CONFIG.requests, ...userConfig.requests },
  };
}

/**
 * Validate configuration values
 */
export function validateConfig(config: TrainingPeaksSDKConfig): void {
  // Validate URLs
  Object.entries(config.urls).forEach(([key, url]) => {
    if (!url || typeof url !== 'string') {
      throw new Error(`Invalid URL configuration for ${key}: ${url}`);
    }
    try {
      new URL(url);
    } catch (error) {
      throw new Error(`Invalid URL format for ${key}: ${url}`);
    }
  });

  // Validate timeouts
  Object.entries(config.timeouts).forEach(([key, timeout]) => {
    if (typeof timeout !== 'number' || timeout < 0) {
      throw new Error(`Invalid timeout configuration for ${key}: ${timeout}`);
    }
  });

  // Validate token configurations
  Object.entries(config.tokens).forEach(([key, value]) => {
    if (typeof value !== 'number' || value < 0) {
      throw new Error(`Invalid token configuration for ${key}: ${value}`);
    }
  });
}

/**
 * Get configuration from environment variables or defaults
 */
export function getSDKConfig(
  userConfig: Partial<TrainingPeaksSDKConfig> = {}
): TrainingPeaksSDKConfig {
  const config = mergeWithDefaultConfig(userConfig);
  validateConfig(config);
  return config;
}
