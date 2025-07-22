/**
 * TrainingPeaks SDK Types
 */

import { WorkoutStructure as WorkoutStructureValueObject } from '@/domain/value-objects/workout-structure';

export type TrainingPeaksConfig = {
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
};

export type LoginCredentials = {
  /** Username */
  username: string;
  /** User password */
  password: string;
};

export type AuthToken = {
  /** Access token */
  accessToken: string;
  /** Token type (usually 'Bearer') */
  tokenType: string;
  /** Token expiration timestamp */
  expiresAt: number;
  /** Refresh token */
  refreshToken?: string;
};

export type UserProfile = {
  /** User ID */
  id: string;
  /** User full name */
  name: string;
  /** User avatar URL */
  avatar?: string;
  /** User preferences */
  preferences?: Record<string, unknown>;
};

export type WorkoutData = {
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
};

export type WorkoutFileData = {
  /** File name */
  filename: string;
  /** File content as buffer or string */
  content: Uint8Array | string | Buffer;
  /** File MIME type */
  mimeType: string;
};

export enum WorkoutType {
  BIKE = 'BIKE',
  RUN = 'RUN',
  SWIM = 'SWIM',
  OTHER = 'OTHER',
}

export type UploadResponse = {
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
};

// Structured Workout Types
export type WorkoutStructureStep = {
  /** Step name */
  name: string;
  /** Step duration/length */
  length: WorkoutLength;
  /** Intensity targets */
  targets: WorkoutTarget[];
  /** Intensity class */
  intensityClass: 'active' | 'rest' | 'warmUp' | 'coolDown';
  /** Whether duration is open */
  openDuration: boolean;
};

export type WorkoutLength = {
  /** Length value */
  value: number;
  /** Length unit */
  unit:
    | 'second'
    | 'minute'
    | 'hour'
    | 'repetition'
    | 'meter'
    | 'kilometer'
    | 'mile';
};

export type WorkoutTarget = {
  /** Minimum target value */
  minValue: number;
  /** Maximum target value */
  maxValue: number;
};

export type WorkoutStructureElement = {
  /** Element type */
  type: 'step' | 'repetition';
  /** Element length */
  length: WorkoutLength;
  /** Steps within this element */
  steps: WorkoutStructureStep[];
  /** Start time in seconds */
  begin: number;
  /** End time in seconds */
  end: number;
};

export type WorkoutStructure = {
  /** Structure elements */
  structure: WorkoutStructureElement[];
  /** Polyline coordinates for visualization */
  polyline: number[][];
  /** Primary length metric */
  primaryLengthMetric: 'duration' | 'distance';
  /** Primary intensity metric */
  primaryIntensityMetric:
    | 'percentOfThresholdPace'
    | 'percentOfThresholdPower'
    | 'heartRate'
    | 'power'
    | 'pace'
    | 'speed';
  /** Primary intensity target type */
  primaryIntensityTargetOrRange: 'target' | 'range';
};

export type StructuredWorkoutRequest = {
  /** Athlete ID */
  athleteId: number;
  /** Workout title */
  title: string;
  /** Workout type ID */
  workoutTypeValueId: number;
  /** Workout code */
  code?: string | null;
  /** Workout date */
  workoutDay: string;
  /** Start time */
  startTime?: string | null;
  /** Planned start time */
  startTimePlanned?: string | null;
  /** Whether it's an "or" workout */
  isItAnOr: boolean;
  /** Whether workout is hidden */
  isHidden?: boolean | null;
  /** Whether workout is completed */
  completed?: boolean | null;
  /** Workout description */
  description?: string | null;
  /** User tags */
  userTags?: string;
  /** Coach comments */
  coachComments?: string | null;
  /** Workout comments */
  workoutComments?: string[];
  /** New comment */
  newComment?: string | null;
  /** Has private workout comment for caller */
  hasPrivateWorkoutCommentForCaller?: boolean;
  /** Has private workout note for caller */
  hasPrivateWorkoutNoteForCaller?: boolean;
  /** Public setting value */
  publicSettingValue?: number;
  /** Distance */
  distance?: number | null;
  /** Planned distance */
  distancePlanned?: number | null;
  /** Customized distance */
  distanceCustomized?: number | null;
  /** Customized distance units */
  distanceUnitsCustomized?: string | null;
  /** Total time */
  totalTime?: number | null;
  /** Planned total time */
  totalTimePlanned?: number | null;
  /** Minimum heart rate */
  heartRateMinimum?: number | null;
  /** Maximum heart rate */
  heartRateMaximum?: number | null;
  /** Average heart rate */
  heartRateAverage?: number | null;
  /** Calories */
  calories?: number | null;
  /** Planned calories */
  caloriesPlanned?: number | null;
  /** Actual TSS */
  tssActual?: number | null;
  /** Planned TSS */
  tssPlanned?: number | null;
  /** TSS source */
  tssSource?: number;
  /** Intensity factor */
  if?: number | null;
  /** Planned intensity factor */
  ifPlanned?: number | null;
  /** Average velocity */
  velocityAverage?: number | null;
  /** Planned velocity */
  velocityPlanned?: number | null;
  /** Maximum velocity */
  velocityMaximum?: number | null;
  /** Normalized speed actual */
  normalizedSpeedActual?: number | null;
  /** Normalized power actual */
  normalizedPowerActual?: number | null;
  /** Average power */
  powerAverage?: number | null;
  /** Maximum power */
  powerMaximum?: number | null;
  /** Energy */
  energy?: number | null;
  /** Planned energy */
  energyPlanned?: number | null;
  /** Elevation gain */
  elevationGain?: number | null;
  /** Planned elevation gain */
  elevationGainPlanned?: number | null;
  /** Elevation loss */
  elevationLoss?: number | null;
  /** Minimum elevation */
  elevationMinimum?: number | null;
  /** Average elevation */
  elevationAverage?: number | null;
  /** Maximum elevation */
  elevationMaximum?: number | null;
  /** Average torque */
  torqueAverage?: number | null;
  /** Maximum torque */
  torqueMaximum?: number | null;
  /** Minimum temperature */
  tempMin?: number | null;
  /** Average temperature */
  tempAvg?: number | null;
  /** Maximum temperature */
  tempMax?: number | null;
  /** Average cadence */
  cadenceAverage?: number | null;
  /** Maximum cadence */
  cadenceMaximum?: number | null;
  /** Last modified date */
  lastModifiedDate?: string;
  /** Equipment bike ID */
  equipmentBikeId?: number | null;
  /** Equipment shoe ID */
  equipmentShoeId?: number | null;
  /** Whether workout is locked */
  isLocked?: boolean | null;
  /** Compliance duration percent */
  complianceDurationPercent?: number | null;
  /** Compliance distance percent */
  complianceDistancePercent?: number | null;
  /** Compliance TSS percent */
  complianceTssPercent?: number | null;
  /** RPE */
  rpe?: number | null;
  /** Feeling */
  feeling?: number | null;
  /** Workout structure */
  structure: WorkoutStructure;
  /** Order on day */
  orderOnDay?: number | null;
  /** Personal record count */
  personalRecordCount?: number;
  /** Synced to */
  syncedTo?: string | null;
  /** Pool length option ID */
  poolLengthOptionId?: number | null;
  /** Workout sub type ID */
  workoutSubTypeId?: number | null;
};

export type StructuredWorkoutResponse = StructuredWorkoutRequest & {
  /** Workout ID */
  workoutId: number;
  /** Shared workout information key */
  sharedWorkoutInformationKey?: string;
  /** Shared workout information expire key */
  sharedWorkoutInformationExpireKey?: string;
};

export type CreateStructuredWorkoutRequest = {
  /** Athlete ID */
  athleteId: number;
  /** Workout title */
  title: string;
  /** Workout type ID */
  workoutTypeValueId: number;
  /** Workout date */
  workoutDay: string;
  /** Workout structure */
  structure: WorkoutStructureValueObject;
  /** Optional workout metadata */
  metadata?: {
    /** Workout code */
    code?: string;
    /** Workout description */
    description?: string;
    /** User tags */
    userTags?: string;
    /** Coach comments */
    coachComments?: string;
    /** Public setting value */
    publicSettingValue?: number;
    /** Athlete weight in kg for metric calculations */
    athleteWeight?: number;
    /** Activity type for metric calculations */
    activityType?: 'BIKE' | 'RUN' | 'SWIM' | 'OTHER';
    /** Planned metrics */
    plannedMetrics?: {
      totalTimePlanned?: number;
      tssPlanned?: number;
      ifPlanned?: number;
      velocityPlanned?: number;
      caloriesPlanned?: number;
      distancePlanned?: number;
      elevationGainPlanned?: number;
      energyPlanned?: number;
    };
    /** Equipment */
    equipment?: {
      bikeId?: number;
      shoeId?: number;
    };
  };
};

export type CreateStructuredWorkoutResponse = {
  /** Success status */
  success: boolean;
  /** Workout ID if successful */
  workoutId?: number;
  /** Response message */
  message: string;
  /** Errors if any */
  errors?: string[];
  /** Full workout data if successful */
  workout?: StructuredWorkoutResponse;
};

export type ApiResponse<T = unknown> = {
  /** Response data */
  data: T;
  /** Response status */
  status: number;
  /** Response message */
  message?: string;
};

export type RequestOptions = {
  /** Request headers */
  headers?: Record<string, string>;
  /** Request timeout */
  timeout?: number;
  /** Retry configuration */
  retry?: RetryConfig;
};

export type RetryConfig = {
  /** Number of retries */
  attempts: number;
  /** Delay between retries in milliseconds */
  delay: number;
  /** Backoff factor */
  backoff: number;
};

/**
 * Import and re-export configuration types from config module
 */
import type { TrainingPeaksSDKConfig } from '@/config';
export type { TrainingPeaksSDKConfig } from '@/config';

export type TrainingPeaksClientConfig = {
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
};
