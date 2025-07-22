import type { WorkoutStructure } from '@/domain';

// Workout business logic
export type HasWorkoutFile = (
  fileContent?: string,
  fileName?: string
) => boolean;
export type HasWorkoutStructure = (structure?: WorkoutStructure) => boolean;
export type IsStructuredWorkout = (structure?: WorkoutStructure) => boolean;
export type IsFileBasedWorkout = (
  fileContent?: string,
  fileName?: string,
  structure?: WorkoutStructure
) => boolean;
export type IsRecentWorkout = (date: Date) => boolean;
export type IsLongWorkout = (duration: number) => boolean;
export type IsShortWorkout = (duration: number) => boolean;
export type GetFormattedDuration = (duration: number) => string;
export type GetFormattedDistance = (distance?: number) => string | undefined;
export type GetWorkoutType = (
  hasStructure: boolean,
  hasFile: boolean
) => 'structured' | 'file-based' | 'simple';
export type GetStructureStepsCount = (structure?: WorkoutStructure) => number;
export type GetStructureActiveStepsCount = (
  structure?: WorkoutStructure
) => number;
export type GetStructureRepetitionsCount = (
  structure?: WorkoutStructure
) => number;
export type IsTimeBasedWorkout = (structure?: WorkoutStructure) => boolean;
export type IsDistanceBasedWorkout = (structure?: WorkoutStructure) => boolean;
export type EqualsWorkout = (id1: string, id2: string) => boolean;
export type CalculateWorkoutDurationFromStructure = (
  structure: WorkoutStructure
) => number;
