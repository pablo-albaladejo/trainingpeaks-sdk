/**
 * Public API Types
 * Type definitions for external API interactions
 */

export enum ElementType {
  STEP = 'step',
  REPETITION = 'repetition',
}

export enum LengthUnit {
  SECOND = 'second',
  MINUTE = 'minute',
  HOUR = 'hour',
  REPETITION = 'repetition',
  METER = 'meter',
  KILOMETER = 'kilometer',
  MILE = 'mile',
}

export enum LengthMetric {
  DURATION = 'duration',
  DISTANCE = 'distance',
}

export enum IntensityMetric {
  PERCENT_OF_THRESHOLD_PACE = 'percentOfThresholdPace',
  PERCENT_OF_THRESHOLD_POWER = 'percentOfThresholdPower',
  HEART_RATE = 'heartRate',
  POWER = 'power',
  PACE = 'pace',
  SPEED = 'speed',
}

export enum IntensityTargetType {
  TARGET = 'target',
  RANGE = 'range',
}

export enum IntensityClass {
  ACTIVE = 'active',
  REST = 'rest',
  WARM_UP = 'warmUp',
  COOL_DOWN = 'coolDown',
}

export enum Difficulty {
  EASY = 'easy',
  MODERATE = 'moderate',
  HARD = 'hard',
  EXTREME = 'extreme',
}

export enum ActivityType {
  RUN = 'run',
  BIKE = 'bike',
  SWIM = 'swim',
  STRENGTH = 'strength',
  OTHER = 'other',
}

export enum AuthMethod {
  WEB = 'web',
  API = 'api',
}

export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  ERROR = 'ERROR',
}

export enum OperationType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  GET_CURRENT_USER = 'getCurrentUser',
  GET_CURRENT_TOKEN = 'getCurrentToken',
  GET_USER_ID = 'getUserId',
}

export enum WorkoutTypeInternal {
  STRUCTURED = 'structured',
  FILE = 'file',
  MANUAL = 'manual',
  FILE_BASED = 'file-based',
  SIMPLE = 'simple',
}

export enum SortOption {
  DATE = 'date',
  NAME = 'name',
  DURATION = 'duration',
  DISTANCE = 'distance',
}

export enum LoginMethod {
  WEB = 'web',
  CREDENTIALS = 'credentials',
}

export enum SimpleWorkoutElementType {
  WARMUP = 'warmup',
  INTERVAL = 'interval',
  RECOVERY = 'recovery',
  COOLDOWN = 'cooldown',
  STEADY = 'steady',
}

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
  authMethod?: AuthMethod;
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

export type WorkoutStructureStep = {
  /** Step name */
  name: string;
  /** Step duration/length */
  length: WorkoutLength;
  /** Intensity targets */
  targets: WorkoutTarget[];
  /** Intensity class */
  intensityClass: IntensityClass;
  /** Whether duration is open */
  openDuration: boolean;
};

export type WorkoutLength = {
  /** Length value */
  value: number;
  /** Length unit */
  unit: LengthUnit;
};

export type WorkoutTarget = {
  /** Minimum target value */
  minValue: number;
  /** Maximum target value */
  maxValue: number;
};

export type WorkoutStructureElement = {
  /** Element type */
  type: ElementType;
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
  primaryLengthMetric: LengthMetric;
  /** Primary intensity metric */
  primaryIntensityMetric: IntensityMetric;
  /** Primary intensity target type */
  primaryIntensityTargetOrRange: IntensityTargetType;
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
    activityType?: WorkoutType;
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

export type SimpleWorkoutStructureElement = {
  type: ElementType;
  length: WorkoutLength;
  steps: WorkoutStructureStep[];
};

export type SimpleWorkoutStructure = {
  structure: SimpleWorkoutStructureElement[];
  primaryLengthMetric: LengthMetric;
  primaryIntensityMetric: IntensityMetric;
  intensityTargetType: IntensityTargetType;
};

export type CreateSimpleStructuredWorkoutRequest = {
  name: string;
  description?: string;
  structure: SimpleWorkoutStructure;
  tags?: string[];
  notes?: string;
  targetDate?: Date;
  estimatedDuration?: number;
  estimatedDistance?: number;
  estimatedCalories?: number;
  difficulty?: Difficulty;
  activityType?: ActivityType;
  equipment?: string[];
  location?: string;
  weatherConditions?: string;
  personalBest?: boolean;
  coachNotes?: string;
  publiclyVisible?: boolean;
  allowComments?: boolean;
  category?: string;
  subcategory?: string;
  season?: string;
  trainingPhase?: string;
  intensityZone?: number;
  rpeScale?: number;
  heartRateZones?: number[];
  powerZones?: number[];
  paceZones?: number[];
  customFields?: Record<string, unknown>;
};

export type TrainingPeaksClientConfig = {
  /** Base URL for TrainingPeaks */
  baseUrl?: string;
  /** Authentication method */
  authMethod?: AuthMethod;
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
  sdkConfig?: Partial<TrainingPeaksConfig>;
};

export type WorkoutStructureValueObject = {
  structure: WorkoutStructureElement[];
  polyline: number[][];
  primaryLengthMetric: LengthMetric;
  primaryIntensityMetric: IntensityMetric;
  primaryIntensityTargetOrRange: IntensityTargetType;
};
