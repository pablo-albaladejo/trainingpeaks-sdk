/**
 * Workout Entity
 * Core business entity for workout management
 */

import type { Workout as WorkoutType } from '@/domain/schemas/entities.schema';
import type {
  WorkoutStructure,
  WorkoutStructureElement,
} from '@/domain/schemas/workout-structure.schema';
import { ValidationError } from '@/domain/errors/domain-errors';
import { WorkoutValidationError } from '@/domain/errors/workout-errors';

export type Workout = WorkoutType;
export type WorkoutElement = WorkoutStructureElement;

/**
 * Calculate total duration of workout structure
 */
export const calculateWorkoutDuration = (
  structure: WorkoutStructure
): number => {
  return structure.structure.reduce(
    (sum: number, element: WorkoutStructureElement) => {
      return sum + element.length.value;
    },
    0
  );
};

/**
 * Create a new Workout entity with domain invariants
 */
export const createWorkout = (
  id: string,
  name: string,
  date: Date,
  duration: number,
  description?: string,
  distance?: number,
  activityType?: string,
  structure?: WorkoutStructure,
  fileContent?: string,
  fileName?: string
): Workout => {
  // Validate invariants
  if (!id || id.trim().length === 0) {
    throw new ValidationError('Workout ID cannot be empty', 'id');
  }
  
  if (!name || name.trim().length === 0) {
    throw new ValidationError('Workout name cannot be empty', 'name');
  }
  
  if (name.trim().length > 200) {
    throw new ValidationError('Workout name cannot exceed 200 characters', 'name');
  }
  
  if (duration < 0) {
    throw new ValidationError('Workout duration cannot be negative', 'duration');
  }
  
  if (!isFinite(duration)) {
    throw new ValidationError('Workout duration must be a finite number', 'duration');
  }
  
  if (distance !== undefined && (distance < 0 || !isFinite(distance))) {
    throw new ValidationError('Workout distance must be a non-negative finite number', 'distance');
  }
  
  if (description && description.length > 1000) {
    throw new ValidationError('Workout description cannot exceed 1000 characters', 'description');
  }
  
  if (activityType && activityType.trim().length > 50) {
    throw new ValidationError('Activity type cannot exceed 50 characters', 'activityType');
  }
  
  if (fileName && fileName.trim().length > 255) {
    throw new ValidationError('File name cannot exceed 255 characters', 'fileName');
  }
  
  const now = new Date();
  
  return {
    id: id.trim(),
    name: name.trim(),
    description: description?.trim() || '',
    date,
    duration,
    distance,
    activityType: activityType?.trim(),
    structure,
    fileContent,
    fileName: fileName?.trim(),
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Create a structured workout with calculated duration
 */
export const createStructuredWorkout = (
  id: string,
  name: string,
  date: Date,
  structure: WorkoutStructure,
  description?: string,
  activityType?: string
): Workout => {
  if (!structure) {
    throw new WorkoutValidationError('Workout structure is required for structured workout');
  }
  
  if (!structure.structure || structure.structure.length === 0) {
    throw new WorkoutValidationError('Workout structure must contain at least one element');
  }
  
  const totalDuration = calculateWorkoutDuration(structure);

  return createWorkout(
    id,
    name,
    date,
    totalDuration,
    description,
    undefined,
    activityType,
    structure
  );
};

/**
 * Update workout with new data
 */
export const updateWorkout = (
  workout: Workout,
  updates: Partial<Pick<Workout, 'name' | 'description' | 'distance' | 'activityType'>>
): Workout => {
  // Validate updates
  if (updates.name !== undefined && (!updates.name || updates.name.trim().length === 0)) {
    throw new ValidationError('Workout name cannot be empty', 'name');
  }
  
  if (updates.name && updates.name.trim().length > 200) {
    throw new ValidationError('Workout name cannot exceed 200 characters', 'name');
  }
  
  if (updates.description && updates.description.length > 1000) {
    throw new ValidationError('Workout description cannot exceed 1000 characters', 'description');
  }
  
  if (updates.distance !== undefined && (updates.distance < 0 || !isFinite(updates.distance))) {
    throw new ValidationError('Workout distance must be a non-negative finite number', 'distance');
  }
  
  if (updates.activityType && updates.activityType.trim().length > 50) {
    throw new ValidationError('Activity type cannot exceed 50 characters', 'activityType');
  }
  
  return {
    ...workout,
    ...updates,
    name: updates.name?.trim() || workout.name,
    description: updates.description?.trim() ?? workout.description,
    activityType: updates.activityType?.trim() ?? workout.activityType,
    updatedAt: new Date(),
  };
};

/**
 * Check if workout is structured (has structure data)
 */
export const isStructuredWorkout = (workout: Workout): boolean => {
  return Boolean(workout.structure && workout.structure.structure.length > 0);
};

/**
 * Get workout total distance (prioritize structure calculation if available)
 */
export const getWorkoutDistance = (workout: Workout): number | undefined => {
  if (workout.distance !== undefined) {
    return workout.distance;
  }
  
  // Could implement structure-based distance calculation here
  return undefined;
};
