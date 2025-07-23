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
 * Create a new Workout instance
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
): Workout => ({
  id,
  name,
  description: description || '',
  date,
  duration,
  distance,
  activityType,
  structure,
  fileContent,
  fileName,
  createdAt: new Date(),
  updatedAt: new Date(),
});

/**
 * Create a structured workout
 */
export const createStructuredWorkout = (
  id: string,
  name: string,
  date: Date,
  structure: WorkoutStructure,
  description?: string,
  activityType?: string
): Workout => {
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
