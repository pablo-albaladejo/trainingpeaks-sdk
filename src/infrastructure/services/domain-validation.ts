import type {
  ValidateAccessToken,
  ValidateExpiresAt,
  ValidatePassword,
  ValidateTokenType,
  ValidateUserId,
  ValidateUserName,
  ValidateUsername,
  ValidateWorkoutDate,
  ValidateWorkoutDistance,
  ValidateWorkoutDuration,
  ValidateWorkoutFileContent,
  ValidateWorkoutFileExtension,
  ValidateWorkoutFileMimeType,
  ValidateWorkoutFileName,
  ValidateWorkoutFileSize,
  ValidateWorkoutId,
  ValidateWorkoutLengthUnit,
  ValidateWorkoutLengthValue,
  ValidateWorkoutName,
  ValidateWorkoutStepIntensityClass,
  ValidateWorkoutStepName,
  ValidateWorkoutStepTargets,
  ValidateWorkoutStructure,
  ValidateWorkoutTargetValues,
} from '@/application/services/domain-validation';
import { ValidationError } from '@/domain/errors';
import type { WorkoutStructure } from '@/domain/value-objects/workout-structure-simple';

// Workout entity validation implementations
export const validateWorkoutId: ValidateWorkoutId = (id: string): void => {
  if (!id || id.trim().length === 0) {
    throw new ValidationError('Workout ID cannot be empty');
  }
};

export const validateWorkoutName: ValidateWorkoutName = (
  name: string
): void => {
  if (!name || name.trim().length === 0) {
    throw new ValidationError('Workout name cannot be empty');
  }
  if (name.length > 255) {
    throw new ValidationError('Workout name cannot exceed 255 characters');
  }
};

export const validateWorkoutDate: ValidateWorkoutDate = (date: Date): void => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new ValidationError('Workout date must be a valid date');
  }
};

export const validateWorkoutDuration: ValidateWorkoutDuration = (
  duration: number
): void => {
  if (duration < 0) {
    throw new ValidationError('Workout duration cannot be negative');
  }
  if (duration > 86400) {
    throw new ValidationError('Workout duration cannot exceed 24 hours');
  }
};

export const validateWorkoutDistance: ValidateWorkoutDistance = (
  distance?: number
): void => {
  if (distance !== undefined) {
    if (distance < 0) {
      throw new ValidationError('Workout distance cannot be negative');
    }
    if (distance > 1000000) {
      throw new ValidationError('Workout distance cannot exceed 1000km');
    }
  }
};

export const validateWorkoutStructure: ValidateWorkoutStructure = (
  duration: number,
  structure?: WorkoutStructure
): void => {
  if (structure) {
    const structureDuration = structure.structure.reduce((total, element) => {
      return total + (element.end - element.begin);
    }, 0);

    if (duration !== structureDuration) {
      throw new ValidationError(
        `Workout duration (${duration}s) doesn't match structure duration (${structureDuration}s)`
      );
    }
  }
};

// User entity validation implementations
export const validateUserId: ValidateUserId = (id: string): void => {
  if (!id || id.trim().length === 0) {
    throw new ValidationError('User ID cannot be empty');
  }
};

export const validateUserName: ValidateUserName = (name: string): void => {
  if (!name || name.trim().length === 0) {
    throw new ValidationError('User name cannot be empty');
  }
};

// AuthToken entity validation implementations
export const validateAccessToken: ValidateAccessToken = (
  accessToken: string
): void => {
  if (!accessToken || accessToken.trim().length === 0) {
    throw new ValidationError('Access token cannot be empty');
  }
};

export const validateTokenType: ValidateTokenType = (
  tokenType: string
): void => {
  if (!tokenType || tokenType.trim().length === 0) {
    throw new ValidationError('Token type cannot be empty');
  }
};

export const validateExpiresAt: ValidateExpiresAt = (expiresAt: Date): void => {
  if (!(expiresAt instanceof Date) || isNaN(expiresAt.getTime())) {
    throw new ValidationError('Expires at must be a valid date');
  }
};

// WorkoutLength value object validation implementations
export const validateWorkoutLengthValue: ValidateWorkoutLengthValue = (
  value: number
): void => {
  if (value < 0) {
    throw new ValidationError('Workout length value must be non-negative');
  }
  if (!Number.isFinite(value)) {
    throw new ValidationError('Workout length value must be a finite number');
  }
};

export const validateWorkoutLengthUnit: ValidateWorkoutLengthUnit = (
  unit: string
): void => {
  const validUnits = [
    'second',
    'minute',
    'hour',
    'repetition',
    'meter',
    'kilometer',
    'mile',
  ];
  if (!validUnits.includes(unit)) {
    throw new ValidationError(`Invalid workout length unit: ${unit}`);
  }
};

// WorkoutTarget value object validation implementations
export const validateWorkoutTargetValues: ValidateWorkoutTargetValues = (
  minValue: number,
  maxValue: number
): void => {
  if (!Number.isFinite(minValue)) {
    throw new ValidationError(
      'Workout target minValue must be a finite number'
    );
  }
  if (!Number.isFinite(maxValue)) {
    throw new ValidationError(
      'Workout target maxValue must be a finite number'
    );
  }
  if (minValue < 0) {
    throw new ValidationError('Workout target minValue must be non-negative');
  }
  if (maxValue < 0) {
    throw new ValidationError('Workout target maxValue must be non-negative');
  }
  if (minValue > maxValue) {
    throw new ValidationError(
      `Workout target minValue (${minValue}) cannot be greater than maxValue (${maxValue})`
    );
  }
};

// WorkoutStep value object validation implementations
export const validateWorkoutStepName: ValidateWorkoutStepName = (
  name: string
): void => {
  if (!name || name.trim().length === 0) {
    throw new ValidationError('Workout step name cannot be empty');
  }
  if (name.length > 100) {
    throw new ValidationError('Workout step name cannot exceed 100 characters');
  }
};

export const validateWorkoutStepTargets: ValidateWorkoutStepTargets = (
  targets: unknown[],
  intensityClass: string
): void => {
  if (!Array.isArray(targets)) {
    throw new ValidationError('Workout step targets must be an array');
  }
  if (targets.length === 0 && intensityClass !== 'rest') {
    throw new ValidationError(
      'Workout step has no targets but is not a rest step'
    );
  }
};

export const validateWorkoutStepIntensityClass: ValidateWorkoutStepIntensityClass =
  (intensityClass: string): void => {
    const validClasses = ['active', 'rest', 'warmUp', 'coolDown'];
    if (!validClasses.includes(intensityClass)) {
      throw new ValidationError(
        `Invalid workout step intensity class: ${intensityClass}`
      );
    }
  };

// WorkoutFile value object validation implementations
export const validateWorkoutFileName: ValidateWorkoutFileName = (
  fileName: string
): void => {
  if (!fileName || fileName.trim().length === 0) {
    throw new ValidationError('File name cannot be empty');
  }
  if (fileName.length > 255) {
    throw new ValidationError('File name cannot exceed 255 characters');
  }
};

export const validateWorkoutFileContent: ValidateWorkoutFileContent = (
  content: string
): void => {
  if (!content || content.trim().length === 0) {
    throw new ValidationError('File content cannot be empty');
  }
};

export const validateWorkoutFileMimeType: ValidateWorkoutFileMimeType = (
  mimeType: string
): void => {
  if (!mimeType || mimeType.trim().length === 0) {
    throw new ValidationError('MIME type cannot be empty');
  }
  const validMimeTypes = [
    'application/gpx+xml',
    'application/tcx+xml',
    'application/fit',
    'text/csv',
    'application/json',
  ];
  if (!validMimeTypes.includes(mimeType)) {
    throw new ValidationError(
      `Unsupported MIME type: ${mimeType}. Supported types: ${validMimeTypes.join(', ')}`
    );
  }
};

export const validateWorkoutFileSize: ValidateWorkoutFileSize = (
  content: string
): void => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (content.length > maxSize) {
    throw new ValidationError(
      `File size exceeds maximum allowed size of ${maxSize} bytes`
    );
  }
};

export const validateWorkoutFileExtension: ValidateWorkoutFileExtension = (
  fileName: string
): void => {
  const allowedExtensions = ['.tcx', '.gpx', '.fit', '.xml'];
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) return;
  const extension = fileName.substring(lastDotIndex).toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    throw new ValidationError(
      `Unsupported file extension: ${extension}. Allowed extensions: ${allowedExtensions.join(', ')}`
    );
  }
};

// Credentials value object validation implementations
export const validateUsername: ValidateUsername = (username: string): void => {
  if (!username || username.trim().length === 0) {
    throw new ValidationError('Username cannot be empty');
  }
  if (username.length < 3) {
    throw new ValidationError('Username must be at least 3 characters long');
  }
};

export const validatePassword: ValidatePassword = (password: string): void => {
  if (!password || password.trim().length === 0) {
    throw new ValidationError('Password cannot be empty');
  }
  if (password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }
};
