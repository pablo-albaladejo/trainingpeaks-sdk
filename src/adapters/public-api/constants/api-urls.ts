/**
 * Centralized API URLs for TrainingPeaks
 * Single source of truth for all API endpoints
 * All URLs are configurable with sensible defaults
 */

/**
 * Base URLs configuration for TrainingPeaks services
 */
export type BaseUrls = {
  /** API base URL for TrainingPeaks API */
  api: string;
  /** Home/Login base URL for authentication */
  home: string;
  /** App base URL for TrainingPeaks application */
  app: string;
};

/**
 * API configuration including base URLs and customizable paths
 */
export type ApiConfig = {
  /** Base URLs for different services */
  baseUrls?: Partial<BaseUrls>;
  /** API version for users endpoint (default: 'v3') */
  usersVersion?: string;
  /** API version for fitness endpoint (default: 'v6') */
  fitnessVersion?: string;
  /** Custom paths for specific endpoints */
  paths?: Partial<{
    login: string;
    users: string;
    token: string;
    userProfile: string;
    tokenRefresh: string;
    userPreferences: string;
    fitness: string;
    athletes: string;
    workouts: string;
  }>;
  /** Custom endpoint overrides (full URLs) */
  endpoints?: Partial<{
    LOGIN_PAGE: string;
    TOKEN: string;
    USER_PROFILE: string;
    TOKEN_REFRESH: string;
    USER_PREFERENCES: string;
    WORKOUTS_LIST: string;
  }>;
};

/**
 * Default base URLs for TrainingPeaks services
 */
export const DEFAULT_BASE_URLS: BaseUrls = {
  api: 'https://tpapi.trainingpeaks.com',
  home: 'https://home.trainingpeaks.com',
  app: 'https://app.trainingpeaks.com',
} as const;

/**
 * Default paths configuration
 */
export const DEFAULT_PATHS = {
  login: '/login',
  users: '/users',
  token: '/token',
  userProfile: '/user',
  tokenRefresh: '/token/refresh',
  userPreferences: '/preferences',
  fitness: '/fitness',
  athletes: '/athletes',
  workouts: '/workouts',
} as const;

/**
 * Generated API URLs structure
 */
export type ApiUrls = {
  baseUrls: {
    API: string;
    LOGIN: string;
    USERS: string;
    APP: string;
  };
  endpoints: {
    LOGIN_PAGE: string;
    TOKEN: string;
    USER_PROFILE: string;
    TOKEN_REFRESH: string;
    USER_PREFERENCES: string;
    WORKOUTS_LIST: string;
  };
  origins: {
    APP: string;
    APP_WITH_SLASH: string;
  };
};

/**
 * Creates all TrainingPeaks URLs from configuration
 * @param config - API configuration with optional overrides
 * @returns Complete API URLs structure
 */
export const createApiUrls = (config: ApiConfig = {}): ApiUrls => {
  // Merge base URLs with defaults
  const baseUrls: BaseUrls = {
    ...DEFAULT_BASE_URLS,
    ...config.baseUrls,
  };

  // Merge paths with defaults
  const paths = {
    ...DEFAULT_PATHS,
    ...config.paths,
  };

  // Get API versions (default to 'v3' for users, 'v6' for fitness)
  const usersVersion = config.usersVersion ?? 'v3';
  const fitnessVersion = config.fitnessVersion ?? 'v6';

  // Build derived URLs
  const usersBase = `${baseUrls.api}${paths.users}/${usersVersion}`;
  const fitnessBase = `${baseUrls.api}${paths.fitness}/${fitnessVersion}`;

  // Generate endpoints with defaults
  const generatedEndpoints = {
    LOGIN_PAGE: `${baseUrls.home}${paths.login}`,
    TOKEN: `${usersBase}${paths.token}`,
    USER_PROFILE: `${usersBase}${paths.userProfile}`,
    TOKEN_REFRESH: `${usersBase}${paths.tokenRefresh}`,
    USER_PREFERENCES: `${usersBase}${paths.userPreferences}`,
    WORKOUTS_LIST: `${fitnessBase}${paths.athletes}`,
  };

  // Override with custom endpoints if provided
  const endpoints = {
    ...generatedEndpoints,
    ...config.endpoints,
  };

  return {
    baseUrls: {
      API: baseUrls.api,
      LOGIN: baseUrls.home,
      USERS: usersBase,
      APP: baseUrls.app,
    },
    endpoints,
    origins: {
      APP: baseUrls.app,
      APP_WITH_SLASH: `${baseUrls.app}/`,
    },
  };
};

/**
 * Default API URLs using the default base URLs
 */
export const DEFAULT_API_URLS = createApiUrls();

/**
 * API Base URLs - derived from DEFAULT_API_URLS for backward compatibility
 */
export const API_BASE_URLS = DEFAULT_API_URLS.baseUrls;

/**
 * API Origins - derived from DEFAULT_API_URLS for backward compatibility
 */
export const API_ORIGINS = DEFAULT_API_URLS.origins;

/**
 * API Endpoints - derived from DEFAULT_API_URLS for backward compatibility
 */
export const API_ENDPOINTS = DEFAULT_API_URLS.endpoints;

/**
 * Generates workout list URL for a specific athlete and date range
 * @param athleteId - The athlete ID to fetch workouts for
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param config - Optional API configuration overrides
 * @returns Complete workout list URL
 */
export const generateWorkoutListUrl = (
  athleteId: string,
  startDate: string,
  endDate: string,
  config: ApiConfig = {}
): string => {
  const apiUrls = createApiUrls(config);
  return `${apiUrls.endpoints.WORKOUTS_LIST}/${encodeURIComponent(athleteId)}/workouts/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`;
};
