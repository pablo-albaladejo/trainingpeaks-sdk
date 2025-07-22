import { AuthToken } from '@/domain/entities/auth-token';
import { User } from '@/domain/entities/user';
import { Workout } from '@/domain/entities/workout';
import type {
  WorkoutIntensityMetric,
  WorkoutIntensityTargetType,
  WorkoutLengthMetric,
} from '@/domain/schemas/workout-structure.schema';
import { Credentials } from '@/domain/value-objects/credentials';
import { WorkoutFile } from '@/domain/value-objects/workout-file';
import type { WorkoutLengthUnit } from '@/domain/value-objects/workout-length';
import { WorkoutLength } from '@/domain/value-objects/workout-length';
import type { WorkoutIntensityClass } from '@/domain/value-objects/workout-step';
import { WorkoutStep } from '@/domain/value-objects/workout-step';
import { WorkoutStructureElement } from '@/domain/value-objects/workout-structure-element';
import { WorkoutStructure } from '@/domain/value-objects/workout-structure-simple';
import { WorkoutTarget } from '@/domain/value-objects/workout-target';
import {
  validateAccessToken,
  validateExpiresAt,
  validatePassword,
  validateTokenType,
  validateUserId,
  validateUserName,
  validateUsername,
  validateWorkoutDate,
  validateWorkoutDistance,
  validateWorkoutDuration,
  validateWorkoutFileContent,
  validateWorkoutFileExtension,
  validateWorkoutFileMimeType,
  validateWorkoutFileName,
  validateWorkoutFileSize,
  validateWorkoutId,
  validateWorkoutLengthUnit,
  validateWorkoutLengthValue,
  validateWorkoutName,
  validateWorkoutStepIntensityClass,
  validateWorkoutStepName,
  validateWorkoutStepTargets,
  validateWorkoutStructure,
  validateWorkoutTargetValues,
} from '@/infrastructure/services/domain-validation';
import { calculateWorkoutDurationFromStructure } from '@/infrastructure/services/workout-business-logic';

// Workout entity factory
export const createWorkout = (
  id: string,
  name: string,
  description: string,
  date: Date,
  duration: number,
  distance?: number,
  activityType?: string,
  tags?: string[],
  fileContent?: string,
  fileName?: string,
  createdAt?: Date,
  updatedAt?: Date,
  structure?: WorkoutStructure
): Workout => {
  validateWorkoutId(id);
  validateWorkoutName(name);
  validateWorkoutDate(date);
  validateWorkoutDuration(duration);
  validateWorkoutDistance(distance);
  validateWorkoutStructure(duration, structure);

  return new Workout(
    id,
    name,
    description,
    date,
    duration,
    distance,
    activityType,
    tags,
    fileContent,
    fileName,
    createdAt || new Date(),
    updatedAt || new Date(),
    structure
  );
};

export const createWorkoutFromFile = (
  id: string,
  fileName: string,
  fileContent: string,
  metadata?: {
    name?: string;
    description?: string;
    date?: Date;
    duration?: number;
    distance?: number;
    activityType?: string;
    tags?: string[];
  }
): Workout => {
  return createWorkout(
    id,
    metadata?.name || fileName.replace(/\.[^/.]+$/, ''), // Remove extension
    metadata?.description || '',
    metadata?.date || new Date(),
    metadata?.duration || 0,
    metadata?.distance,
    metadata?.activityType,
    metadata?.tags,
    fileContent,
    fileName,
    new Date(),
    new Date()
  );
};

export const createStructuredWorkout = (
  id: string,
  name: string,
  description: string,
  date: Date,
  structure: WorkoutStructure,
  activityType?: string,
  tags?: string[],
  createdAt?: Date,
  updatedAt?: Date
): Workout => {
  const duration = calculateWorkoutDurationFromStructure(structure);

  return createWorkout(
    id,
    name,
    description,
    date,
    duration,
    undefined, // Distance calculated from structure if needed
    activityType,
    tags,
    undefined, // No file content for structured workouts
    undefined, // No file name for structured workouts
    createdAt || new Date(),
    updatedAt || new Date(),
    structure
  );
};

// User entity factory
export const createUser = (
  id: string,
  name: string,
  avatar?: string,
  preferences?: Record<string, unknown>
): User => {
  validateUserId(id);
  validateUserName(name);

  return new User(id, name, avatar, preferences);
};

// AuthToken entity factory
export const createAuthToken = (
  accessToken: string,
  tokenType: string,
  expiresAt: Date,
  refreshToken?: string
): AuthToken => {
  validateAccessToken(accessToken);
  validateTokenType(tokenType);
  validateExpiresAt(expiresAt);

  return new AuthToken(accessToken, tokenType, expiresAt, refreshToken);
};

export const createAuthTokenFromTimestamp = (
  accessToken: string,
  tokenType: string,
  expiresAtTimestamp: number,
  refreshToken?: string
): AuthToken => {
  return createAuthToken(
    accessToken,
    tokenType,
    new Date(expiresAtTimestamp),
    refreshToken
  );
};

// WorkoutLength value object factory
export const createWorkoutLength = (
  value: number,
  unit: WorkoutLengthUnit
): WorkoutLength => {
  validateWorkoutLengthValue(value);
  validateWorkoutLengthUnit(unit);

  return new WorkoutLength(value, unit);
};

// WorkoutTarget value object factory
export const createWorkoutTarget = (
  minValue: number,
  maxValue: number
): WorkoutTarget => {
  validateWorkoutTargetValues(minValue, maxValue);

  return new WorkoutTarget(minValue, maxValue);
};

export const createSingleWorkoutTarget = (value: number): WorkoutTarget => {
  return createWorkoutTarget(value, value);
};

// WorkoutStep value object factory
export const createWorkoutStep = (
  name: string,
  length: WorkoutLength,
  targets: WorkoutTarget[],
  intensityClass: WorkoutIntensityClass,
  openDuration: boolean = false
): WorkoutStep => {
  validateWorkoutStepName(name);
  validateWorkoutStepTargets(targets, intensityClass);
  validateWorkoutStepIntensityClass(intensityClass);

  return new WorkoutStep(name, length, targets, intensityClass, openDuration);
};

// WorkoutFile value object factory
export const createWorkoutFile = (
  fileName: string,
  content: string,
  mimeType: string
): WorkoutFile => {
  validateWorkoutFileName(fileName);
  validateWorkoutFileContent(content);
  validateWorkoutFileMimeType(mimeType);
  validateWorkoutFileSize(content);
  validateWorkoutFileExtension(fileName);

  return new WorkoutFile(fileName, content, mimeType);
};

export const createWorkoutFileFromBuffer = (
  fileName: string,
  buffer: Buffer,
  mimeType: string
): WorkoutFile => {
  return createWorkoutFile(fileName, buffer.toString('utf8'), mimeType);
};

// Credentials value object factory
export const createCredentials = (
  username: string,
  password: string
): Credentials => {
  validateUsername(username);
  validatePassword(password);

  return new Credentials(username, password);
};

// WorkoutStructureElement value object factory
export const createWorkoutStructureElement = (
  type: 'step' | 'repetition',
  length: WorkoutLength,
  steps: WorkoutStep[],
  begin: number,
  end: number
): WorkoutStructureElement => {
  return new WorkoutStructureElement(type, length, steps, begin, end);
};

// WorkoutStructure value object factory
export const createWorkoutStructure = (
  structure: WorkoutStructureElement[],
  polyline: number[][],
  primaryLengthMetric: WorkoutLengthMetric,
  primaryIntensityMetric: WorkoutIntensityMetric,
  primaryIntensityTargetOrRange: WorkoutIntensityTargetType
): WorkoutStructure => {
  return new WorkoutStructure(
    structure,
    polyline,
    primaryLengthMetric,
    primaryIntensityMetric,
    primaryIntensityTargetOrRange
  );
};
