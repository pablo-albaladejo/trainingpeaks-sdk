import { ValidationError } from '@/domain/errors';

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
    /** Token endpoint URL */
    tokenUrl: string;
    /** User info endpoint URL */
    userInfoUrl: string;
  };

  /** Authentication configurations */
  auth: {
    /** Authentication cookie name for session management */
    cookieName: string;
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
 * Type for client configuration that allows partial configuration
 */
export type TrainingPeaksClientConfig = {
  urls?: Partial<TrainingPeaksSDKConfig['urls']>;
  auth?: Partial<TrainingPeaksSDKConfig['auth']>;
  timeouts?: Partial<TrainingPeaksSDKConfig['timeouts']>;
  tokens?: Partial<TrainingPeaksSDKConfig['tokens']>;
  browser?: Partial<TrainingPeaksSDKConfig['browser']>;
  debug?: Partial<TrainingPeaksSDKConfig['debug']>;
  requests?: Partial<TrainingPeaksSDKConfig['requests']>;
};

/**
 * Default configuration values (hardcoded defaults)
 */
const HARDCODED_DEFAULTS: TrainingPeaksSDKConfig = {
  urls: {
    baseUrl: 'https://www.trainingpeaks.com',
    apiBaseUrl: 'https://tpapi.trainingpeaks.com',
    loginUrl: 'https://home.trainingpeaks.com/login',
    appUrl: 'https://app.trainingpeaks.com',
    tokenUrl: 'https://tpapi.trainingpeaks.com/users/v3/token',
    userInfoUrl: 'https://tpapi.trainingpeaks.com/users/v3/user',
  },

  auth: {
    cookieName: 'Production_tpAuth',
  },

  timeouts: {
    default: 30000,
    webAuth: 30000,
    apiAuth: 30000,
    elementWait: 5000,
    pageLoad: 2000,
    errorDetection: 15000,
    testExecution: 60000,
  },

  tokens: {
    // 5 minutes before expiration
    refreshWindow: 300000,
    // 1 minute validation window
    validationWindow: 60000,
    // 23 hours default expiration
    defaultExpiration: 82800000,
  },

  browser: {
    headless: true,
    executablePath: '',
    launchTimeout: 30000,
    pageWaitTimeout: 2000,
  },

  debug: {
    enabled: false,
    logAuth: false,
    logNetwork: false,
    logBrowser: false,
  },

  requests: {
    defaultHeaders: {
      'User-Agent': 'TrainingPeaks-SDK/1.0.0',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    retryAttempts: 3,
    retryDelay: 1000,
  },
};

/**
 * Type for environment configuration with optional values
 */
type EnvironmentConfig = {
  urls?: {
    baseUrl?: string;
    apiBaseUrl?: string;
    loginUrl?: string;
    appUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
  };
  auth?: {
    cookieName?: string;
  };
  timeouts?: {
    default?: number;
    webAuth?: number;
    apiAuth?: number;
    elementWait?: number;
    pageLoad?: number;
    errorDetection?: number;
    testExecution?: number;
  };
  tokens?: {
    refreshWindow?: number;
    validationWindow?: number;
    defaultExpiration?: number;
  };
  browser?: {
    headless?: boolean;
    executablePath?: string;
    launchTimeout?: number;
    pageWaitTimeout?: number;
  };
  debug?: {
    enabled?: boolean;
    logAuth?: boolean;
    logNetwork?: boolean;
    logBrowser?: boolean;
  };
  requests?: {
    defaultHeaders?: Record<string, string>;
    retryAttempts?: number;
    retryDelay?: number;
  };
};

/**
 * Get environment-based configuration overrides
 */
function getEnvironmentConfig(): EnvironmentConfig {
  return {
    urls: {
      baseUrl: process.env.TRAININGPEAKS_BASE_URL || undefined,
      apiBaseUrl: process.env.TRAININGPEAKS_API_BASE_URL || undefined,
      loginUrl: process.env.TRAININGPEAKS_LOGIN_URL || undefined,
      appUrl: process.env.TRAININGPEAKS_APP_URL || undefined,
      tokenUrl: process.env.TRAININGPEAKS_TOKEN_URL || undefined,
      userInfoUrl: process.env.TRAININGPEAKS_USER_INFO_URL || undefined,
    },
    auth: {
      cookieName: process.env.TRAININGPEAKS_AUTH_COOKIE_NAME || undefined,
    },

    timeouts: {
      default: process.env.TRAININGPEAKS_TIMEOUT
        ? (() => {
            const parsed = parseInt(process.env.TRAININGPEAKS_TIMEOUT!, 10);
            return isNaN(parsed) ? undefined : parsed;
          })()
        : undefined,
      webAuth: process.env.TRAININGPEAKS_WEB_AUTH_TIMEOUT
        ? (() => {
            const parsed = parseInt(
              process.env.TRAININGPEAKS_WEB_AUTH_TIMEOUT!,
              10
            );
            return isNaN(parsed) ? undefined : parsed;
          })()
        : undefined,
      apiAuth: process.env.TRAININGPEAKS_API_AUTH_TIMEOUT
        ? (() => {
            const parsed = parseInt(
              process.env.TRAININGPEAKS_API_AUTH_TIMEOUT!,
              10
            );
            return isNaN(parsed) ? undefined : parsed;
          })()
        : undefined,
      elementWait: process.env.TRAININGPEAKS_ELEMENT_WAIT_TIMEOUT
        ? (() => {
            const parsed = parseInt(
              process.env.TRAININGPEAKS_ELEMENT_WAIT_TIMEOUT!,
              10
            );
            return isNaN(parsed) ? undefined : parsed;
          })()
        : undefined,
      pageLoad: process.env.TRAININGPEAKS_PAGE_LOAD_TIMEOUT
        ? (() => {
            const parsed = parseInt(
              process.env.TRAININGPEAKS_PAGE_LOAD_TIMEOUT!,
              10
            );
            return isNaN(parsed) ? undefined : parsed;
          })()
        : undefined,
      errorDetection: process.env.TRAININGPEAKS_ERROR_DETECTION_TIMEOUT
        ? (() => {
            const parsed = parseInt(
              process.env.TRAININGPEAKS_ERROR_DETECTION_TIMEOUT!,
              10
            );
            return isNaN(parsed) ? undefined : parsed;
          })()
        : undefined,
      testExecution: process.env.TRAININGPEAKS_TEST_EXECUTION_TIMEOUT
        ? (() => {
            const parsed = parseInt(
              process.env.TRAININGPEAKS_TEST_EXECUTION_TIMEOUT!,
              10
            );
            return isNaN(parsed) ? undefined : parsed;
          })()
        : undefined,
    },

    tokens: {
      refreshWindow: process.env.TRAININGPEAKS_TOKEN_REFRESH_WINDOW
        ? (() => {
            const parsed = parseInt(
              process.env.TRAININGPEAKS_TOKEN_REFRESH_WINDOW!,
              10
            );
            return isNaN(parsed) ? undefined : parsed;
          })()
        : undefined,
      validationWindow: process.env.TRAININGPEAKS_TOKEN_VALIDATION_WINDOW
        ? (() => {
            const parsed = parseInt(
              process.env.TRAININGPEAKS_TOKEN_VALIDATION_WINDOW!,
              10
            );
            return isNaN(parsed) ? undefined : parsed;
          })()
        : undefined,
      defaultExpiration: process.env.TRAININGPEAKS_TOKEN_DEFAULT_EXPIRATION
        ? (() => {
            const parsed = parseInt(
              process.env.TRAININGPEAKS_TOKEN_DEFAULT_EXPIRATION!,
              10
            );
            return isNaN(parsed) ? undefined : parsed;
          })()
        : undefined,
    },

    browser: {
      headless:
        process.env.TRAININGPEAKS_BROWSER_HEADLESS !== undefined
          ? process.env.TRAININGPEAKS_BROWSER_HEADLESS !== 'false'
          : undefined,
      executablePath:
        process.env.TRAININGPEAKS_BROWSER_EXECUTABLE_PATH || undefined,
      launchTimeout: process.env.TRAININGPEAKS_BROWSER_LAUNCH_TIMEOUT
        ? (() => {
            const parsed = parseInt(
              process.env.TRAININGPEAKS_BROWSER_LAUNCH_TIMEOUT!,
              10
            );
            return isNaN(parsed) ? undefined : parsed;
          })()
        : undefined,
      pageWaitTimeout: process.env.TRAININGPEAKS_BROWSER_PAGE_WAIT_TIMEOUT
        ? (() => {
            const parsed = parseInt(
              process.env.TRAININGPEAKS_BROWSER_PAGE_WAIT_TIMEOUT!,
              10
            );
            return isNaN(parsed) ? undefined : parsed;
          })()
        : undefined,
    },

    debug: {
      enabled:
        process.env.TRAININGPEAKS_DEBUG !== undefined
          ? process.env.TRAININGPEAKS_DEBUG === 'true'
          : undefined,
      logAuth:
        process.env.TRAININGPEAKS_DEBUG_AUTH !== undefined
          ? process.env.TRAININGPEAKS_DEBUG_AUTH === 'true'
          : undefined,
      logNetwork:
        process.env.TRAININGPEAKS_DEBUG_NETWORK !== undefined
          ? process.env.TRAININGPEAKS_DEBUG_NETWORK === 'true'
          : undefined,
      logBrowser:
        process.env.TRAININGPEAKS_DEBUG_BROWSER !== undefined
          ? process.env.TRAININGPEAKS_DEBUG_BROWSER === 'true'
          : undefined,
    },

    requests: {
      defaultHeaders: process.env.TRAININGPEAKS_DEFAULT_HEADERS
        ? JSON.parse(process.env.TRAININGPEAKS_DEFAULT_HEADERS)
        : undefined,
      retryAttempts: process.env.TRAININGPEAKS_RETRY_ATTEMPTS
        ? (() => {
            const parsed = parseInt(
              process.env.TRAININGPEAKS_RETRY_ATTEMPTS!,
              10
            );
            return isNaN(parsed) ? undefined : parsed;
          })()
        : undefined,
      retryDelay: process.env.TRAININGPEAKS_RETRY_DELAY
        ? (() => {
            const parsed = parseInt(process.env.TRAININGPEAKS_RETRY_DELAY!, 10);
            return isNaN(parsed) ? undefined : parsed;
          })()
        : undefined,
    },
  };
}

/**
 * Deep merge configuration objects, filtering out undefined values
 */
function deepMergeConfig(
  base: TrainingPeaksSDKConfig,
  overrides: TrainingPeaksClientConfig
): TrainingPeaksSDKConfig {
  const result = { ...base };

  // Simple deep merge for specific sections
  if (overrides.urls) {
    result.urls = { ...result.urls, ...overrides.urls };
  }
  if (overrides.timeouts) {
    result.timeouts = { ...result.timeouts, ...overrides.timeouts };
  }
  if (overrides.tokens) {
    result.tokens = { ...result.tokens, ...overrides.tokens };
  }
  if (overrides.browser) {
    result.browser = { ...result.browser, ...overrides.browser };
  }
  if (overrides.debug) {
    result.debug = { ...result.debug, ...overrides.debug };
  }
  if (overrides.requests) {
    result.requests = { ...result.requests, ...overrides.requests };
  }

  return result;
}

/**
 * Merge user configuration with defaults
 */
export function mergeWithDefaultConfig(
  userConfig: TrainingPeaksClientConfig = {}
): TrainingPeaksSDKConfig {
  // 1. Start with hardcoded defaults
  // 2. Override with environment variables
  // 3. Override with user configuration
  const envConfig = getEnvironmentConfig();

  // Simple merge approach to avoid type issues
  const config = { ...HARDCODED_DEFAULTS };

  // Merge environment config
  if (envConfig.urls) {
    // Filter out undefined values
    const filteredUrls = Object.fromEntries(
      Object.entries(envConfig.urls).filter(([, value]) => value !== undefined)
    );
    config.urls = { ...config.urls, ...filteredUrls };
  }
  if (envConfig.auth) {
    // Filter out undefined values
    const filteredAuth = Object.fromEntries(
      Object.entries(envConfig.auth).filter(([, value]) => value !== undefined)
    );
    config.auth = { ...config.auth, ...filteredAuth };
  }
  if (envConfig.timeouts) {
    // Filter out undefined values
    const filteredTimeouts = Object.fromEntries(
      Object.entries(envConfig.timeouts).filter(
        ([, value]) => value !== undefined
      )
    );
    config.timeouts = { ...config.timeouts, ...filteredTimeouts };
  }
  if (envConfig.tokens) {
    // Filter out undefined values
    const filteredTokens = Object.fromEntries(
      Object.entries(envConfig.tokens).filter(
        ([, value]) => value !== undefined
      )
    );
    config.tokens = { ...config.tokens, ...filteredTokens };
  }
  if (envConfig.browser) {
    // Filter out undefined values
    const filteredBrowser = Object.fromEntries(
      Object.entries(envConfig.browser).filter(
        ([, value]) => value !== undefined
      )
    );
    config.browser = { ...config.browser, ...filteredBrowser };
  }
  if (envConfig.debug) {
    // Filter out undefined values
    const filteredDebug = Object.fromEntries(
      Object.entries(envConfig.debug).filter(([, value]) => value !== undefined)
    );
    config.debug = { ...config.debug, ...filteredDebug };
  }
  if (envConfig.requests) {
    // Filter out undefined values
    const filteredRequests = Object.fromEntries(
      Object.entries(envConfig.requests).filter(
        ([, value]) => value !== undefined
      )
    );
    config.requests = { ...config.requests, ...filteredRequests };
  }

  // Merge user config using deep merge
  return deepMergeConfig(config, userConfig);
}

/**
 * Validate configuration values
 */
export function validateConfig(config: TrainingPeaksSDKConfig): void {
  // Validate URLs
  Object.entries(config.urls).forEach(([key, url]) => {
    if (!url || typeof url !== 'string') {
      throw new ValidationError(`Invalid URL configuration for ${key}: ${url}`);
    }
    try {
      new URL(url);
    } catch (error) {
      throw new ValidationError(`Invalid URL format for ${key}: ${url}`);
    }
  });

  // Validate timeouts
  Object.entries(config.timeouts).forEach(([key, timeout]) => {
    if (typeof timeout !== 'number' || timeout < 0) {
      throw new ValidationError(
        `Invalid timeout configuration for ${key}: ${timeout}`
      );
    }
  });

  // Validate token configurations
  Object.entries(config.tokens).forEach(([key, value]) => {
    if (typeof value !== 'number' || value < 0) {
      throw new ValidationError(
        `Invalid token configuration for ${key}: ${value}`
      );
    }
  });
}

/**
 * Get configuration from environment variables or defaults
 * Guarantees a complete configuration with all default values
 */
export function getSDKConfig(
  userConfig: TrainingPeaksClientConfig = {}
): TrainingPeaksSDKConfig {
  const config = mergeWithDefaultConfig(userConfig);
  validateConfig(config);
  return config;
}
