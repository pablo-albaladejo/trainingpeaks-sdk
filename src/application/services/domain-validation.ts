import type { WorkoutStructure } from '@/domain/value-objects/workout-structure-simple';

// Workout entity validation
export type ValidateWorkoutId = (id: string) => void;
export type ValidateWorkoutName = (name: string) => void;
export type ValidateWorkoutDate = (date: Date) => void;
export type ValidateWorkoutDuration = (duration: number) => void;
export type ValidateWorkoutDistance = (distance?: number) => void;
export type ValidateWorkoutStructure = (
  duration: number,
  structure?: WorkoutStructure
) => void;

// User entity validation
export type ValidateUserId = (id: string) => void;
export type ValidateUserName = (name: string) => void;

// AuthToken entity validation
export type ValidateAccessToken = (accessToken: string) => void;
export type ValidateTokenType = (tokenType: string) => void;
export type ValidateExpiresAt = (expiresAt: Date) => void;

// WorkoutLength value object validation
export type ValidateWorkoutLengthValue = (value: number) => void;
export type ValidateWorkoutLengthUnit = (unit: string) => void;

// WorkoutTarget value object validation
export type ValidateWorkoutTargetValues = (
  minValue: number,
  maxValue: number
) => void;

// WorkoutStep value object validation
export type ValidateWorkoutStepName = (name: string) => void;
export type ValidateWorkoutStepTargets = (
  targets: unknown[],
  intensityClass: string
) => void;
export type ValidateWorkoutStepIntensityClass = (
  intensityClass: string
) => void;

// WorkoutFile value object validation
export type ValidateWorkoutFileName = (fileName: string) => void;
export type ValidateWorkoutFileContent = (content: string) => void;
export type ValidateWorkoutFileMimeType = (mimeType: string) => void;
export type ValidateWorkoutFileSize = (content: string) => void;
export type ValidateWorkoutFileExtension = (fileName: string) => void;

// Credentials value object validation
export type ValidateUsername = (username: string) => void;
export type ValidatePassword = (password: string) => void;
