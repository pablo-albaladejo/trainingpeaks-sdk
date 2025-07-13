/**
 * TrainingPeaks SDK Types
 */

export interface TrainingPeaksConfig {
  /** Base URL for the TrainingPeaks API */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Custom headers to include in requests */
  headers?: Record<string, string>;
  /** Enable debug logging */
  debug?: boolean;
  /** Authentication method to use */
  authMethod?: 'web' | 'api';
  /** Web authentication configuration */
  webAuth?: {
    /** Whether to run browser in headless mode */
    headless?: boolean;
    /** Browser timeout in milliseconds */
    timeout?: number;
    /** Custom browser executable path */
    executablePath?: string;
  };
}

export interface LoginCredentials {
  /** Username */
  username: string;
  /** User password */
  password: string;
}

export interface AuthToken {
  /** Access token */
  accessToken: string;
  /** Token type (usually 'Bearer') */
  tokenType: string;
  /** Token expiration timestamp */
  expiresAt: number;
  /** Refresh token */
  refreshToken?: string;
}

export interface UserProfile {
  /** User ID */
  id: string;
  /** User full name */
  name: string;
  /** User avatar URL */
  avatar?: string;
  /** User preferences */
  preferences?: Record<string, unknown>;
}

export interface WorkoutData {
  /** Workout name/title */
  name: string;
  /** Workout description */
  description?: string;
  /** Workout date */
  date?: string;
  /** Workout duration in seconds */
  duration?: number;
  /** Workout distance in meters */
  distance?: number;
  /** Workout type */
  type?: WorkoutType;
  /** Workout file data */
  fileData?: WorkoutFileData;
}

export interface WorkoutFileData {
  /** File name */
  filename: string;
  /** File content as buffer or string */
  content: Uint8Array | string | Buffer;
  /** File MIME type */
  mimeType: string;
}

export enum WorkoutType {
  BIKE = 'BIKE',
  RUN = 'RUN',
  SWIM = 'SWIM',
  OTHER = 'OTHER',
}

export interface UploadResponse {
  /** Upload ID */
  id: string;
  /** Upload status */
  status: string;
  /** Upload message */
  message?: string;
  /** Workout ID if successful */
  workoutId?: string;
  /** Upload errors if any */
  errors?: string[];
}

export interface ApiResponse<T = unknown> {
  /** Response data */
  data: T;
  /** Response status */
  status: number;
  /** Response message */
  message?: string;
}

export interface RequestOptions {
  /** Request headers */
  headers?: Record<string, string>;
  /** Request timeout */
  timeout?: number;
  /** Retry configuration */
  retry?: RetryConfig;
}

export interface RetryConfig {
  /** Number of retries */
  attempts: number;
  /** Delay between retries in milliseconds */
  delay: number;
  /** Backoff factor */
  backoff: number;
}

/**
 * Import and re-export configuration types from config module
 */
import type { TrainingPeaksSDKConfig } from '../config';
export type { TrainingPeaksSDKConfig } from '../config';

export interface TrainingPeaksClientConfig {
  /** Base URL for TrainingPeaks */
  baseUrl?: string;
  /** Authentication method */
  authMethod?: 'web' | 'api';
  /** Browser configuration for web auth */
  webAuth?: {
    headless?: boolean;
    timeout?: number;
    executablePath?: string;
  };
  /** Enable debug logging */
  debug?: boolean;
  /** Request timeout */
  timeout?: number;
  /** Custom headers */
  headers?: Record<string, string>;
  /** Complete SDK configuration (overrides other options) */
  sdkConfig?: Partial<TrainingPeaksSDKConfig>;
}
