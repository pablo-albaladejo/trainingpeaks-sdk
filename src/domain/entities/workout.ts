/**
 * Workout Entity
 * Core business entity for workout management
 */

import type { Workout as WorkoutType } from '@/domain/schemas/entities.schema';
import type {
  WorkoutStructure,
  WorkoutStructureElement,
} from '@/domain/schemas/workout-structure.schema';

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
    throw new Error('Workout ID cannot be empty');
  }
  
  if (!name || name.trim().length === 0) {
    throw new Error('Workout name cannot be empty');
  }
  
  if (name.trim().length > 200) {
    throw new Error('Workout name cannot exceed 200 characters');
  }
  
  if (duration < 0) {
    throw new Error('Workout duration cannot be negative');
  }
  
  if (!isFinite(duration)) {
    throw new Error('Workout duration must be a finite number');
  }
  
  if (distance !== undefined && (distance < 0 || !isFinite(distance))) {
    throw new Error('Workout distance must be a non-negative finite number');
  }
  
  if (description && description.length > 1000) {
    throw new Error('Workout description cannot exceed 1000 characters');
  }
  
  if (activityType && activityType.trim().length > 50) {
    throw new Error('Activity type cannot exceed 50 characters');
  }
  
  if (fileName && fileName.trim().length > 255) {
    throw new Error('File name cannot exceed 255 characters');
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
    throw new Error('Workout structure is required for structured workout');
  }
  
  if (!structure.structure || structure.structure.length === 0) {
    throw new Error('Workout structure must contain at least one element');
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
    throw new Error('Workout name cannot be empty');
  }
  
  if (updates.name && updates.name.trim().length > 200) {
    throw new Error('Workout name cannot exceed 200 characters');
  }
  
  if (updates.description && updates.description.length > 1000) {
    throw new Error('Workout description cannot exceed 1000 characters');
  }
  
  if (updates.distance !== undefined && (updates.distance < 0 || !isFinite(updates.distance))) {
    throw new Error('Workout distance must be a non-negative finite number');
  }
  
  if (updates.activityType && updates.activityType.trim().length > 50) {
    throw new Error('Activity type cannot exceed 50 characters');
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
