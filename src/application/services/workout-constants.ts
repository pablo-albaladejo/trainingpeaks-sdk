/**
 * Workout Constants
 * Contains business rule constants and limits for workout operations
 */

/**
 * Workout validation limits
 */
export const WORKOUT_LIMITS = {
  /**
   * Maximum length for workout title in characters
   */
  TITLE_MAX_LENGTH: 100,

  /**
   * Maximum length for workout ID in characters
   */
  ID_MAX_LENGTH: 100,

  /**
   * Maximum length for activity type in characters
   */
  ACTIVITY_TYPE_MAX_LENGTH: 50,

  /**
   * Maximum number of tags allowed for filtering
   */
  TAGS_MAX_COUNT: 20,

  /**
   * Maximum duration for a workout in seconds (24 hours)
   */
  MAX_DURATION_SECONDS: 86400, // 24 hours

  /**
   * Maximum file size for workout uploads in bytes (10MB)
   */
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB

  /**
   * Maximum number of workouts that can be retrieved in a single request
   */
  MAX_WORKOUTS_PER_REQUEST: 100,
} as const;

/**
 * Workout default values
 */
export const WORKOUT_DEFAULTS = {
  /**
   * Default pagination limit for workout lists
   */
  PAGINATION_LIMIT: 20,

  /**
   * Default pagination offset for workout lists
   */
  PAGINATION_OFFSET: 0,
} as const;

/**
 * Workout file configuration
 */
export const WORKOUT_FILE_CONFIG = {
  /**
   * Allowed file extensions for workout uploads
   */
  ALLOWED_EXTENSIONS: ['tcx', 'gpx', 'fit', 'xml'] as const,

  /**
   * MIME type mappings for workout files
   */
  MIME_TYPE_MAPPING: {
    tcx: 'application/tcx+xml',
    gpx: 'application/gpx+xml',
    fit: 'application/fit',
    xml: 'application/xml',
  } as const,

  /**
   * Default MIME type for unknown file types
   */
  DEFAULT_MIME_TYPE: 'application/octet-stream',
} as const;

/**
 * Workout type mappings
 */
export const WORKOUT_TYPE_MAPPING = {
  1: 'Running',
  2: 'Cycling',
  3: 'Swimming',
  4: 'Strength',
  5: 'Other',
} as const;

/**
 * Default workout type for unknown type IDs
 */
export const DEFAULT_WORKOUT_TYPE = 'Other';
