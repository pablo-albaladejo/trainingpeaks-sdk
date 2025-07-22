import type {
  CalculateAverageIntensity,
  ConvertLengthToMeters,
  ConvertLengthToSeconds,
  EqualsWorkoutFile,
  EqualsWorkoutLength,
  EqualsWorkoutStep,
  EqualsWorkoutStructure,
  EqualsWorkoutTarget,
  FormatLengthToString,
  FormatStepToString,
  FormatStructureToString,
  FormatTargetToString,
  GetActiveSteps,
  GetAllSteps,
  GetElementsByType,
  GetFileBaseName,
  GetFileExtension,
  GetFileSize,
  GetPrimaryTarget,
  GetRepetitions,
  GetRestSteps,
  GetStepDistanceInMeters,
  GetStepDurationInSeconds,
  GetStepElements,
  GetTargetMidpoint,
  GetTargetRangeWidth,
  GetTotalDuration,
  IsActiveStep,
  IsCoolDownStep,
  IsDistanceBasedStructure,
  IsDistanceUnit,
  IsFitFile,
  IsGpxFile,
  IsRangeTarget,
  IsRepetitionUnit,
  IsRestStep,
  IsSingleTarget,
  IsTcxFile,
  IsTimeBasedStructure,
  IsTimeUnit,
  IsValueInTargetRange,
  IsWarmUpStep,
} from '@/application/services/value-object-business-logic';
import type { WorkoutLengthUnit } from '@/domain';

// WorkoutLength business logic implementations
export const convertLengthToSeconds: ConvertLengthToSeconds = (
  value: number,
  unit: WorkoutLengthUnit
): number | null => {
  switch (unit) {
    case 'second':
      return value;
    case 'minute':
      return value * 60;
    case 'hour':
      return value * 3600;
    default:
      return null;
  }
};

export const convertLengthToMeters: ConvertLengthToMeters = (
  value: number,
  unit: WorkoutLengthUnit
): number | null => {
  switch (unit) {
    case 'meter':
      return value;
    case 'kilometer':
      return value * 1000;
    case 'mile':
      return value * 1609.344;
    default:
      return null;
  }
};

export const isTimeUnit: IsTimeUnit = (unit: WorkoutLengthUnit): boolean => {
  return ['second', 'minute', 'hour'].includes(unit);
};

export const isDistanceUnit: IsDistanceUnit = (
  unit: WorkoutLengthUnit
): boolean => {
  return ['meter', 'kilometer', 'mile'].includes(unit);
};

export const isRepetitionUnit: IsRepetitionUnit = (
  unit: WorkoutLengthUnit
): boolean => {
  return unit === 'repetition';
};

export const formatLengthToString: FormatLengthToString = (
  value: number,
  unit: WorkoutLengthUnit
): string => {
  return `${value} ${unit}${value !== 1 ? 's' : ''}`;
};

export const equalsWorkoutLength: EqualsWorkoutLength = (
  value1: number,
  unit1: WorkoutLengthUnit,
  value2: number,
  unit2: WorkoutLengthUnit
): boolean => {
  return value1 === value2 && unit1 === unit2;
};

// WorkoutTarget business logic implementations
export const isSingleTarget: IsSingleTarget = (
  minValue: number,
  maxValue: number
): boolean => {
  return minValue === maxValue;
};

export const isRangeTarget: IsRangeTarget = (
  minValue: number,
  maxValue: number
): boolean => {
  return minValue < maxValue;
};

export const getTargetRangeWidth: GetTargetRangeWidth = (
  minValue: number,
  maxValue: number
): number => {
  return maxValue - minValue;
};

export const getTargetMidpoint: GetTargetMidpoint = (
  minValue: number,
  maxValue: number
): number => {
  return (minValue + maxValue) / 2;
};

export const isValueInTargetRange: IsValueInTargetRange = (
  value: number,
  minValue: number,
  maxValue: number
): boolean => {
  return value >= minValue && value <= maxValue;
};

export const formatTargetToString: FormatTargetToString = (
  minValue: number,
  maxValue: number
): string => {
  if (isSingleTarget(minValue, maxValue)) {
    return `${minValue}`;
  }
  return `${minValue}-${maxValue}`;
};

export const equalsWorkoutTarget: EqualsWorkoutTarget = (
  minValue1: number,
  maxValue1: number,
  minValue2: number,
  maxValue2: number
): boolean => {
  return minValue1 === minValue2 && maxValue1 === maxValue2;
};

// WorkoutStep business logic implementations
export const isRestStep: IsRestStep = (intensityClass: string): boolean => {
  return intensityClass === 'rest';
};

export const isActiveStep: IsActiveStep = (intensityClass: string): boolean => {
  return intensityClass === 'active';
};

export const isWarmUpStep: IsWarmUpStep = (intensityClass: string): boolean => {
  return intensityClass === 'warmUp';
};

export const isCoolDownStep: IsCoolDownStep = (
  intensityClass: string
): boolean => {
  return intensityClass === 'coolDown';
};

export const getPrimaryTarget: GetPrimaryTarget = (
  targets: unknown[]
): unknown | null => {
  return targets.length > 0 ? targets[0] || null : null;
};

export const getStepDurationInSeconds: GetStepDurationInSeconds = (
  lengthValue: number,
  lengthUnit: WorkoutLengthUnit
): number | null => {
  return convertLengthToSeconds(lengthValue, lengthUnit);
};

export const getStepDistanceInMeters: GetStepDistanceInMeters = (
  lengthValue: number,
  lengthUnit: WorkoutLengthUnit
): number | null => {
  return convertLengthToMeters(lengthValue, lengthUnit);
};

export const formatStepToString: FormatStepToString = (
  name: string,
  intensityClass: string,
  lengthValue: number,
  lengthUnit: WorkoutLengthUnit,
  targets: unknown[]
): string => {
  const duration = getStepDurationInSeconds(lengthValue, lengthUnit);
  const distance = getStepDistanceInMeters(lengthValue, lengthUnit);

  let description = `${name} (${intensityClass})`;

  if (duration !== null) {
    description += ` - ${duration}s`;
  } else if (distance !== null) {
    description += ` - ${distance}m`;
  } else {
    description += ` - ${formatLengthToString(lengthValue, lengthUnit)}`;
  }

  if (targets.length > 0) {
    description += ` @ ${targets.map((t: any) => `${t.minValue}-${t.maxValue}`).join(', ')}`;
  }

  return description;
};

export const equalsWorkoutStep: EqualsWorkoutStep = (
  step1: unknown,
  step2: unknown
): boolean => {
  // This is a simplified implementation - in practice you'd need to compare all properties
  return JSON.stringify(step1) === JSON.stringify(step2);
};

// WorkoutFile business logic implementations
export const getFileExtension: GetFileExtension = (
  fileName: string
): string => {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  return fileName.substring(lastDotIndex).toLowerCase();
};

export const getFileBaseName: GetFileBaseName = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) return fileName;
  return fileName.substring(0, lastDotIndex);
};

export const getFileSize: GetFileSize = (content: string): number => {
  return Buffer.byteLength(content, 'utf8');
};

export const isTcxFile: IsTcxFile = (fileName: string): boolean => {
  return getFileExtension(fileName) === '.tcx';
};

export const isGpxFile: IsGpxFile = (fileName: string): boolean => {
  return getFileExtension(fileName) === '.gpx';
};

export const isFitFile: IsFitFile = (fileName: string): boolean => {
  return getFileExtension(fileName) === '.fit';
};

export const equalsWorkoutFile: EqualsWorkoutFile = (
  fileName1: string,
  content1: string,
  mimeType1: string,
  fileName2: string,
  content2: string,
  mimeType2: string
): boolean => {
  return (
    fileName1 === fileName2 && content1 === content2 && mimeType1 === mimeType2
  );
};

// WorkoutStructure business logic implementations
export const getTotalDuration: GetTotalDuration = (
  structure: unknown[]
): number => {
  return (structure as any[]).reduce((total, element) => {
    return total + (element.end - element.begin);
  }, 0);
};

export const getAllSteps: GetAllSteps = (structure: unknown[]): unknown[] => {
  return (structure as any[]).flatMap((element) => element.steps);
};

export const getActiveSteps: GetActiveSteps = (
  structure: unknown[],
  isActiveStep: (step: unknown) => boolean
): unknown[] => {
  return getAllSteps(structure).filter(isActiveStep);
};

export const getRestSteps: GetRestSteps = (
  structure: unknown[],
  isRestStep: (step: unknown) => boolean
): unknown[] => {
  return getAllSteps(structure).filter(isRestStep);
};

export const getElementsByType: GetElementsByType = (
  structure: unknown[],
  type: string
): unknown[] => {
  return (structure as any[]).filter((element) => element.type === type);
};

export const getRepetitions: GetRepetitions = (
  structure: unknown[]
): unknown[] => {
  return getElementsByType(structure, 'repetition');
};

export const getStepElements: GetStepElements = (
  structure: unknown[]
): unknown[] => {
  return getElementsByType(structure, 'step');
};

export const isTimeBasedStructure: IsTimeBasedStructure = (
  primaryLengthMetric: string
): boolean => {
  return primaryLengthMetric === 'duration';
};

export const isDistanceBasedStructure: IsDistanceBasedStructure = (
  primaryLengthMetric: string
): boolean => {
  return primaryLengthMetric === 'distance';
};

export const calculateAverageIntensity: CalculateAverageIntensity = (
  structure: unknown[],
  getPrimaryTarget: (step: unknown) => unknown | null,
  getMidpoint: (target: unknown) => number
): number => {
  const steps = getAllSteps(structure);
  if (steps.length === 0) return 0;

  const totalIntensity = steps.reduce((sum: number, step: unknown) => {
    const primaryTarget = getPrimaryTarget(step);
    const stepIntensity = primaryTarget ? getMidpoint(primaryTarget) : 0;
    return sum + stepIntensity;
  }, 0);

  return totalIntensity / steps.length;
};

export const formatStructureToString: FormatStructureToString = (
  totalDuration: number,
  stepCount: number,
  activeStepCount: number,
  repetitionCount: number
): string => {
  return `Workout Structure (${totalDuration}s, ${stepCount} steps, ${activeStepCount} active, ${repetitionCount} repetitions)`;
};

export const equalsWorkoutStructure: EqualsWorkoutStructure = (
  structure1: unknown,
  structure2: unknown
): boolean => {
  // This is a simplified implementation - in practice you'd need to compare all properties
  return JSON.stringify(structure1) === JSON.stringify(structure2);
};
