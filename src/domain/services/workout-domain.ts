/**
 * Workout Domain Service
 * Contains business logic for workout operations
 */

import { WorkoutRepository } from '@/application/ports/workout';
import { getSDKConfig } from '@/config';
import { Workout } from '@/domain/entities/workout';
import { WorkoutFile } from '@/domain/value-objects/workout-file';
import { WorkoutLength } from '@/domain/value-objects/workout-length';
import { WorkoutStep } from '@/domain/value-objects/workout-step';
import { WorkoutStructure } from '@/domain/value-objects/workout-structure';
import { WorkoutTarget } from '@/domain/value-objects/workout-target';
import {
  CreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse,
} from '@/types';

/**
 * Workout Domain Service Factory
 * Creates a workout domain service with business logic validation
 */
export const createWorkoutDomainService = (
  workoutRepository: WorkoutRepository
) => {
  const sdkConfig = getSDKConfig();

  /**
   * Create a structured workout with business logic validation
   */
  const createStructuredWorkout = async (
    athleteId: number,
    title: string,
    workoutTypeValueId: number,
    workoutDay: string,
    structure: WorkoutStructure,
    metadata?: {
      code?: string;
      description?: string;
      userTags?: string;
      coachComments?: string;
      publicSettingValue?: number;
      plannedMetrics?: {
        totalTimePlanned?: number;
        tssPlanned?: number;
        ifPlanned?: number;
        velocityPlanned?: number;
        caloriesPlanned?: number;
        distancePlanned?: number;
        elevationGainPlanned?: number;
        energyPlanned?: number;
      };
      equipment?: {
        bikeId?: number;
        shoeId?: number;
      };
    }
  ): Promise<CreateStructuredWorkoutResponse> => {
    // Validate business rules
    validateStructuredWorkoutBusinessRules(
      athleteId,
      title,
      workoutTypeValueId,
      workoutDay,
      structure
    );

    // Parse the workout date
    const workoutDate = new Date(workoutDay);
    if (isNaN(workoutDate.getTime())) {
      return {
        success: false,
        message: 'Invalid workout date format',
        errors: ['Workout date must be a valid ISO date string'],
      };
    }

    // Generate unique ID for the workout
    const workoutId = generateWorkoutId();

    // Create the structured workout entity
    const workout = Workout.createStructured(
      workoutId,
      title,
      metadata?.description || '',
      workoutDate,
      structure,
      mapWorkoutTypeToActivityType(workoutTypeValueId),
      metadata?.userTags
        ? metadata.userTags.split(',').map((tag) => tag.trim())
        : undefined
    );

    // Create the full API request object
    const apiRequest: CreateStructuredWorkoutRequest = {
      athleteId,
      title,
      workoutTypeValueId,
      workoutDay,
      structure,
      metadata,
    };

    // Delegate to repository
    return await workoutRepository.createStructuredWorkout(apiRequest);
  };

  /**
   * Create a structured workout from simplified elements
   */
  const createStructuredWorkoutFromSimpleStructure = async (
    athleteId: number,
    title: string,
    workoutTypeValueId: number,
    workoutDay: string,
    elements: {
      type: 'step' | 'repetition';
      repetitions?: number;
      steps: {
        name: string;
        duration: number; // in seconds
        intensityMin: number;
        intensityMax: number;
        intensityClass: 'active' | 'rest' | 'warmUp' | 'coolDown';
      }[];
    }[]
  ): Promise<CreateStructuredWorkoutResponse> => {
    // Build the structure from simple elements
    const structure = buildStructureFromSimpleElements(elements);

    // Create the workout
    return await createStructuredWorkout(
      athleteId,
      title,
      workoutTypeValueId,
      workoutDay,
      structure
    );
  };

  /**
   * Upload a workout with business logic validation
   */
  const uploadWorkout = async (
    fileContent: string,
    fileName: string,
    metadata?: {
      name?: string;
      description?: string;
      activityType?: string;
      tags?: string[];
      date?: Date;
      duration?: number;
      distance?: number;
    }
  ): Promise<{
    success: boolean;
    workoutId?: string;
    message: string;
    errors?: string[];
  }> => {
    // Validate file content
    validateWorkoutFile(fileContent, fileName);

    // Create workout file value object
    const workoutFile = WorkoutFile.create(
      fileName,
      fileContent,
      getMimeTypeFromFileName(fileName)
    );

    // Generate unique ID for the workout
    const workoutId = generateWorkoutId();

    // Create workout entity
    const workout = Workout.fromFile(
      workoutId,
      fileName,
      fileContent,
      metadata
    );

    // Delegate to repository
    return await workoutRepository.uploadWorkout(workout);
  };

  /**
   * Get workout by ID with business logic validation
   */
  const getWorkout = async (workoutId: string): Promise<Workout> => {
    validateWorkoutId(workoutId);

    const workout = await workoutRepository.getWorkout(workoutId);

    if (!workout) {
      throw new Error(`Workout not found: ${workoutId}`);
    }

    return workout;
  };

  /**
   * List workouts with business logic validation
   */
  const listWorkouts = async (
    filters: {
      startDate?: Date;
      endDate?: Date;
      activityType?: string;
      tags?: string[];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Workout[]> => {
    // Validate business rules for listing
    validateListWorkoutsFilters(filters);

    // Apply default pagination
    const normalizedFilters = {
      ...filters,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    };

    return await workoutRepository.listWorkouts(normalizedFilters);
  };

  /**
   * Delete workout with business logic validation
   */
  const deleteWorkout = async (workoutId: string): Promise<boolean> => {
    validateWorkoutId(workoutId);

    // First check if workout exists
    const existingWorkout = await workoutRepository.getWorkout(workoutId);
    if (!existingWorkout) {
      throw new Error(`Workout not found: ${workoutId}`);
    }

    // Check if workout can be deleted (business rules)
    validateWorkoutCanBeDeleted(existingWorkout);

    // Delete the workout
    return await workoutRepository.deleteWorkout(workoutId);
  };

  // Private helper functions

  /**
   * Validate structured workout business rules
   */
  const validateStructuredWorkoutBusinessRules = (
    athleteId: number,
    title: string,
    workoutTypeValueId: number,
    workoutDay: string,
    structure: WorkoutStructure
  ): void => {
    if (!athleteId || athleteId <= 0) {
      throw new Error('Valid athlete ID is required');
    }

    if (!title || title.trim().length === 0) {
      throw new Error('Workout title is required');
    }

    if (title.length > 100) {
      throw new Error('Workout title cannot exceed 100 characters');
    }

    if (!workoutTypeValueId || workoutTypeValueId <= 0) {
      throw new Error('Valid workout type ID is required');
    }

    if (!workoutDay) {
      throw new Error('Workout date is required');
    }

    if (!structure) {
      throw new Error('Workout structure is required');
    }

    // Validate structure has at least one element
    if (structure.structure.length === 0) {
      throw new Error('Workout structure must have at least one element');
    }

    // Validate total duration is reasonable
    const totalDuration = structure.getTotalDuration();
    if (totalDuration <= 0) {
      throw new Error('Workout structure must have positive duration');
    }

    if (totalDuration > 86400) {
      // 24 hours
      throw new Error('Workout structure cannot exceed 24 hours');
    }
  };

  /**
   * Validate workout file business rules
   */
  const validateWorkoutFile = (fileContent: string, fileName: string): void => {
    if (!fileContent || fileContent.trim().length === 0) {
      throw new Error('File content is required');
    }

    if (!fileName || fileName.trim().length === 0) {
      throw new Error('File name is required');
    }

    // Check file size (business rule)
    if (fileContent.length > 10 * 1024 * 1024) {
      // 10MB limit
      throw new Error('File size cannot exceed 10MB');
    }

    // Validate file extension
    const allowedExtensions = ['tcx', 'gpx', 'fit', 'xml'];
    const extension = fileName.toLowerCase().split('.').pop();
    if (!extension || !allowedExtensions.includes(extension)) {
      throw new Error(
        `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`
      );
    }
  };

  /**
   * Validate workout ID
   */
  const validateWorkoutId = (workoutId: string): void => {
    if (!workoutId || workoutId.trim().length === 0) {
      throw new Error('Workout ID is required');
    }

    // Additional business rules for workout ID format
    if (workoutId.length > 100) {
      throw new Error('Workout ID cannot exceed 100 characters');
    }
  };

  /**
   * Validate list workouts filters
   */
  const validateListWorkoutsFilters = (filters: {
    startDate?: Date;
    endDate?: Date;
    activityType?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): void => {
    // Validate date range
    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    ) {
      throw new Error('Start date must be before end date');
    }

    // Validate pagination
    if (filters.limit && filters.limit > 100) {
      throw new Error('Limit cannot exceed 100 workouts');
    }

    if (filters.offset && filters.offset < 0) {
      throw new Error('Offset cannot be negative');
    }

    // Validate activity type
    if (filters.activityType && filters.activityType.length > 50) {
      throw new Error('Activity type cannot exceed 50 characters');
    }

    // Validate tags
    if (filters.tags && filters.tags.length > 20) {
      throw new Error('Cannot filter by more than 20 tags');
    }
  };

  /**
   * Validate if workout can be deleted
   */
  const validateWorkoutCanBeDeleted = (workout: Workout): void => {
    // Business rules for deletion
    // For example, don't allow deletion of workouts that are part of a plan
    // or have been completed more than X days ago, etc.
    // For now, we'll allow all deletions
    // In a real implementation, this would contain actual business rules
  };

  /**
   * Build structure from simple elements
   */
  const buildStructureFromSimpleElements = (
    elements: {
      type: 'step' | 'repetition';
      repetitions?: number;
      steps: {
        name: string;
        duration: number;
        intensityMin: number;
        intensityMax: number;
        intensityClass: 'active' | 'rest' | 'warmUp' | 'coolDown';
      }[];
    }[]
  ): WorkoutStructure => {
    const structureElements = elements.map((element, index) => {
      const steps = element.steps.map((step) =>
        WorkoutStep.create(
          step.name,
          WorkoutLength.create(step.duration, 'second'),
          [WorkoutTarget.create(step.intensityMin, step.intensityMax)],
          step.intensityClass
        )
      );

      const totalDuration = element.steps.reduce(
        (sum, step) => sum + step.duration,
        0
      );
      const repetitions =
        element.type === 'repetition' ? element.repetitions || 1 : 1;
      const elementDuration = totalDuration * repetitions;

      // Calculate begin and end times
      const beginTime = elements.slice(0, index).reduce((sum, prevElement) => {
        const prevTotalDuration = prevElement.steps.reduce(
          (s, step) => s + step.duration,
          0
        );
        const prevRepetitions =
          prevElement.type === 'repetition' ? prevElement.repetitions || 1 : 1;
        return sum + prevTotalDuration * prevRepetitions;
      }, 0);

      return {
        type: element.type,
        length: WorkoutLength.create(
          repetitions,
          element.type === 'repetition' ? 'repetition' : 'second'
        ),
        steps,
        begin: beginTime,
        end: beginTime + elementDuration,
      };
    });

    // Generate polyline (simplified - just a flat line)
    const polyline = [
      [0, 0],
      [1, 0],
    ];

    // Create the structure
    return WorkoutStructure.create(
      structureElements,
      polyline,
      'duration',
      'percentOfThresholdPace',
      'range'
    );
  };

  /**
   * Generate unique workout ID
   */
  const generateWorkoutId = (): string => {
    return `workout_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  /**
   * Map workout type ID to activity type
   */
  const mapWorkoutTypeToActivityType = (workoutTypeValueId: number): string => {
    // Map workout type IDs to activity types
    // This is a simplified mapping - in a real implementation,
    // this would come from a configuration or lookup table
    const typeMap: Record<number, string> = {
      1: 'Running',
      2: 'Cycling',
      3: 'Swimming',
      4: 'Strength',
      5: 'Other',
    };

    return typeMap[workoutTypeValueId] || 'Other';
  };

  /**
   * Get MIME type from file name
   */
  const getMimeTypeFromFileName = (fileName: string): string => {
    const extension = fileName.toLowerCase().split('.').pop();

    switch (extension) {
      case 'tcx':
        return 'application/tcx+xml';
      case 'gpx':
        return 'application/gpx+xml';
      case 'fit':
        return 'application/fit';
      case 'xml':
        return 'application/xml';
      default:
        return 'application/octet-stream';
    }
  };

  // Return the service interface
  return {
    createStructuredWorkout,
    createStructuredWorkoutFromSimpleStructure,
    uploadWorkout,
    getWorkout,
    listWorkouts,
    deleteWorkout,
  };
};

// Export the type for dependency injection
export type WorkoutDomainService = ReturnType<
  typeof createWorkoutDomainService
>;
