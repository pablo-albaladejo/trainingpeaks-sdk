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
}

export interface LoginCredentials {
  /** User email or username */
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
  /** User email */
  email: string;
  /** User full name */
  name: string;
  /** User avatar URL */
  avatar?: string;
  /** User preferences */
  preferences?: Record<string, any>;
}

export interface WorkoutData {
  /** Workout name/title */
  name: string;
  /** Workout description */
  description?: string;
  /** Workout date */
  date: string;
  /** Workout duration in seconds */
  duration: number;
  /** Workout distance in meters */
  distance?: number;
  /** Workout type */
  type: WorkoutType;
  /** Workout file data */
  fileData?: WorkoutFileData;
}

export interface WorkoutFileData {
  /** File name */
  filename: string;
  /** File content as buffer or base64 string */
  content: Uint8Array | string;
  /** File MIME type */
  mimeType: string;
}

export enum WorkoutType {
  BIKE = 'bike',
  RUN = 'run',
  SWIM = 'swim',
  OTHER = 'other',
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
}

export interface ApiResponse<T = any> {
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
