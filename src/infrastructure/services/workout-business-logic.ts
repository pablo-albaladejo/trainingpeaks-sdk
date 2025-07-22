import type {
  CalculateWorkoutDurationFromStructure,
  EqualsWorkout,
  GetFormattedDistance,
  GetFormattedDuration,
  GetStructureActiveStepsCount,
  GetStructureRepetitionsCount,
  GetStructureStepsCount,
  GetWorkoutType,
  HasWorkoutFile,
  HasWorkoutStructure,
  IsDistanceBasedWorkout,
  IsFileBasedWorkout,
  IsLongWorkout,
  IsRecentWorkout,
  IsShortWorkout,
  IsStructuredWorkout,
  IsTimeBasedWorkout,
} from '@/application/services/workout-business-logic';
import type { WorkoutStructure } from '@/domain/value-objects/workout-structure-simple';

// Workout business logic implementations
export const hasWorkoutFile: HasWorkoutFile = (
  fileContent?: string,
  fileName?: string
): boolean => {
  return !!(fileContent && fileName);
};

export const hasWorkoutStructure: HasWorkoutStructure = (
  structure?: WorkoutStructure
): boolean => {
  return !!structure;
};

export const isStructuredWorkout: IsStructuredWorkout = (
  structure?: WorkoutStructure
): boolean => {
  return hasWorkoutStructure(structure);
};

export const isFileBasedWorkout: IsFileBasedWorkout = (
  fileContent?: string,
  fileName?: string,
  structure?: WorkoutStructure
): boolean => {
  return (
    hasWorkoutFile(fileContent, fileName) && !hasWorkoutStructure(structure)
  );
};

export const isRecentWorkout: IsRecentWorkout = (date: Date): boolean => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return date >= oneDayAgo;
};

export const isLongWorkout: IsLongWorkout = (duration: number): boolean => {
  return duration > 7200; // More than 2 hours
};

export const isShortWorkout: IsShortWorkout = (duration: number): boolean => {
  return duration < 1800; // Less than 30 minutes
};

export const getFormattedDuration: GetFormattedDuration = (
  duration: number
): string => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

export const getFormattedDistance: GetFormattedDistance = (
  distance?: number
): string | undefined => {
  if (!distance) return undefined;

  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(2)}km`;
  } else {
    return `${distance}m`;
  }
};

export const getWorkoutType: GetWorkoutType = (
  hasStructure: boolean,
  hasFile: boolean
): 'structured' | 'file-based' | 'simple' => {
  if (hasStructure) {
    return 'structured';
  } else if (hasFile) {
    return 'file-based';
  } else {
    return 'simple';
  }
};

export const getStructureStepsCount: GetStructureStepsCount = (
  structure?: WorkoutStructure
): number => {
  if (!structure) return 0;
  return structure.structure.flatMap((element) => element.steps).length;
};

export const getStructureActiveStepsCount: GetStructureActiveStepsCount = (
  structure?: WorkoutStructure
): number => {
  if (!structure) return 0;
  return structure.structure
    .flatMap((element) => element.steps)
    .filter((step) => step.intensityClass === 'active').length;
};

export const getStructureRepetitionsCount: GetStructureRepetitionsCount = (
  structure?: WorkoutStructure
): number => {
  if (!structure) return 0;
  return structure.structure.filter((element) => element.type === 'repetition')
    .length;
};

export const isTimeBasedWorkout: IsTimeBasedWorkout = (
  structure?: WorkoutStructure
): boolean => {
  return structure?.primaryLengthMetric === 'duration' || false;
};

export const isDistanceBasedWorkout: IsDistanceBasedWorkout = (
  structure?: WorkoutStructure
): boolean => {
  return structure?.primaryLengthMetric === 'distance' || false;
};

export const equalsWorkout: EqualsWorkout = (
  id1: string,
  id2: string
): boolean => {
  return id1 === id2;
};

export const calculateWorkoutDurationFromStructure: CalculateWorkoutDurationFromStructure =
  (structure: WorkoutStructure): number => {
    return structure.structure.reduce((total, element) => {
      return total + (element.end - element.begin);
    }, 0);
  };
