/**
 * Workout Validation Service Implementation
 * Provides comprehensive validation for all workout operations
 */

import type {
  ValidateAthleteId,
  ValidateFileUpload,
  ValidateListWorkoutsFilters,
  ValidatePagination,
  ValidateStructuredWorkoutRequest,
  ValidateWorkoutCoachComments,
  ValidateWorkoutComments,
  ValidateWorkoutData,
  ValidateWorkoutDateRange,
  ValidateWorkoutDescription,
  ValidateWorkoutDistance,
  ValidateWorkoutDuration,
  ValidateWorkoutEquipment,
  ValidateWorkoutFile,
  ValidateWorkoutFileConstraints,
  ValidateWorkoutId,
  ValidateWorkoutMetadata,
  ValidateWorkoutName,
  ValidateWorkoutPlannedMetrics,
  ValidateWorkoutPublicSettings,
  ValidateWorkoutSearch,
  ValidateWorkoutStatsFilters,
  ValidateWorkoutSteps,
  ValidateWorkoutStructure,
  ValidateWorkoutTags,
  ValidateWorkoutTargets,
  ValidateWorkoutType,
  ValidateWorkoutUpdate,
  ValidateWorkoutUpload,
  ValidateWorkoutUserTags,
} from '@/application/services/workout-validation';
import type { WorkoutFile, WorkoutStructure } from '@/domain';
import {
  WorkoutFileProcessingError,
  WorkoutQuotaExceededError,
  WorkoutValidationError,
} from '@/domain/errors/workout-errors';
import type { CreateStructuredWorkoutRequest, WorkoutData } from '@/types';

// Validation constants
const VALIDATION_LIMITS = {
  WORKOUT_ID_MAX_LENGTH: 100,
  WORKOUT_NAME_MAX_LENGTH: 255,
  WORKOUT_DESCRIPTION_MAX_LENGTH: 1000,
  WORKOUT_DURATION_MAX_SECONDS: 86400, // 24 hours
  WORKOUT_DISTANCE_MAX_METERS: 1000000, // 1000km
  FILE_SIZE_MAX_BYTES: 50 * 1024 * 1024, // 50MB
  TAGS_MAX_COUNT: 20,
  TAG_MAX_LENGTH: 50,
  COMMENTS_MAX_COUNT: 100,
  COMMENT_MAX_LENGTH: 500,
  USER_TAGS_MAX_LENGTH: 1000,
  COACH_COMMENTS_MAX_LENGTH: 2000,
  ATHLETE_ID_MAX_LENGTH: 50,
  WORKOUT_TYPE_MAX_LENGTH: 50,
  METADATA_MAX_KEYS: 50,
  METADATA_KEY_MAX_LENGTH: 50,
  METADATA_VALUE_MAX_LENGTH: 1000,
  PAGINATION_MAX_LIMIT: 1000,
  PAGINATION_MAX_OFFSET: 10000,
} as const;

const VALID_MIME_TYPES = [
  'application/gpx+xml',
  'application/tcx+xml',
  'application/fit',
  'text/csv',
  'application/json',
] as const;

const VALID_WORKOUT_TYPES = [
  'RUN',
  'BIKE',
  'SWIM',
  'WALK',
  'HIKE',
  'SKI',
  'SNOWBOARD',
  'SKATE',
  'ROW',
  'ELLIPTICAL',
  'OTHER',
] as const;

const VALID_PUBLIC_SETTINGS = [0, 1, 2] as const;

export const validateWorkoutId: ValidateWorkoutId = (
  workoutId: string
): void => {
  if (!workoutId || typeof workoutId !== 'string') {
    throw new WorkoutValidationError(
      'Workout ID is required and must be a string'
    );
  }

  if (workoutId.trim().length === 0) {
    throw new WorkoutValidationError('Workout ID cannot be empty');
  }

  if (workoutId.length > VALIDATION_LIMITS.WORKOUT_ID_MAX_LENGTH) {
    throw new WorkoutValidationError(
      `Workout ID cannot exceed ${VALIDATION_LIMITS.WORKOUT_ID_MAX_LENGTH} characters`
    );
  }

  // Validate format (alphanumeric, hyphens, underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(workoutId)) {
    throw new WorkoutValidationError('Workout ID contains invalid characters');
  }
};

export const validateWorkoutFile: ValidateWorkoutFile = (
  file: WorkoutFile
): void => {
  if (!file) {
    throw new WorkoutValidationError('Workout file is required');
  }

  if (!(file instanceof Object) || typeof file !== 'object') {
    throw new WorkoutValidationError('Invalid workout file object');
  }

  // Validate file properties
  if (!file.fileName || typeof file.fileName !== 'string') {
    throw new WorkoutValidationError(
      'File name is required and must be a string'
    );
  }

  if (!file.content || typeof file.content !== 'string') {
    throw new WorkoutValidationError(
      'File content is required and must be a string'
    );
  }

  if (!file.mimeType || typeof file.mimeType !== 'string') {
    throw new WorkoutValidationError(
      'MIME type is required and must be a string'
    );
  }

  // Validate file size
  const fileSize = Buffer.byteLength(file.content, 'utf8');
  if (fileSize > VALIDATION_LIMITS.FILE_SIZE_MAX_BYTES) {
    throw new WorkoutFileProcessingError(
      `File size exceeds maximum limit of ${VALIDATION_LIMITS.FILE_SIZE_MAX_BYTES} bytes`,
      file.mimeType
    );
  }

  // Validate MIME type
  if (!VALID_MIME_TYPES.includes(file.mimeType as any)) {
    throw new WorkoutFileProcessingError(
      `Unsupported file type: ${file.mimeType}`,
      file.mimeType
    );
  }
};

export const validateWorkoutData: ValidateWorkoutData = (
  workoutData: WorkoutData
): void => {
  if (!workoutData || typeof workoutData !== 'object') {
    throw new WorkoutValidationError(
      'Workout data is required and must be an object'
    );
  }

  // Validate required fields
  if (!workoutData.name) {
    throw new WorkoutValidationError('Workout name is required');
  }

  validateWorkoutName(workoutData.name);

  if (workoutData.description) {
    validateWorkoutDescription(workoutData.description);
  }

  if (workoutData.duration !== undefined) {
    validateWorkoutDuration(workoutData.duration);
  }

  if (workoutData.distance !== undefined) {
    validateWorkoutDistance(workoutData.distance);
  }

  if (workoutData.type) {
    validateWorkoutType(workoutData.type);
  }

  // Note: WorkoutData type doesn't include tags or metadata properties
  // These would be validated at a higher level if needed
};

export const validateListWorkoutsFilters: ValidateListWorkoutsFilters =
  (filters?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }): void => {
    if (!filters) {
      return; // Optional filters
    }

    if (typeof filters !== 'object') {
      throw new WorkoutValidationError('Filters must be an object');
    }

    validatePagination(filters.limit, filters.offset);

    if (filters.startDate && filters.endDate) {
      validateWorkoutDateRange(filters.startDate, filters.endDate);
    }

    if (filters.startDate && !(filters.startDate instanceof Date)) {
      throw new WorkoutValidationError(
        'Start date must be a valid Date object'
      );
    }

    if (filters.endDate && !(filters.endDate instanceof Date)) {
      throw new WorkoutValidationError('End date must be a valid Date object');
    }
  };

export const validateStructuredWorkoutRequest: ValidateStructuredWorkoutRequest =
  (request: CreateStructuredWorkoutRequest): void => {
    if (!request || typeof request !== 'object') {
      throw new WorkoutValidationError(
        'Structured workout request is required and must be an object'
      );
    }

    if (!request.title) {
      throw new WorkoutValidationError('Workout title is required');
    }

    validateWorkoutName(request.title);

    if (!request.athleteId) {
      throw new WorkoutValidationError('Athlete ID is required');
    }

    validateAthleteId(request.athleteId);

    if (!request.workoutTypeValueId) {
      throw new WorkoutValidationError('Workout type value ID is required');
    }

    if (!request.workoutDay) {
      throw new WorkoutValidationError('Workout day is required');
    }

    // TODO: Fix type validation for workoutDay
    // if (!(request.workoutDay instanceof Date)) {
    //   throw new WorkoutValidationError(
    //     'Workout day must be a valid Date object'
    //   );
    // }

    if (request.metadata) {
      validateWorkoutMetadata(request.metadata);
    }

    // TODO: Fix structure validation
    // if (request.structure) {
    //   validateWorkoutStructure(request.structure);
    // }
  };

export const validateWorkoutUpload: ValidateWorkoutUpload = (
  workoutData: WorkoutData,
  file?: WorkoutFile
): void => {
  validateWorkoutData(workoutData);

  if (file) {
    validateWorkoutFile(file);
  }
};

export const validateWorkoutSearch: ValidateWorkoutSearch = (query: {
  name?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): void => {
  if (!query || typeof query !== 'object') {
    throw new WorkoutValidationError('Search query must be an object');
  }

  if (query.name && typeof query.name !== 'string') {
    throw new WorkoutValidationError('Search name must be a string');
  }

  if (query.type) {
    validateWorkoutType(query.type);
  }

  validatePagination(query.limit, query.offset);

  if (query.startDate && query.endDate) {
    validateWorkoutDateRange(query.startDate, query.endDate);
  }
};

export const validateWorkoutStatsFilters: ValidateWorkoutStatsFilters =
  (filters?: {
    startDate?: Date;
    endDate?: Date;
    workoutType?: string;
  }): void => {
    if (!filters) {
      return; // Optional filters
    }

    if (typeof filters !== 'object') {
      throw new WorkoutValidationError('Stats filters must be an object');
    }

    if (filters.workoutType) {
      validateWorkoutType(filters.workoutType);
    }

    if (filters.startDate && filters.endDate) {
      validateWorkoutDateRange(filters.startDate, filters.endDate);
    }
  };

export const validateFileUpload: ValidateFileUpload = (
  filename: string,
  buffer: Buffer,
  mimeType: string
): void => {
  if (!filename || typeof filename !== 'string') {
    throw new WorkoutValidationError(
      'Filename is required and must be a string'
    );
  }

  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new WorkoutValidationError(
      'File buffer is required and must be a Buffer'
    );
  }

  if (!mimeType || typeof mimeType !== 'string') {
    throw new WorkoutValidationError(
      'MIME type is required and must be a string'
    );
  }

  validateWorkoutFileConstraints(filename, buffer.length, mimeType);
};

export const validateWorkoutUpdate: ValidateWorkoutUpdate = (
  workoutId: string,
  data: Partial<WorkoutData>
): void => {
  validateWorkoutId(workoutId);

  if (!data || typeof data !== 'object') {
    throw new WorkoutValidationError('Update data must be an object');
  }

  // Validate each field if provided
  if (data.name !== undefined) {
    validateWorkoutName(data.name);
  }

  if (data.description !== undefined) {
    validateWorkoutDescription(data.description);
  }

  if (data.duration !== undefined) {
    validateWorkoutDuration(data.duration);
  }

  if (data.distance !== undefined) {
    validateWorkoutDistance(data.distance);
  }

  if (data.type !== undefined) {
    validateWorkoutType(data.type);
  }

  // Note: WorkoutData type doesn't include tags or metadata properties
  // These would be validated at a higher level if needed
};

export const validateAthleteId: ValidateAthleteId = (
  athleteId: string | number
): void => {
  if (!athleteId) {
    throw new WorkoutValidationError('Athlete ID is required');
  }

  if (typeof athleteId === 'string') {
    if (athleteId.trim().length === 0) {
      throw new WorkoutValidationError('Athlete ID cannot be empty');
    }

    if (athleteId.length > VALIDATION_LIMITS.ATHLETE_ID_MAX_LENGTH) {
      throw new WorkoutValidationError(
        `Athlete ID cannot exceed ${VALIDATION_LIMITS.ATHLETE_ID_MAX_LENGTH} characters`
      );
    }
  } else if (typeof athleteId === 'number') {
    if (athleteId <= 0) {
      throw new WorkoutValidationError('Athlete ID must be a positive number');
    }
  } else {
    throw new WorkoutValidationError('Athlete ID must be a string or number');
  }
};

export const validateWorkoutType: ValidateWorkoutType = (
  type: string
): void => {
  if (!type || typeof type !== 'string') {
    throw new WorkoutValidationError(
      'Workout type is required and must be a string'
    );
  }

  if (type.trim().length === 0) {
    throw new WorkoutValidationError('Workout type cannot be empty');
  }

  if (type.length > VALIDATION_LIMITS.WORKOUT_TYPE_MAX_LENGTH) {
    throw new WorkoutValidationError(
      `Workout type cannot exceed ${VALIDATION_LIMITS.WORKOUT_TYPE_MAX_LENGTH} characters`
    );
  }

  if (!VALID_WORKOUT_TYPES.includes(type as any)) {
    throw new WorkoutValidationError(`Invalid workout type: ${type}`);
  }
};

export const validateWorkoutDateRange: ValidateWorkoutDateRange = (
  startDate: Date,
  endDate: Date
): void => {
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    throw new WorkoutValidationError('Start date must be a valid Date object');
  }

  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    throw new WorkoutValidationError('End date must be a valid Date object');
  }

  if (startDate >= endDate) {
    throw new WorkoutValidationError('Start date must be before end date');
  }

  const maxRangeDays = 365; // 1 year
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > maxRangeDays) {
    throw new WorkoutValidationError(
      `Date range cannot exceed ${maxRangeDays} days`
    );
  }
};

export const validatePagination: ValidatePagination = (
  limit?: number,
  offset?: number
): void => {
  if (limit !== undefined) {
    if (typeof limit !== 'number' || limit <= 0) {
      throw new WorkoutValidationError('Limit must be a positive number');
    }

    if (limit > VALIDATION_LIMITS.PAGINATION_MAX_LIMIT) {
      throw new WorkoutValidationError(
        `Limit cannot exceed ${VALIDATION_LIMITS.PAGINATION_MAX_LIMIT}`
      );
    }
  }

  if (offset !== undefined) {
    if (typeof offset !== 'number' || offset < 0) {
      throw new WorkoutValidationError('Offset must be a non-negative number');
    }

    if (offset > VALIDATION_LIMITS.PAGINATION_MAX_OFFSET) {
      throw new WorkoutValidationError(
        `Offset cannot exceed ${VALIDATION_LIMITS.PAGINATION_MAX_OFFSET}`
      );
    }
  }
};

export const validateWorkoutMetadata: ValidateWorkoutMetadata = (
  metadata: Record<string, unknown>
): void => {
  if (!metadata || typeof metadata !== 'object') {
    throw new WorkoutValidationError('Metadata must be an object');
  }

  const keys = Object.keys(metadata);
  if (keys.length > VALIDATION_LIMITS.METADATA_MAX_KEYS) {
    throw new WorkoutValidationError(
      `Metadata cannot have more than ${VALIDATION_LIMITS.METADATA_MAX_KEYS} keys`
    );
  }

  for (const [key, value] of Object.entries(metadata)) {
    if (key.length > VALIDATION_LIMITS.METADATA_KEY_MAX_LENGTH) {
      throw new WorkoutValidationError(
        `Metadata key cannot exceed ${VALIDATION_LIMITS.METADATA_KEY_MAX_LENGTH} characters`
      );
    }

    if (
      typeof value === 'string' &&
      value.length > VALIDATION_LIMITS.METADATA_VALUE_MAX_LENGTH
    ) {
      throw new WorkoutValidationError(
        `Metadata value cannot exceed ${VALIDATION_LIMITS.METADATA_VALUE_MAX_LENGTH} characters`
      );
    }
  }
};

export const validateWorkoutStructure: ValidateWorkoutStructure = (
  duration: number,
  structure?: WorkoutStructure
): void => {
  if (structure) {
    // Check if structure has the required properties
    if (!structure.structure || !Array.isArray(structure.structure)) {
      return; // Invalid structure, but we don't throw - just skip validation
    }

    const structureDuration = structure.structure.reduce(
      (total: number, element: any) => {
        return total + (element.end - element.begin);
      },
      0
    );

    if (duration !== structureDuration) {
      throw new WorkoutValidationError(
        `Workout duration (${duration}s) doesn't match structure duration (${structureDuration}s)`
      );
    }
  }
};

export const validateWorkoutTargets: ValidateWorkoutTargets = (
  targets: {
    minValue: number;
    maxValue: number;
    unit: string;
  }[]
): void => {
  if (!Array.isArray(targets)) {
    throw new WorkoutValidationError('Workout targets must be an array');
  }

  for (const target of targets) {
    if (!target || typeof target !== 'object') {
      throw new WorkoutValidationError('Workout target must be an object');
    }

    if (typeof target.minValue !== 'number' || target.minValue < 0) {
      throw new WorkoutValidationError(
        'Target minValue must be a non-negative number'
      );
    }

    if (typeof target.maxValue !== 'number' || target.maxValue < 0) {
      throw new WorkoutValidationError(
        'Target maxValue must be a non-negative number'
      );
    }

    if (target.minValue > target.maxValue) {
      throw new WorkoutValidationError(
        'Target minValue cannot be greater than maxValue'
      );
    }

    if (!target.unit || typeof target.unit !== 'string') {
      throw new WorkoutValidationError(
        'Target unit is required and must be a string'
      );
    }
  }
};

export const validateWorkoutSteps: ValidateWorkoutSteps = (
  steps: {
    name: string;
    length: { value: number; unit: string };
    targets: { minValue: number; maxValue: number }[];
    intensityClass: string;
  }[]
): void => {
  if (!Array.isArray(steps)) {
    throw new WorkoutValidationError('Workout steps must be an array');
  }

  for (const step of steps) {
    if (!step || typeof step !== 'object') {
      throw new WorkoutValidationError('Workout step must be an object');
    }

    if (!step.name || typeof step.name !== 'string') {
      throw new WorkoutValidationError(
        'Step name is required and must be a string'
      );
    }

    if (!step.length || typeof step.length !== 'object') {
      throw new WorkoutValidationError('Step length must be an object');
    }

    if (typeof step.length.value !== 'number' || step.length.value <= 0) {
      throw new WorkoutValidationError(
        'Step length value must be a positive number'
      );
    }

    if (!step.length.unit || typeof step.length.unit !== 'string') {
      throw new WorkoutValidationError(
        'Step length unit is required and must be a string'
      );
    }

    if (!Array.isArray(step.targets)) {
      throw new WorkoutValidationError('Step targets must be an array');
    }

    // TODO: Fix targets validation - type mismatch
    // validateWorkoutTargets(step.targets);

    if (!step.intensityClass || typeof step.intensityClass !== 'string') {
      throw new WorkoutValidationError(
        'Step intensity class is required and must be a string'
      );
    }
  }
};

export const validateWorkoutFileConstraints: ValidateWorkoutFileConstraints = (
  filename: string,
  size: number,
  mimeType: string
): void => {
  if (!filename || typeof filename !== 'string') {
    throw new WorkoutValidationError(
      'Filename is required and must be a string'
    );
  }

  if (filename.trim().length === 0) {
    throw new WorkoutValidationError('Filename cannot be empty');
  }

  if (typeof size !== 'number' || size <= 0) {
    throw new WorkoutValidationError('File size must be a positive number');
  }

  if (size > VALIDATION_LIMITS.FILE_SIZE_MAX_BYTES) {
    throw new WorkoutQuotaExceededError(
      'file_size',
      VALIDATION_LIMITS.FILE_SIZE_MAX_BYTES,
      size
    );
  }

  if (!mimeType || typeof mimeType !== 'string') {
    throw new WorkoutValidationError(
      'MIME type is required and must be a string'
    );
  }

  if (!VALID_MIME_TYPES.includes(mimeType as any)) {
    throw new WorkoutFileProcessingError(
      `Unsupported file type: ${mimeType}`,
      mimeType
    );
  }
};

export const validateWorkoutName: ValidateWorkoutName = (
  name: string
): void => {
  if (!name || typeof name !== 'string') {
    throw new WorkoutValidationError(
      'Workout name is required and must be a string'
    );
  }

  if (name.trim().length === 0) {
    throw new WorkoutValidationError('Workout name cannot be empty');
  }

  if (name.length > VALIDATION_LIMITS.WORKOUT_NAME_MAX_LENGTH) {
    throw new WorkoutValidationError(
      `Workout name cannot exceed ${VALIDATION_LIMITS.WORKOUT_NAME_MAX_LENGTH} characters`
    );
  }
};

export const validateWorkoutDescription: ValidateWorkoutDescription = (
  description: string
): void => {
  if (!description || typeof description !== 'string') {
    throw new WorkoutValidationError('Workout description must be a string');
  }

  if (description.length > VALIDATION_LIMITS.WORKOUT_DESCRIPTION_MAX_LENGTH) {
    throw new WorkoutValidationError(
      `Workout description cannot exceed ${VALIDATION_LIMITS.WORKOUT_DESCRIPTION_MAX_LENGTH} characters`
    );
  }
};

export const validateWorkoutDuration: ValidateWorkoutDuration = (
  duration: number
): void => {
  if (typeof duration !== 'number') {
    throw new WorkoutValidationError('Workout duration must be a number');
  }

  if (duration < 0) {
    throw new WorkoutValidationError('Workout duration cannot be negative');
  }

  if (duration > VALIDATION_LIMITS.WORKOUT_DURATION_MAX_SECONDS) {
    throw new WorkoutValidationError(
      `Workout duration cannot exceed ${VALIDATION_LIMITS.WORKOUT_DURATION_MAX_SECONDS} seconds`
    );
  }
};

export const validateWorkoutDistance: ValidateWorkoutDistance = (
  distance?: number
): void => {
  if (distance === undefined) {
    return; // Optional parameter, no validation needed
  }

  if (typeof distance !== 'number') {
    throw new WorkoutValidationError('Workout distance must be a number');
  }

  if (distance < 0) {
    throw new WorkoutValidationError('Workout distance cannot be negative');
  }

  if (distance > VALIDATION_LIMITS.WORKOUT_DISTANCE_MAX_METERS) {
    throw new WorkoutValidationError(
      `Workout distance cannot exceed ${VALIDATION_LIMITS.WORKOUT_DISTANCE_MAX_METERS} meters`
    );
  }
};

export const validateWorkoutTags: ValidateWorkoutTags = (
  tags: string[]
): void => {
  if (!Array.isArray(tags)) {
    throw new WorkoutValidationError('Workout tags must be an array');
  }

  if (tags.length > VALIDATION_LIMITS.TAGS_MAX_COUNT) {
    throw new WorkoutValidationError(
      `Workout tags cannot exceed ${VALIDATION_LIMITS.TAGS_MAX_COUNT} tags`
    );
  }

  for (const tag of tags) {
    if (typeof tag !== 'string') {
      throw new WorkoutValidationError('All workout tags must be strings');
    }

    if (tag.trim().length === 0) {
      throw new WorkoutValidationError('Workout tag cannot be empty');
    }

    if (tag.length > VALIDATION_LIMITS.TAG_MAX_LENGTH) {
      throw new WorkoutValidationError(
        `Workout tag cannot exceed ${VALIDATION_LIMITS.TAG_MAX_LENGTH} characters`
      );
    }
  }
};

export const validateWorkoutEquipment: ValidateWorkoutEquipment = (equipment: {
  bikeId?: string;
  shoeId?: string;
  [key: string]: unknown;
}): void => {
  if (!equipment || typeof equipment !== 'object') {
    throw new WorkoutValidationError('Workout equipment must be an object');
  }

  if (equipment.bikeId && typeof equipment.bikeId !== 'string') {
    throw new WorkoutValidationError('Bike ID must be a string');
  }

  if (equipment.shoeId && typeof equipment.shoeId !== 'string') {
    throw new WorkoutValidationError('Shoe ID must be a string');
  }
};

export const validateWorkoutPlannedMetrics: ValidateWorkoutPlannedMetrics =
  (metrics: {
    distancePlanned?: number;
    totalTimePlanned?: number;
    caloriesPlanned?: number;
    tssPlanned?: number;
  }): void => {
    if (!metrics || typeof metrics !== 'object') {
      throw new WorkoutValidationError('Planned metrics must be an object');
    }

    if (metrics.distancePlanned !== undefined) {
      validateWorkoutDistance(metrics.distancePlanned);
    }

    if (metrics.totalTimePlanned !== undefined) {
      validateWorkoutDuration(metrics.totalTimePlanned);
    }

    if (metrics.caloriesPlanned !== undefined) {
      if (
        typeof metrics.caloriesPlanned !== 'number' ||
        metrics.caloriesPlanned < 0
      ) {
        throw new WorkoutValidationError(
          'Planned calories must be a non-negative number'
        );
      }
    }

    if (metrics.tssPlanned !== undefined) {
      if (typeof metrics.tssPlanned !== 'number' || metrics.tssPlanned < 0) {
        throw new WorkoutValidationError(
          'Planned TSS must be a non-negative number'
        );
      }
    }
  };

export const validateWorkoutPublicSettings: ValidateWorkoutPublicSettings = (
  publicSetting: number
): void => {
  if (typeof publicSetting !== 'number') {
    throw new WorkoutValidationError('Public setting must be a number');
  }

  if (!VALID_PUBLIC_SETTINGS.includes(publicSetting as any)) {
    throw new WorkoutValidationError(
      `Invalid public setting: ${publicSetting}`
    );
  }
};

export const validateWorkoutComments: ValidateWorkoutComments = (
  comments: string[]
): void => {
  if (!Array.isArray(comments)) {
    throw new WorkoutValidationError('Workout comments must be an array');
  }

  if (comments.length > VALIDATION_LIMITS.COMMENTS_MAX_COUNT) {
    throw new WorkoutValidationError(
      `Workout comments cannot exceed ${VALIDATION_LIMITS.COMMENTS_MAX_COUNT} comments`
    );
  }

  for (const comment of comments) {
    if (typeof comment !== 'string') {
      throw new WorkoutValidationError('All workout comments must be strings');
    }

    if (comment.length > VALIDATION_LIMITS.COMMENT_MAX_LENGTH) {
      throw new WorkoutValidationError(
        `Workout comment cannot exceed ${VALIDATION_LIMITS.COMMENT_MAX_LENGTH} characters`
      );
    }
  }
};

export const validateWorkoutUserTags: ValidateWorkoutUserTags = (
  userTags: string
): void => {
  if (typeof userTags !== 'string') {
    throw new WorkoutValidationError('User tags must be a string');
  }

  if (userTags.length > VALIDATION_LIMITS.USER_TAGS_MAX_LENGTH) {
    throw new WorkoutValidationError(
      `User tags cannot exceed ${VALIDATION_LIMITS.USER_TAGS_MAX_LENGTH} characters`
    );
  }
};

export const validateWorkoutCoachComments: ValidateWorkoutCoachComments = (
  coachComments: string
): void => {
  if (typeof coachComments !== 'string') {
    throw new WorkoutValidationError('Coach comments must be a string');
  }

  if (coachComments.length > VALIDATION_LIMITS.COACH_COMMENTS_MAX_LENGTH) {
    throw new WorkoutValidationError(
      `Coach comments cannot exceed ${VALIDATION_LIMITS.COACH_COMMENTS_MAX_LENGTH} characters`
    );
  }
};
