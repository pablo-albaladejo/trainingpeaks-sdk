/**
 * Workout Aggregate Root
 * Manages the consistency boundary between Workout entity and its WorkoutStructure
 * Implements Domain-Driven Design aggregate pattern for workout management
 */

import { ValidationError } from '@/domain/errors/domain-errors';
import { WorkoutStructureError,WorkoutValidationError } from '@/domain/errors/workout-errors';
import type { Workout } from '@/domain/schemas/entities.schema';
import type { WorkoutStructure } from '@/domain/schemas/workout-structure.schema';

import {
  calculateWorkoutDuration,
  createStructuredWorkout,
  createWorkout,
  updateWorkout,
} from './workout';

export interface WorkoutAggregate {
  readonly workout: Workout;
  readonly structure?: WorkoutStructure;
}

/**
 * Create a new Workout Aggregate
 */
export const createWorkoutAggregate = (
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
): WorkoutAggregate => {
  let workout: Workout;

  if (structure) {
    // For structured workouts, validate structure consistency
    validateWorkoutStructure(structure);
    const calculatedDuration = calculateWorkoutDuration(structure);

    // If duration is provided, it should match calculated duration
    if (Math.abs(duration - calculatedDuration) > 1) {
      throw new WorkoutValidationError(
        `Provided duration (${duration}s) does not match calculated duration (${calculatedDuration}s)`
      );
    }

    workout = createStructuredWorkout(
      id,
      name,
      date,
      structure,
      description,
      activityType
    );
  } else {
    workout = createWorkout(
      id,
      name,
      date,
      duration,
      description,
      distance,
      activityType,
      structure,
      fileContent,
      fileName
    );
  }

  return {
    workout,
    structure,
  };
};

/**
 * Update workout aggregate with new workout data
 */
export const updateWorkoutAggregate = (
  aggregate: WorkoutAggregate,
  updates: Partial<
    Pick<Workout, 'name' | 'description' | 'distance' | 'activityType'>
  >
): WorkoutAggregate => {
  const updatedWorkout = updateWorkout(aggregate.workout, updates);

  return {
    ...aggregate,
    workout: updatedWorkout,
  };
};

/**
 * Update workout structure and recalculate duration
 */
export const updateWorkoutStructure = (
  aggregate: WorkoutAggregate,
  newStructure: WorkoutStructure
): WorkoutAggregate => {
  validateWorkoutStructure(newStructure);

  const newDuration = calculateWorkoutDuration(newStructure);
  const updatedWorkout = {
    ...aggregate.workout,
    structure: newStructure,
    duration: newDuration,
    updatedAt: new Date(),
  };

  return {
    workout: updatedWorkout,
    structure: newStructure,
  };
};

/**
 * Remove structure from workout (convert to simple workout)
 */
export const removeWorkoutStructure = (
  aggregate: WorkoutAggregate,
  newDuration: number
): WorkoutAggregate => {
  if (newDuration < 0 || !isFinite(newDuration)) {
    throw new ValidationError('Duration must be a non-negative finite number', 'duration');
  }

  const updatedWorkout = {
    ...aggregate.workout,
    structure: undefined,
    duration: newDuration,
    updatedAt: new Date(),
  };

  return {
    workout: updatedWorkout,
    structure: undefined,
  };
};

/**
 * Add workout file data to aggregate
 */
export const addWorkoutFile = (
  aggregate: WorkoutAggregate,
  fileContent: string,
  fileName: string
): WorkoutAggregate => {
  if (!fileContent || !fileName) {
    throw new ValidationError('File content and name are required');
  }

  if (fileName.trim().length > 255) {
    throw new ValidationError('File name cannot exceed 255 characters', 'fileName');
  }

  const updatedWorkout = {
    ...aggregate.workout,
    fileContent,
    fileName: fileName.trim(),
    updatedAt: new Date(),
  };

  return {
    ...aggregate,
    workout: updatedWorkout,
  };
};

/**
 * Remove workout file data from aggregate
 */
export const removeWorkoutFile = (
  aggregate: WorkoutAggregate
): WorkoutAggregate => {
  const updatedWorkout = {
    ...aggregate.workout,
    fileContent: undefined,
    fileName: undefined,
    updatedAt: new Date(),
  };

  return {
    ...aggregate,
    workout: updatedWorkout,
  };
};

/**
 * Get aggregate total duration (prioritizes structure calculation)
 */
export const getAggregateDuration = (aggregate: WorkoutAggregate): number => {
  if (aggregate.structure) {
    return calculateWorkoutDuration(aggregate.structure);
  }
  return aggregate.workout.duration;
};

/**
 * Check if aggregate is in consistent state
 */
export const isAggregateConsistent = (aggregate: WorkoutAggregate): boolean => {
  try {
    // Check workout-structure consistency
    if (aggregate.structure) {
      const calculatedDuration = calculateWorkoutDuration(aggregate.structure);
      const durationDiff = Math.abs(
        aggregate.workout.duration - calculatedDuration
      );

      // Allow 1 second tolerance for rounding
      if (durationDiff > 1) {
        return false;
      }

      // Validate structure itself
      validateWorkoutStructure(aggregate.structure);
    }

    // Check file consistency
    if (aggregate.workout.fileContent && !aggregate.workout.fileName) {
      return false;
    }

    if (!aggregate.workout.fileContent && aggregate.workout.fileName) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Get aggregate summary for display
 */
export const getAggregateSummary = (aggregate: WorkoutAggregate) => {
  const { workout, structure } = aggregate;

  return {
    id: workout.id,
    name: workout.name,
    date: workout.date,
    duration: getAggregateDuration(aggregate),
    distance: workout.distance,
    activityType: workout.activityType,
    isStructured: Boolean(structure),
    hasFile: Boolean(workout.fileContent),
    structureElementCount: structure?.structure.length || 0,
    isConsistent: isAggregateConsistent(aggregate),
  };
};

/**
 * Validate workout structure integrity
 */
const validateWorkoutStructure = (structure: WorkoutStructure): void => {
  if (!structure.structure || structure.structure.length === 0) {
    throw new WorkoutStructureError('Workout structure must contain at least one element');
  }

  // Validate temporal consistency
  for (let i = 0; i < structure.structure.length - 1; i++) {
    const current = structure.structure[i];
    const next = structure.structure[i + 1];

    if (current && next && current.end > next.begin) {
      throw new WorkoutStructureError(
        `Structure elements overlap: element ${i} ends after element ${i + 1} begins`,
        { elementIndex: i, nextElementIndex: i + 1 }
      );
    }
  }

  // Validate each element has valid steps
  structure.structure.forEach((element, index) => {
    if (!element.steps || element.steps.length === 0) {
      throw new WorkoutStructureError(
        `Structure element ${index} must have at least one step`,
        { elementIndex: index }
      );
    }

    if (element.end <= element.begin) {
      throw new WorkoutStructureError(
        `Structure element ${index} end time must be greater than begin time`,
        { elementIndex: index, begin: element.begin, end: element.end }
      );
    }
  });
};
