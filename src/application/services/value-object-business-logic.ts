import type { WorkoutLengthUnit } from '@/domain';

// WorkoutLength business logic
export type ConvertLengthToSeconds = (
  value: number,
  unit: WorkoutLengthUnit
) => number | null;
export type ConvertLengthToMeters = (
  value: number,
  unit: WorkoutLengthUnit
) => number | null;
export type IsTimeUnit = (unit: WorkoutLengthUnit) => boolean;
export type IsDistanceUnit = (unit: WorkoutLengthUnit) => boolean;
export type IsRepetitionUnit = (unit: WorkoutLengthUnit) => boolean;
export type FormatLengthToString = (
  value: number,
  unit: WorkoutLengthUnit
) => string;
export type EqualsWorkoutLength = (
  value1: number,
  unit1: WorkoutLengthUnit,
  value2: number,
  unit2: WorkoutLengthUnit
) => boolean;

// WorkoutTarget business logic
export type IsSingleTarget = (minValue: number, maxValue: number) => boolean;
export type IsRangeTarget = (minValue: number, maxValue: number) => boolean;
export type GetTargetRangeWidth = (
  minValue: number,
  maxValue: number
) => number;
export type GetTargetMidpoint = (minValue: number, maxValue: number) => number;
export type IsValueInTargetRange = (
  value: number,
  minValue: number,
  maxValue: number
) => boolean;
export type FormatTargetToString = (
  minValue: number,
  maxValue: number
) => string;
export type EqualsWorkoutTarget = (
  minValue1: number,
  maxValue1: number,
  minValue2: number,
  maxValue2: number
) => boolean;

// WorkoutStep business logic
export type IsRestStep = (intensityClass: string) => boolean;
export type IsActiveStep = (intensityClass: string) => boolean;
export type IsWarmUpStep = (intensityClass: string) => boolean;
export type IsCoolDownStep = (intensityClass: string) => boolean;
export type GetPrimaryTarget = (targets: unknown[]) => unknown | null;
export type GetStepDurationInSeconds = (
  lengthValue: number,
  lengthUnit: WorkoutLengthUnit
) => number | null;
export type GetStepDistanceInMeters = (
  lengthValue: number,
  lengthUnit: WorkoutLengthUnit
) => number | null;
export type FormatStepToString = (
  name: string,
  intensityClass: string,
  lengthValue: number,
  lengthUnit: WorkoutLengthUnit,
  targets: unknown[]
) => string;
export type EqualsWorkoutStep = (step1: unknown, step2: unknown) => boolean;

// WorkoutFile business logic
export type GetFileExtension = (fileName: string) => string;
export type GetFileBaseName = (fileName: string) => string;
export type GetFileSize = (content: string) => number;
export type IsTcxFile = (fileName: string) => boolean;
export type IsGpxFile = (fileName: string) => boolean;
export type IsFitFile = (fileName: string) => boolean;
export type EqualsWorkoutFile = (
  fileName1: string,
  content1: string,
  mimeType1: string,
  fileName2: string,
  content2: string,
  mimeType2: string
) => boolean;

// WorkoutStructure business logic
export type GetTotalDuration = (structure: unknown[]) => number;
export type GetAllSteps = (structure: unknown[]) => unknown[];
export type GetActiveSteps = (
  structure: unknown[],
  isActiveStep: (step: unknown) => boolean
) => unknown[];
export type GetRestSteps = (
  structure: unknown[],
  isRestStep: (step: unknown) => boolean
) => unknown[];
export type GetElementsByType = (
  structure: unknown[],
  type: string
) => unknown[];
export type GetRepetitions = (structure: unknown[]) => unknown[];
export type GetStepElements = (structure: unknown[]) => unknown[];
export type IsTimeBasedStructure = (primaryLengthMetric: string) => boolean;
export type IsDistanceBasedStructure = (primaryLengthMetric: string) => boolean;
export type CalculateAverageIntensity = (
  structure: unknown[],
  getPrimaryTarget: (step: unknown) => unknown | null,
  getMidpoint: (target: unknown) => number
) => number;
export type FormatStructureToString = (
  totalDuration: number,
  stepCount: number,
  activeStepCount: number,
  repetitionCount: number
) => string;
export type EqualsWorkoutStructure = (
  structure1: unknown,
  structure2: unknown
) => boolean;
